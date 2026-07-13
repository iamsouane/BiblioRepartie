package com.gestionbu.ugb.controller;

import com.gestionbu.ugb.model.Auteur;
import com.gestionbu.ugb.repository.AuteurRepository;
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
    
    @PostMapping
    public Auteur createAuteur(@RequestBody Auteur auteur) {
        return auteurRepository.save(auteur);
    }
}
