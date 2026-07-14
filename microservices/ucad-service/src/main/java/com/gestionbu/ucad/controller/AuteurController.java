package com.gestionbu.ucad.controller;

import com.gestionbu.ucad.model.Auteur;
import com.gestionbu.ucad.repository.AuteurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auteurs")
public class AuteurController {
    
    @Autowired
    private AuteurRepository auteurRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${services.ugb:http://ugb-service:8080}")
    private String ugbServiceUrl;
    
    @Value("${services.uadb:http://uadb-service:8080}")
    private String uadbServiceUrl;
    
    @GetMapping
    public List<Auteur> getAllAuteurs() {
        return auteurRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public Auteur getAuteurById(@PathVariable Long id) {
        return auteurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auteur non trouvé"));
    }
    
    @PostMapping
    public Auteur createAuteur(@RequestBody Auteur auteur) {
        Auteur saved = auteurRepository.save(auteur);
        
        Map<String, String> auteurDTO = new HashMap<>();
        auteurDTO.put("nomAuteur", saved.getNomAuteur());
        
        try {
            restTemplate.postForObject(ugbServiceUrl + "/api/auteurs", auteurDTO, Object.class);
            System.out.println("Réplication CREATE réussie sur UGB");
        } catch (Exception e) {
            System.err.println("Erreur réplication sur UGB: " + e.getMessage());
        }
        try {
            restTemplate.postForObject(uadbServiceUrl + "/api/auteurs", auteurDTO, Object.class);
            System.out.println("Réplication CREATE réussie sur UADB");
        } catch (Exception e) {
            System.err.println("Erreur réplication sur UADB: " + e.getMessage());
        }
        return saved;
    }
    
    @PutMapping("/{id}")
    public Auteur updateAuteur(@PathVariable Long id, @RequestBody Auteur auteur) {
        Auteur existing = auteurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auteur non trouvé"));
        String ancienNom = existing.getNomAuteur();
        
        existing.setNomAuteur(auteur.getNomAuteur());
        Auteur updated = auteurRepository.save(existing);
        
        Map<String, String> updateDTO = new HashMap<>();
        updateDTO.put("ancienNom", ancienNom);
        updateDTO.put("nouveauNom", auteur.getNomAuteur());
        
        System.out.println("Tentative de mise à jour: " + ancienNom + " -> " + auteur.getNomAuteur());
        
        try {
            restTemplate.put(ugbServiceUrl + "/api/auteurs/update-by-name", updateDTO);
            System.out.println("Réplication UPDATE réussie sur UGB");
        } catch (Exception e) {
            System.err.println("Erreur mise à jour sur UGB: " + e.getMessage());
        }
        try {
            restTemplate.put(uadbServiceUrl + "/api/auteurs/update-by-name", updateDTO);
            System.out.println("Réplication UPDATE réussie sur UADB");
        } catch (Exception e) {
            System.err.println("Erreur mise à jour sur UADB: " + e.getMessage());
        }
        return updated;
    }
    
    @DeleteMapping("/{id}")
    public void deleteAuteur(@PathVariable Long id) {
        Auteur auteur = auteurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auteur non trouvé"));
        String nomAuteur = auteur.getNomAuteur();
        
        auteurRepository.deleteById(id);
        
        // Encoder le nom pour l'URL
        String encodedNom = URLEncoder.encode(nomAuteur, StandardCharsets.UTF_8);
        
        try {
            restTemplate.delete(ugbServiceUrl + "/api/auteurs/delete-by-name?nom=" + encodedNom);
            System.out.println("Réplication DELETE réussie sur UGB");
        } catch (Exception e) {
            System.err.println("Erreur suppression sur UGB: " + e.getMessage());
        }
        try {
            restTemplate.delete(uadbServiceUrl + "/api/auteurs/delete-by-name?nom=" + encodedNom);
            System.out.println("Réplication DELETE réussie sur UADB");
        } catch (Exception e) {
            System.err.println("Erreur suppression sur UADB: " + e.getMessage());
        }
    }
}
