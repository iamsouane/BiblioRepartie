package com.gestionbu.ugb.controller;

import com.gestionbu.ugb.model.Auteur;
import com.gestionbu.ugb.repository.AuteurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
        
        // Vérifier si l'auteur existe déjà
        Optional<Auteur> existing = auteurRepository.findByNomAuteur(nomAuteur);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        // Créer un nouvel auteur sans ID
        Auteur auteur = new Auteur();
        auteur.setNomAuteur(nomAuteur);
        return auteurRepository.save(auteur);
    }
    
    @PutMapping("/{id}")
    public Auteur updateAuteur(@PathVariable Long id, @RequestBody Map<String, String> auteurDTO) {
        Auteur existing = auteurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auteur non trouvé"));
        existing.setNomAuteur(auteurDTO.get("nomAuteur"));
        return auteurRepository.save(existing);
    }
    
    @DeleteMapping("/{id}")
    public void deleteAuteur(@PathVariable Long id) {
        auteurRepository.deleteById(id);
    }
}
