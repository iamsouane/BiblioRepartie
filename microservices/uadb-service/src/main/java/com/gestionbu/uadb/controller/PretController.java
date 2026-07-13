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
    
    private String getSiteEtudiant(Long etudiantId) {
        if (etudiantRepository.existsById(etudiantId)) {
            return "UADB";
        }
        try {
            String url = ugbServiceUrl + "/api/etudiants/" + etudiantId + "/exists";
            Boolean exists = restTemplate.getForObject(url, Boolean.class);
            if (Boolean.TRUE.equals(exists)) {
                return "UGB";
            }
        } catch (Exception e) {}
        try {
            String url = ucadServiceUrl + "/api/etudiants/" + etudiantId + "/exists";
            Boolean exists = restTemplate.getForObject(url, Boolean.class);
            if (Boolean.TRUE.equals(exists)) {
                return "UCAD";
            }
        } catch (Exception e) {}
        throw new RuntimeException("Étudiant non trouvé sur aucun site");
    }
    
    private Integer getNbreEmprunts(Long etudiantId) {
        String site = getSiteEtudiant(etudiantId);
        if ("UADB".equals(site)) {
            EtudiantUADB etudiant = etudiantRepository.findById(etudiantId)
                    .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
            return etudiant.getNbreEmprunts();
        } else if ("UGB".equals(site)) {
            String url = ugbServiceUrl + "/api/etudiants/" + etudiantId + "/nbremprunts";
            return restTemplate.getForObject(url, Integer.class);
        } else {
            String url = ucadServiceUrl + "/api/etudiants/" + etudiantId + "/nbremprunts";
            return restTemplate.getForObject(url, Integer.class);
        }
    }
    
    private void incrementerNbreEmpruntsDistribue(Long etudiantId, String site) {
        if ("UADB".equals(site)) {
            etudiantRepository.incrementerNbreEmprunts(etudiantId);
        } else if ("UGB".equals(site)) {
            String url = ugbServiceUrl + "/api/etudiants/" + etudiantId + "/incrementer";
            restTemplate.put(url, null);
        } else if ("UCAD".equals(site)) {
            String url = ucadServiceUrl + "/api/etudiants/" + etudiantId + "/incrementer";
            restTemplate.put(url, null);
        }
    }
    
    private void decrementerNbreEmpruntsDistribue(Long etudiantId, String site) {
        if ("UADB".equals(site)) {
            etudiantRepository.decrementerNbreEmprunts(etudiantId);
        } else if ("UGB".equals(site)) {
            String url = ugbServiceUrl + "/api/etudiants/" + etudiantId + "/decrementer";
            restTemplate.put(url, null);
        } else if ("UCAD".equals(site)) {
            String url = ucadServiceUrl + "/api/etudiants/" + etudiantId + "/decrementer";
            restTemplate.put(url, null);
        }
    }
    
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
        
        OuvrageUADB ouvrage = ouvrageRepository.findById(request.getOuvrageId())
                .orElseThrow(() -> new RuntimeException("Ouvrage non trouvé sur UADB"));
        
        if (ouvrage.getStock() <= 0) {
            response.put("success", false);
            response.put("message", "Ouvrage indisponible sur UADB");
            return ResponseEntity.badRequest().body(response);
        }
        
        String siteEtudiant;
        try {
            siteEtudiant = getSiteEtudiant(request.getEtudiantId());
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Étudiant non trouvé sur aucun site");
            return ResponseEntity.badRequest().body(response);
        }
        
        Integer nbreEmprunts = getNbreEmprunts(request.getEtudiantId());
        if (nbreEmprunts >= 5) {
            response.put("success", false);
            response.put("message", "Limite d'emprunts atteinte (5 maximum)");
            response.put("nbreEmprunts", nbreEmprunts);
            return ResponseEntity.badRequest().body(response);
        }
        
        PretUADB pret = new PretUADB();
        pret.setOuvrageId(request.getOuvrageId());
        pret.setEtudiantId(request.getEtudiantId());
        pret.setDateEmprunt(LocalDate.now());
        pret = pretRepository.save(pret);
        
        ouvrageRepository.decrementerStock(request.getOuvrageId());
        
        try {
            incrementerNbreEmpruntsDistribue(request.getEtudiantId(), siteEtudiant);
        } catch (Exception e) {
            pretRepository.delete(pret);
            ouvrageRepository.incrementerStock(request.getOuvrageId());
            response.put("success", false);
            response.put("message", "Erreur lors de la transaction distribuée: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
        
        response.put("success", true);
        response.put("message", "Emprunt effectué avec succès");
        response.put("pret", pret);
        response.put("siteOuvrage", "UADB");
        response.put("siteEtudiant", siteEtudiant);
        response.put("nbreEmpruntsTotal", nbreEmprunts + 1);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/retourner")
    public ResponseEntity<Map<String, Object>> retourner(@RequestBody RetourRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        PretUADB pret = pretRepository.findById(request.getPretId())
                .orElseThrow(() -> new RuntimeException("Prêt non trouvé"));
        
        if (pret.getDateRetour() != null) {
            response.put("success", false);
            response.put("message", "Ce prêt a déjà été retourné");
            return ResponseEntity.badRequest().body(response);
        }
        
        String siteEtudiant = getSiteEtudiant(pret.getEtudiantId());
        pret.setDateRetour(LocalDate.now());
        pretRepository.save(pret);
        ouvrageRepository.incrementerStock(pret.getOuvrageId());
        
        try {
            decrementerNbreEmpruntsDistribue(pret.getEtudiantId(), siteEtudiant);
        } catch (Exception e) {
            response.put("warning", "Retour effectué mais erreur lors de la mise à jour du compteur: " + e.getMessage());
        }
        
        response.put("success", true);
        response.put("message", "Retour effectué avec succès");
        response.put("pret", pret);
        response.put("siteEtudiant", siteEtudiant);
        return ResponseEntity.ok(response);
    }
}
