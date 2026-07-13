package com.gestionbu.ugb.controller;

import com.gestionbu.ugb.model.EtudiantUGB;
import com.gestionbu.ugb.repository.EtudiantUGBRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/etudiants")
public class EtudiantController {
    
    @Autowired
    private EtudiantUGBRepository etudiantRepository;
    
    @GetMapping
    public List<EtudiantUGB> getAllEtudiants() {
        return etudiantRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public EtudiantUGB getEtudiantById(@PathVariable Long id) {
        return etudiantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
    }
    
    @PostMapping
    public EtudiantUGB createEtudiant(@RequestBody EtudiantUGB etudiant) {
        return etudiantRepository.save(etudiant);
    }
    
    @GetMapping("/{id}/nbremprunts")
    public Integer getNbreEmprunts(@PathVariable Long id) {
        EtudiantUGB etudiant = etudiantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
        return etudiant.getNbreEmprunts();
    }
    
    @PutMapping("/{id}/incrementer")
    public void incrementerNbreEmprunts(@PathVariable Long id) {
        etudiantRepository.incrementerNbreEmprunts(id);
    }
    
    @PutMapping("/{id}/decrementer")
    public void decrementerNbreEmprunts(@PathVariable Long id) {
        etudiantRepository.decrementerNbreEmprunts(id);
    }
    
    @GetMapping("/{id}/exists")
    public Boolean exists(@PathVariable Long id) {
        return etudiantRepository.existsById(id);
    }
}
