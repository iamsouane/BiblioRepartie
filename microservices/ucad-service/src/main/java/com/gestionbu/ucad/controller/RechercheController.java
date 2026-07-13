package com.gestionbu.ucad.controller;

import com.gestionbu.ucad.model.OuvrageUCAD;
import com.gestionbu.ucad.repository.OuvrageUCADRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ouvrages")
public class RechercheController {
    
    @Autowired
    private OuvrageUCADRepository ouvrageRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${services.ugb:http://ugb-service:8080}")
    private String ugbServiceUrl;
    
    @Value("${services.uadb:http://uadb-service:8080}")
    private String uadbServiceUrl;
    
    @GetMapping("/recherche-globale")
    public List<Object> rechercheGlobale(@RequestParam(required = false, defaultValue = "") String titre) {
        List<Object> resultats = new ArrayList<>();
        
        if (titre == null || titre.trim().isEmpty()) {
            return resultats;
        }
        
        String searchTerm = titre.toLowerCase().trim();
        
        // 1. Rechercher localement (UCAD)
        List<OuvrageUCAD> locaux = ouvrageRepository.findAll().stream()
                .filter(o -> o.getTitre() != null && o.getTitre().toLowerCase().contains(searchTerm))
                .collect(Collectors.toList());
        resultats.addAll(locaux);
        
        // 2. Rechercher sur UGB
        try {
            String url = ugbServiceUrl + "/api/ouvrages/recherche-globale?titre=" + searchTerm;
            List<?> ugbResultats = restTemplate.getForObject(url, List.class);
            if (ugbResultats != null) {
                resultats.addAll(ugbResultats);
            }
        } catch (Exception e) {
            // Ignorer
        }
        
        // 3. Rechercher sur UADB
        try {
            String url = uadbServiceUrl + "/api/ouvrages/recherche-globale?titre=" + searchTerm;
            List<?> uadbResultats = restTemplate.getForObject(url, List.class);
            if (uadbResultats != null) {
                resultats.addAll(uadbResultats);
            }
        } catch (Exception e) {
            // Ignorer
        }
        
        return resultats;
    }
}
