package com.gestionbu.uadb.controller;

import com.gestionbu.uadb.model.EtudiantUADB;
import com.gestionbu.uadb.repository.EtudiantUADBRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/etudiants")
public class EtudiantController {
    
    @Autowired
    private EtudiantUADBRepository etudiantRepository;
    
    @GetMapping
    public List<EtudiantUADB> getAllEtudiants() {
        return etudiantRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public EtudiantUADB getEtudiantById(@PathVariable Long id) {
        return etudiantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
    }
    
    @PostMapping
    public EtudiantUADB createEtudiant(@RequestBody EtudiantUADB etudiant) {
        return etudiantRepository.save(etudiant);
    }
    
    @GetMapping("/{id}/nbremprunts")
    public Integer getNbreEmprunts(@PathVariable Long id) {
        EtudiantUADB etudiant = etudiantRepository.findById(id)
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
