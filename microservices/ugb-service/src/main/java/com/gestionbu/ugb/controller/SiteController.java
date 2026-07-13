package com.gestionbu.ugb.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/site")
public class SiteController {
    
    @Value("${bibliotheque.nom:UGB}")
    private String nom;
    
    @Value("${bibliotheque.site:UGB}")
    private String code;
    
    @Value("${server.port:8080}")
    private int port;
    
    @GetMapping
    public Map<String, Object> getSiteInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("code", code);
        info.put("nom", nom);
        info.put("port", port);
        return info;
    }
}
