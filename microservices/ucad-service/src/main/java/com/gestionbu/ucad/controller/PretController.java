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
    
    // ServiceDiscovery amélioré avec logs
    private String getSiteEtudiant(Long etudiantId) {
        System.out.println("🔍 Recherche de l'étudiant " + etudiantId + "...");
        
        // 1. Vérifier localement (UCAD)
        if (etudiantRepository.existsById(etudiantId)) {
            System.out.println("✅ Étudiant trouvé sur UCAD");
            return "UCAD";
        }
        
        // 2. Interroger UGB
        try {
            String url = ugbServiceUrl + "/api/etudiants/" + etudiantId + "/exists";
            System.out.println("📡 Interrogation UGB: " + url);
            Boolean exists = restTemplate.getForObject(url, Boolean.class);
            if (Boolean.TRUE.equals(exists)) {
                System.out.println("✅ Étudiant trouvé sur UGB");
                return "UGB";
            }
        } catch (Exception e) {
            System.out.println("❌ Erreur UGB: " + e.getMessage());
        }
        
        // 3. Interroger UADB
        try {
            String url = uadbServiceUrl + "/api/etudiants/" + etudiantId + "/exists";
            System.out.println("📡 Interrogation UADB: " + url);
            Boolean exists = restTemplate.getForObject(url, Boolean.class);
            if (Boolean.TRUE.equals(exists)) {
                System.out.println("✅ Étudiant trouvé sur UADB");
                return "UADB";
            }
        } catch (Exception e) {
            System.out.println("❌ Erreur UADB: " + e.getMessage());
        }
        
        throw new RuntimeException("Étudiant " + etudiantId + " non trouvé sur aucun site");
    }
    
    private Integer getNbreEmprunts(Long etudiantId) {
        String site = getSiteEtudiant(etudiantId);
        System.out.println("📍 Site de l'étudiant: " + site);
        
        if ("UCAD".equals(site)) {
            EtudiantUCAD etudiant = etudiantRepository.findById(etudiantId)
                    .orElseThrow(() -> new RuntimeException("Étudiant non trouvé sur UCAD"));
            return etudiant.getNbreEmprunts();
        } else if ("UGB".equals(site)) {
            String url = ugbServiceUrl + "/api/etudiants/" + etudiantId + "/nbremprunts";
            return restTemplate.getForObject(url, Integer.class);
        } else {
            String url = uadbServiceUrl + "/api/etudiants/" + etudiantId + "/nbremprunts";
            return restTemplate.getForObject(url, Integer.class);
        }
    }
    
    private void incrementerNbreEmpruntsDistribue(Long etudiantId, String site) {
        System.out.println("📈 Incrémentation nbreEmprunts sur " + site + " pour étudiant " + etudiantId);
        
        if ("UCAD".equals(site)) {
            etudiantRepository.incrementerNbreEmprunts(etudiantId);
        } else if ("UGB".equals(site)) {
            String url = ugbServiceUrl + "/api/etudiants/" + etudiantId + "/incrementer";
            restTemplate.put(url, null);
        } else if ("UADB".equals(site)) {
            String url = uadbServiceUrl + "/api/etudiants/" + etudiantId + "/incrementer";
            restTemplate.put(url, null);
        }
    }
    
    private void decrementerNbreEmpruntsDistribue(Long etudiantId, String site) {
        System.out.println("📉 Décrémentation nbreEmprunts sur " + site + " pour étudiant " + etudiantId);
        
        if ("UCAD".equals(site)) {
            etudiantRepository.decrementerNbreEmprunts(etudiantId);
        } else if ("UGB".equals(site)) {
            String url = ugbServiceUrl + "/api/etudiants/" + etudiantId + "/decrementer";
            restTemplate.put(url, null);
        } else if ("UADB".equals(site)) {
            String url = uadbServiceUrl + "/api/etudiants/" + etudiantId + "/decrementer";
            restTemplate.put(url, null);
        }
    }
    
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
        
        System.out.println("📚 DEMANDE D'EMPRUNT: étudiant=" + request.getEtudiantId() + ", ouvrage=" + request.getOuvrageId());
        
        // 1. Vérifier que l'ouvrage existe et est disponible
        OuvrageUCAD ouvrage = ouvrageRepository.findById(request.getOuvrageId())
                .orElseThrow(() -> new RuntimeException("Ouvrage non trouvé sur UCAD"));
        
        if (ouvrage.getStock() <= 0) {
            response.put("success", false);
            response.put("message", "Ouvrage indisponible sur UCAD");
            return ResponseEntity.badRequest().body(response);
        }
        
        // 2. Déterminer dynamiquement le site de l'étudiant
        String siteEtudiant;
        try {
            siteEtudiant = getSiteEtudiant(request.getEtudiantId());
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Étudiant non trouvé sur aucun site: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
        
        // 3. Vérifier le nombre d'emprunts (limite de 5)
        Integer nbreEmprunts = getNbreEmprunts(request.getEtudiantId());
        System.out.println("📊 Nombre d'emprunts actuels: " + nbreEmprunts);
        
        if (nbreEmprunts >= 5) {
            response.put("success", false);
            response.put("message", "Limite d'emprunts atteinte (5 maximum)");
            response.put("nbreEmprunts", nbreEmprunts);
            return ResponseEntity.badRequest().body(response);
        }
        
        // 4. Créer le prêt sur le site de l'ouvrage (UCAD)
        PretUCAD pret = new PretUCAD();
        pret.setOuvrageId(request.getOuvrageId());
        pret.setEtudiantId(request.getEtudiantId());
        pret.setDateEmprunt(LocalDate.now());
        pret = pretRepository.save(pret);
        
        // 5. Décrémenter le stock
        ouvrageRepository.decrementerStock(request.getOuvrageId());
        
        // 6. Incrémenter nbreEmprunts (transaction distribuée)
        try {
            incrementerNbreEmpruntsDistribue(request.getEtudiantId(), siteEtudiant);
        } catch (Exception e) {
            // ROLLBACK
            System.err.println("❌ ERREUR transaction distribuée: " + e.getMessage());
            pretRepository.delete(pret);
            ouvrageRepository.incrementerStock(request.getOuvrageId());
            
            response.put("success", false);
            response.put("message", "Erreur lors de la transaction distribuée: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
        
        response.put("success", true);
        response.put("message", "Emprunt effectué avec succès");
        response.put("pret", pret);
        response.put("siteOuvrage", "UCAD");
        response.put("siteEtudiant", siteEtudiant);
        response.put("nbreEmpruntsTotal", nbreEmprunts + 1);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/retourner")
    public ResponseEntity<Map<String, Object>> retourner(@RequestBody RetourRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        PretUCAD pret = pretRepository.findById(request.getPretId())
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
