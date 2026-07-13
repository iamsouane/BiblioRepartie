package com.gestionbu.ugb.controller;

import com.gestionbu.ugb.model.OuvrageUGB;
import com.gestionbu.ugb.repository.OuvrageUGBRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ouvrages")
public class RechercheController {
    
    @Autowired
    private OuvrageUGBRepository ouvrageRepository;
    
    @GetMapping("/recherche-globale")
    public List<OuvrageUGB> rechercheGlobale(@RequestParam(required = false, defaultValue = "") String titre) {
        if (titre == null || titre.trim().isEmpty()) {
            return List.of();
        }
        String searchTerm = titre.toLowerCase().trim();
        return ouvrageRepository.findAll().stream()
                .filter(o -> o.getTitre() != null && o.getTitre().toLowerCase().contains(searchTerm))
                .collect(Collectors.toList());
    }
}
