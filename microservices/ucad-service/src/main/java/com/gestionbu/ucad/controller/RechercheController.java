package com.gestionbu.ucad.controller;

import com.gestionbu.ucad.model.Auteur;
import com.gestionbu.ucad.model.OuvrageUCAD;
import com.gestionbu.ucad.repository.AuteurRepository;
import com.gestionbu.ucad.repository.OuvrageUCADRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ouvrages")
public class RechercheController {
    
    @Autowired
    private OuvrageUCADRepository ouvrageRepository;
    
    @Autowired
    private AuteurRepository auteurRepository;
    
    @GetMapping("/recherche-globale")
    public List<Map<String, Object>> rechercheGlobale(@RequestParam String titre) {
        if (titre == null || titre.trim().isEmpty()) {
            return List.of();
        }
        String searchTerm = titre.toLowerCase().trim();
        
        // Récupérer tous les auteurs pour un lookup rapide
        Map<Long, String> auteurs = auteurRepository.findAll().stream()
                .collect(Collectors.toMap(Auteur::getIdAut, Auteur::getNomAuteur));
        
        return ouvrageRepository.findAll().stream()
                .filter(o -> o.getTitre() != null && o.getTitre().toLowerCase().contains(searchTerm))
                .map(o -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("idOuv", o.getIdOuv());
                    result.put("titre", o.getTitre());
                    result.put("auteurId", o.getAuteurId());
                    result.put("auteurNom", auteurs.getOrDefault(o.getAuteurId(), "Inconnu"));
                    result.put("editeur", o.getEditeur());
                    result.put("annee", o.getAnnee());
                    result.put("domaine", o.getDomaine());
                    result.put("stock", o.getStock());
                    result.put("site", o.getSite());
                    return result;
                })
                .collect(Collectors.toList());
    }
}
