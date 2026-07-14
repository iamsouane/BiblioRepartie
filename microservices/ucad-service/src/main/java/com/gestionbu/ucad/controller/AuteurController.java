package com.gestionbu.ucad.controller;

import com.gestionbu.ucad.model.Auteur;
import com.gestionbu.ucad.repository.AuteurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

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
        
        // Créer un DTO sans l'ID pour la réplication
        Map<String, String> auteurDTO = new HashMap<>();
        auteurDTO.put("nomAuteur", saved.getNomAuteur());
        
        try {
            restTemplate.postForObject(ugbServiceUrl + "/api/auteurs", auteurDTO, Object.class);
        } catch (Exception e) {
            System.err.println("Erreur réplication sur UGB: " + e.getMessage());
        }
        try {
            restTemplate.postForObject(uadbServiceUrl + "/api/auteurs", auteurDTO, Object.class);
        } catch (Exception e) {
            System.err.println("Erreur réplication sur UADB: " + e.getMessage());
        }
        return saved;
    }
    
    @PutMapping("/{id}")
    public Auteur updateAuteur(@PathVariable Long id, @RequestBody Auteur auteur) {
        Auteur existing = auteurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auteur non trouvé"));
        existing.setNomAuteur(auteur.getNomAuteur());
        Auteur updated = auteurRepository.save(existing);
        
        // Créer un DTO pour la mise à jour
        Map<String, String> auteurDTO = new HashMap<>();
        auteurDTO.put("nomAuteur", updated.getNomAuteur());
        
        try {
            restTemplate.put(ugbServiceUrl + "/api/auteurs/" + id, auteurDTO);
        } catch (Exception e) {
            System.err.println("Erreur mise à jour sur UGB: " + e.getMessage());
        }
        try {
            restTemplate.put(uadbServiceUrl + "/api/auteurs/" + id, auteurDTO);
        } catch (Exception e) {
            System.err.println("Erreur mise à jour sur UADB: " + e.getMessage());
        }
        return updated;
    }
    
    @DeleteMapping("/{id}")
    public void deleteAuteur(@PathVariable Long id) {
        auteurRepository.deleteById(id);
        try {
            restTemplate.delete(ugbServiceUrl + "/api/auteurs/" + id);
        } catch (Exception e) {
            System.err.println("Erreur suppression sur UGB: " + e.getMessage());
        }
        try {
            restTemplate.delete(uadbServiceUrl + "/api/auteurs/" + id);
        } catch (Exception e) {
            System.err.println("Erreur suppression sur UADB: " + e.getMessage());
        }
    }
}
