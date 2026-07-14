package com.gestionbu.ugb.controller;

import com.gestionbu.ugb.dto.EmpruntRequest;
import com.gestionbu.ugb.dto.RetourRequest;
import com.gestionbu.ugb.model.PretUGB;
import com.gestionbu.ugb.model.OuvrageUGB;
import com.gestionbu.ugb.model.EtudiantUGB;
import com.gestionbu.ugb.repository.EtudiantUGBRepository;
import com.gestionbu.ugb.repository.OuvrageUGBRepository;
import com.gestionbu.ugb.repository.PretUGBRepository;
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
    private PretUGBRepository pretRepository;
    
    @Autowired
    private OuvrageUGBRepository ouvrageRepository;
    
    @Autowired
    private EtudiantUGBRepository etudiantRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${services.ucad:http://ucad-service:8080}")
    private String ucadServiceUrl;
    
    @Value("${services.uadb:http://uadb-service:8080}")
    private String uadbServiceUrl;
    
    @GetMapping
    public List<PretUGB> getAllPrets() {
        return pretRepository.findAll();
    }
    
    @GetMapping("/etudiant/{etudiantId}")
    public List<PretUGB> getPretsByEtudiant(@PathVariable Long etudiantId) {
        return pretRepository.findByEtudiantId(etudiantId);
    }
    
    @PostMapping("/emprunter")
    public ResponseEntity<Map<String, Object>> emprunter(@RequestBody EmpruntRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            OuvrageUGB ouvrage = ouvrageRepository.findById(request.getOuvrageId())
                    .orElseThrow(() -> new RuntimeException("Ouvrage non trouvé sur UGB"));
            
            if (ouvrage.getStock() <= 0) {
                response.put("success", false);
                response.put("message", "Ouvrage indisponible sur UGB");
                return ResponseEntity.badRequest().body(response);
            }
            
            String siteEtudiant = "UGB";
            Long etudiantId = request.getEtudiantId();
            if (etudiantId >= 1000 && etudiantId < 2000) siteEtudiant = "UGB";
            else if (etudiantId >= 2000 && etudiantId < 3000) siteEtudiant = "UCAD";
            else if (etudiantId >= 3000 && etudiantId < 4000) siteEtudiant = "UADB";
            
            PretUGB pret = new PretUGB();
            pret.setOuvrageId(request.getOuvrageId());
            pret.setEtudiantId(request.getEtudiantId());
            pret.setDateEmprunt(LocalDate.now());
            pret = pretRepository.save(pret);
            
            ouvrageRepository.decrementerStock(request.getOuvrageId());
            
            if ("UGB".equals(siteEtudiant)) {
                etudiantRepository.incrementerNbreEmprunts(request.getEtudiantId());
            } else if ("UCAD".equals(siteEtudiant)) {
                String url = ucadServiceUrl + "/api/etudiants/" + request.getEtudiantId() + "/incrementer";
                restTemplate.put(url, null);
            } else if ("UADB".equals(siteEtudiant)) {
                String url = uadbServiceUrl + "/api/etudiants/" + request.getEtudiantId() + "/incrementer";
                restTemplate.put(url, null);
            }
            
            response.put("success", true);
            response.put("message", "Emprunt effectué avec succès");
            response.put("pret", pret);
            response.put("siteOuvrage", "UGB");
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
            PretUGB pret = pretRepository.findById(request.getPretId())
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
            String siteEtudiant = "UGB";
            if (etudiantId >= 1000 && etudiantId < 2000) siteEtudiant = "UGB";
            else if (etudiantId >= 2000 && etudiantId < 3000) siteEtudiant = "UCAD";
            else if (etudiantId >= 3000 && etudiantId < 4000) siteEtudiant = "UADB";
            
            if ("UGB".equals(siteEtudiant)) {
                etudiantRepository.decrementerNbreEmprunts(etudiantId);
            } else if ("UCAD".equals(siteEtudiant)) {
                String url = ucadServiceUrl + "/api/etudiants/" + etudiantId + "/decrementer";
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
