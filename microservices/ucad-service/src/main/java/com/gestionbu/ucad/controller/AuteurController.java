package com.gestionbu.ucad.controller;

import com.gestionbu.ucad.model.Auteur;
import com.gestionbu.ucad.repository.AuteurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public Auteur createAuteur(@RequestBody Auteur auteur) {
        return auteurRepository.save(auteur);
    }
    
    @PutMapping("/{id}")
    public Auteur updateAuteur(@PathVariable Long id, @RequestBody Auteur auteur) {
        Auteur existing = auteurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auteur non trouvé"));
        existing.setNomAuteur(auteur.getNomAuteur());
        return auteurRepository.save(existing);
    }
    
    @DeleteMapping("/{id}")
    public void deleteAuteur(@PathVariable Long id) {
        auteurRepository.deleteById(id);
    }
}
