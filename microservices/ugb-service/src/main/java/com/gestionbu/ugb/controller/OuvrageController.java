package com.gestionbu.ugb.controller;

import com.gestionbu.ugb.model.OuvrageUGB;
import com.gestionbu.ugb.repository.OuvrageUGBRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ouvrages")
public class OuvrageController {
    
    @Autowired
    private OuvrageUGBRepository ouvrageRepository;
    
    @GetMapping
    public List<OuvrageUGB> getAllOuvrages() {
        return ouvrageRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public OuvrageUGB getOuvrageById(@PathVariable Long id) {
        return ouvrageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ouvrage non trouvé"));
    }
    
    @GetMapping("/domaine/{domaine}")
    public List<OuvrageUGB> getOuvragesByDomaine(@PathVariable String domaine) {
        return ouvrageRepository.findByDomaine(domaine);
    }
    
    @PostMapping
    public OuvrageUGB createOuvrage(@RequestBody OuvrageUGB ouvrage) {
        return ouvrageRepository.save(ouvrage);
    }
}
