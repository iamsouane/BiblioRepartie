package com.gestionbu.uadb.controller;

import com.gestionbu.uadb.model.OuvrageUADB;
import com.gestionbu.uadb.repository.OuvrageUADBRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ouvrages")
public class OuvrageController {
    
    @Autowired
    private OuvrageUADBRepository ouvrageRepository;
    
    @GetMapping
    public List<OuvrageUADB> getAllOuvrages() {
        return ouvrageRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public OuvrageUADB getOuvrageById(@PathVariable Long id) {
        return ouvrageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ouvrage non trouvé"));
    }
    
    @GetMapping("/domaine/{domaine}")
    public List<OuvrageUADB> getOuvragesByDomaine(@PathVariable String domaine) {
        return ouvrageRepository.findByDomaine(domaine);
    }
    
    @PostMapping
    public OuvrageUADB createOuvrage(@RequestBody OuvrageUADB ouvrage) {
        return ouvrageRepository.save(ouvrage);
    }
}
