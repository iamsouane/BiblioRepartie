package com.gestionbu.ucad.controller;

import com.gestionbu.ucad.dto.EmpruntRequest;
import com.gestionbu.ucad.dto.RetourRequest;
import com.gestionbu.ucad.model.PretUCAD;
import com.gestionbu.ucad.model.OuvrageUCAD;
import com.gestionbu.ucad.model.EtudiantUCAD;
import com.gestionbu.ucad.repository.EtudiantUCADRepository;
import com.gestionbu.ucad.repository.OuvrageUCADRepository;
import com.gestionbu.ucad.repository.PretUCADRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prets")
public class PretController {
    
    @Autowired
    private PretUCADRepository pretRepository;
    
    @Autowired
    private OuvrageUCADRepository ouvrageRepository;
    
    @Autowired
    private EtudiantUCADRepository etudiantRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${services.ugb:http://ugb-service:8080}")
    private String ugbServiceUrl;
    
    @Value("${services.uadb:http://uadb-service:8080}")
    private String uadbServiceUrl;
    
    @GetMapping
    public List<PretUCAD> getAllPrets() {
        return pretRepository.findAll();
    }
    
    @GetMapping("/etudiant/{etudiantId}")
    public List<PretUCAD> getPretsByEtudiant(@PathVariable Long etudiantId) {
        return pretRepository.findByEtudiantId(etudiantId);
    }
    
    @PostMapping("/emprunter")
    public ResponseEntity<Map<String, Object>> emprunter(@RequestBody EmpruntRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Vérifier que l'ouvrage existe et est disponible
            OuvrageUCAD ouvrage = ouvrageRepository.findById(request.getOuvrageId())
                    .orElseThrow(() -> new RuntimeException("Ouvrage non trouvé sur UCAD"));
            
            if (ouvrage.getStock() <= 0) {
                response.put("success", false);
                response.put("message", "Ouvrage indisponible sur UCAD");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Déterminer le site de l'étudiant
            String siteEtudiant = "UCAD";
            Long etudiantId = request.getEtudiantId();
            if (etudiantId >= 1000 && etudiantId < 2000) {
                siteEtudiant = "UGB";
            } else if (etudiantId >= 2000 && etudiantId < 3000) {
                siteEtudiant = "UCAD";
            } else if (etudiantId >= 3000 && etudiantId < 4000) {
                siteEtudiant = "UADB";
            }
            
            // Créer le prêt
            PretUCAD pret = new PretUCAD();
            pret.setOuvrageId(request.getOuvrageId());
            pret.setEtudiantId(request.getEtudiantId());
            pret.setDateEmprunt(LocalDate.now());
            pret = pretRepository.save(pret);
            
            // Décrémenter le stock
            ouvrageRepository.decrementerStock(request.getOuvrageId());
            
            // Incrémenter nbreEmprunts sur le site de l'étudiant
            if ("UCAD".equals(siteEtudiant)) {
                etudiantRepository.incrementerNbreEmprunts(request.getEtudiantId());
            } else if ("UGB".equals(siteEtudiant)) {
                String url = ugbServiceUrl + "/api/etudiants/" + request.getEtudiantId() + "/incrementer";
                restTemplate.put(url, null);
            } else if ("UADB".equals(siteEtudiant)) {
                String url = uadbServiceUrl + "/api/etudiants/" + request.getEtudiantId() + "/incrementer";
                restTemplate.put(url, null);
            }
            
            response.put("success", true);
            response.put("message", "Emprunt effectué avec succès");
            response.put("pret", pret);
            response.put("siteOuvrage", "UCAD");
            response.put("siteEtudiant", siteEtudiant);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @PostMapping("/retourner")
    public ResponseEntity<Map<String, Object>> retourner(@RequestBody RetourRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            PretUCAD pret = pretRepository.findById(request.getPretId())
                    .orElseThrow(() -> new RuntimeException("Prêt non trouvé"));
            
            if (pret.getDateRetour() != null) {
                response.put("success", false);
                response.put("message", "Ce prêt a déjà été retourné");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Mettre à jour la date de retour
            pret.setDateRetour(LocalDate.now());
            pretRepository.save(pret);
            
            // Incrémenter le stock
            ouvrageRepository.incrementerStock(pret.getOuvrageId());
            
            // Décrémenter nbreEmprunts sur le site de l'étudiant
            Long etudiantId = pret.getEtudiantId();
            String siteEtudiant = "UCAD";
            if (etudiantId >= 1000 && etudiantId < 2000) {
                siteEtudiant = "UGB";
            } else if (etudiantId >= 2000 && etudiantId < 3000) {
                siteEtudiant = "UCAD";
            } else if (etudiantId >= 3000 && etudiantId < 4000) {
                siteEtudiant = "UADB";
            }
            
            if ("UCAD".equals(siteEtudiant)) {
                etudiantRepository.decrementerNbreEmprunts(etudiantId);
            } else if ("UGB".equals(siteEtudiant)) {
                String url = ugbServiceUrl + "/api/etudiants/" + etudiantId + "/decrementer";
                restTemplate.put(url, null);
            } else if ("UADB".equals(siteEtudiant)) {
                String url = uadbServiceUrl + "/api/etudiants/" + etudiantId + "/decrementer";
                restTemplate.put(url, null);
            }
            
            response.put("success", true);
            response.put("message", "Retour effectué avec succès");
            response.put("pret", pret);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
