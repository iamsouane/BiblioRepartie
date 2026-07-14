package com.gestionbu.ugb.controller;

import com.gestionbu.ugb.model.Auteur;
import com.gestionbu.ugb.repository.AuteurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auteurs")
public class AuteurController {
    
    @Autowired
    private AuteurRepository auteurRepository;
    
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
    public Auteur createAuteur(@RequestBody Map<String, String> auteurDTO) {
        String nomAuteur = auteurDTO.get("nomAuteur");
        Optional<Auteur> existing = auteurRepository.findByNomAuteur(nomAuteur);
        if (existing.isPresent()) {
            return existing.get();
        }
        Auteur auteur = new Auteur();
        auteur.setNomAuteur(nomAuteur);
        return auteurRepository.save(auteur);
    }
    
    @PutMapping("/{id}")
    public Auteur updateAuteur(@PathVariable Long id, @RequestBody Map<String, String> auteurDTO) {
        Auteur existing = auteurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auteur non trouvé avec ID: " + id));
        existing.setNomAuteur(auteurDTO.get("nomAuteur"));
        return auteurRepository.save(existing);
    }
    
    @PutMapping("/update-by-name")
    public Auteur updateAuteurByName(@RequestBody Map<String, String> updateDTO) {
        String ancienNom = updateDTO.get("ancienNom");
        String nouveauNom = updateDTO.get("nouveauNom");
        
        System.out.println("UGB - Mise à jour: " + ancienNom + " -> " + nouveauNom);
        
        Auteur existing = auteurRepository.findByNomAuteur(ancienNom)
                .orElseThrow(() -> new RuntimeException("Auteur non trouvé avec le nom: " + ancienNom));
        existing.setNomAuteur(nouveauNom);
        return auteurRepository.save(existing);
    }
    
    @DeleteMapping("/{id}")
    public void deleteAuteur(@PathVariable Long id) {
        auteurRepository.deleteById(id);
    }
    
    @DeleteMapping("/delete-by-name")
    public void deleteAuteurByName(@RequestParam String nom) {
        String nomAuteur = URLDecoder.decode(nom, StandardCharsets.UTF_8);
        System.out.println("UGB - Suppression: " + nomAuteur);
        Auteur auteur = auteurRepository.findByNomAuteur(nomAuteur)
                .orElseThrow(() -> new RuntimeException("Auteur non trouvé avec le nom: " + nomAuteur));
        auteurRepository.deleteById(auteur.getIdAut());
    }
}
