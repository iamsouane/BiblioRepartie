package com.gestionbu.uadb.controller;

import com.gestionbu.uadb.dto.EmpruntRequest;
import com.gestionbu.uadb.dto.RetourRequest;
import com.gestionbu.uadb.model.PretUADB;
import com.gestionbu.uadb.model.OuvrageUADB;
import com.gestionbu.uadb.model.EtudiantUADB;
import com.gestionbu.uadb.repository.EtudiantUADBRepository;
import com.gestionbu.uadb.repository.OuvrageUADBRepository;
import com.gestionbu.uadb.repository.PretUADBRepository;
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
    private PretUADBRepository pretRepository;
    
    @Autowired
    private OuvrageUADBRepository ouvrageRepository;
    
    @Autowired
    private EtudiantUADBRepository etudiantRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${services.ugb:http://ugb-service:8080}")
    private String ugbServiceUrl;
    
    @Value("${services.ucad:http://ucad-service:8080}")
    private String ucadServiceUrl;
    
    @GetMapping
    public List<PretUADB> getAllPrets() {
        return pretRepository.findAll();
    }
    
    @GetMapping("/etudiant/{etudiantId}")
    public List<PretUADB> getPretsByEtudiant(@PathVariable Long etudiantId) {
        return pretRepository.findByEtudiantId(etudiantId);
    }
    
    @PostMapping("/emprunter")
    public ResponseEntity<Map<String, Object>> emprunter(@RequestBody EmpruntRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            OuvrageUADB ouvrage = ouvrageRepository.findById(request.getOuvrageId())
                    .orElseThrow(() -> new RuntimeException("Ouvrage non trouvé sur UADB"));
            
            if (ouvrage.getStock() <= 0) {
                response.put("success", false);
                response.put("message", "Ouvrage indisponible sur UADB");
                return ResponseEntity.badRequest().body(response);
            }
            
            String siteEtudiant = "UADB";
            Long etudiantId = request.getEtudiantId();
            if (etudiantId >= 1000 && etudiantId < 2000) siteEtudiant = "UGB";
            else if (etudiantId >= 2000 && etudiantId < 3000) siteEtudiant = "UCAD";
            else if (etudiantId >= 3000 && etudiantId < 4000) siteEtudiant = "UADB";
            
            PretUADB pret = new PretUADB();
            pret.setOuvrageId(request.getOuvrageId());
            pret.setEtudiantId(request.getEtudiantId());
            pret.setDateEmprunt(LocalDate.now());
            pret = pretRepository.save(pret);
            
            ouvrageRepository.decrementerStock(request.getOuvrageId());
            
            if ("UADB".equals(siteEtudiant)) {
                etudiantRepository.incrementerNbreEmprunts(request.getEtudiantId());
            } else if ("UGB".equals(siteEtudiant)) {
                String url = ugbServiceUrl + "/api/etudiants/" + request.getEtudiantId() + "/incrementer";
                restTemplate.put(url, null);
            } else if ("UCAD".equals(siteEtudiant)) {
                String url = ucadServiceUrl + "/api/etudiants/" + request.getEtudiantId() + "/incrementer";
                restTemplate.put(url, null);
            }
            
            response.put("success", true);
            response.put("message", "Emprunt effectué avec succès");
            response.put("pret", pret);
            response.put("siteOuvrage", "UADB");
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
            PretUADB pret = pretRepository.findById(request.getPretId())
                    .orElseThrow(() -> new RuntimeException("Prêt non trouvé"));
            
            if (pret.getDateRetour() != null) {
                response.put("success", false);
                response.put("message", "Ce prêt a déjà été retourné");
                return ResponseEntity.badRequest().body(response);
            }
            
            pret.setDateRetour(LocalDate.now());
            pretRepository.save(pret);
            
            ouvrageRepository.incrementerStock(pret.getOuvrageId());
            
            Long etudiantId = pret.getEtudiantId();
            String siteEtudiant = "UADB";
            if (etudiantId >= 1000 && etudiantId < 2000) siteEtudiant = "UGB";
            else if (etudiantId >= 2000 && etudiantId < 3000) siteEtudiant = "UCAD";
            else if (etudiantId >= 3000 && etudiantId < 4000) siteEtudiant = "UADB";
            
            if ("UADB".equals(siteEtudiant)) {
                etudiantRepository.decrementerNbreEmprunts(etudiantId);
            } else if ("UGB".equals(siteEtudiant)) {
                String url = ugbServiceUrl + "/api/etudiants/" + etudiantId + "/decrementer";
                restTemplate.put(url, null);
            } else if ("UCAD".equals(siteEtudiant)) {
                String url = ucadServiceUrl + "/api/etudiants/" + etudiantId + "/decrementer";
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
