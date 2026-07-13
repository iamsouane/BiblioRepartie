package com.gestionbu.ugb.controller;

import com.gestionbu.ugb.model.Auteur;
import com.gestionbu.ugb.model.OuvrageUGB;
import com.gestionbu.ugb.repository.AuteurRepository;
import com.gestionbu.ugb.repository.OuvrageUGBRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ouvrages")
public class RechercheController {
    
    @Autowired
    private OuvrageUGBRepository ouvrageRepository;
    
    @Autowired
    private AuteurRepository auteurRepository;
    
    @GetMapping("/recherche-globale")
    public List<Map<String, Object>> rechercheGlobale(@RequestParam(required = false) String titre) {
        // Décoder le paramètre pour gérer les caractères spéciaux
        String decodedTitre = titre != null ? URLDecoder.decode(titre, StandardCharsets.UTF_8) : "";
        
        if (decodedTitre == null || decodedTitre.trim().isEmpty()) {
            return List.of();
        }
        String searchTerm = decodedTitre.toLowerCase().trim();
        
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
