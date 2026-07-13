package com.gestionbu.ucad.controller;

import com.gestionbu.ucad.model.OuvrageUCAD;
import com.gestionbu.ucad.repository.OuvrageUCADRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ouvrages")
public class OuvrageController {
    
    @Autowired
    private OuvrageUCADRepository ouvrageRepository;
    
    @GetMapping
    public List<OuvrageUCAD> getAllOuvrages() {
        return ouvrageRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public OuvrageUCAD getOuvrageById(@PathVariable Long id) {
        return ouvrageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ouvrage non trouvé"));
    }
    
    @GetMapping("/domaine/{domaine}")
    public List<OuvrageUCAD> getOuvragesByDomaine(@PathVariable String domaine) {
        return ouvrageRepository.findByDomaine(domaine);
    }
    
    @PostMapping
    public OuvrageUCAD createOuvrage(@RequestBody OuvrageUCAD ouvrage) {
        return ouvrageRepository.save(ouvrage);
    }
}