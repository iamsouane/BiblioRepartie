package com.gestionbu.ucad.controller;

import com.gestionbu.ucad.model.EtudiantUCAD;
import com.gestionbu.ucad.repository.EtudiantUCADRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/etudiants")
public class EtudiantController {
    
    @Autowired
    private EtudiantUCADRepository etudiantRepository;
    
    @GetMapping
    public List<EtudiantUCAD> getAllEtudiants() {
        return etudiantRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public EtudiantUCAD getEtudiantById(@PathVariable Long id) {
        return etudiantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
    }
    
    @PostMapping
    public EtudiantUCAD createEtudiant(@RequestBody EtudiantUCAD etudiant) {
        return etudiantRepository.save(etudiant);
    }
    
    @GetMapping("/{id}/nbremprunts")
    public Integer getNbreEmprunts(@PathVariable Long id) {
        EtudiantUCAD etudiant = etudiantRepository.findById(id)
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
}