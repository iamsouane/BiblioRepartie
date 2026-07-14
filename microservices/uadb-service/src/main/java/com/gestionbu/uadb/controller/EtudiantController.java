package com.gestionbu.uadb.controller;

import com.gestionbu.uadb.model.EtudiantUADB;
import com.gestionbu.uadb.repository.EtudiantUADBRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<EtudiantUADB> getEtudiantById(@PathVariable Long id) {
        return etudiantRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/exists")
    public Boolean exists(@PathVariable Long id) {
        return etudiantRepository.existsById(id);
    }
    
    @GetMapping("/{id}/nbremprunts")
    public Integer getNbreEmprunts(@PathVariable Long id) {
        return etudiantRepository.findById(id)
                .map(EtudiantUADB::getNbreEmprunts)
                .orElse(0);
    }
    
    @PostMapping
    public EtudiantUADB createEtudiant(@RequestBody EtudiantUADB etudiant) {
        if (etudiant.getAdresse() == null || etudiant.getAdresse().isEmpty()) {
            etudiant.setAdresse("Non renseigné");
        }
        if (etudiant.getSpecialite() == null || etudiant.getSpecialite().isEmpty()) {
            etudiant.setSpecialite("Non renseigné");
        }
        etudiant.setNbreEmprunts(0);
        etudiant.setUniversite("UADB");
        return etudiantRepository.save(etudiant);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<EtudiantUADB> updateEtudiant(@PathVariable Long id, @RequestBody EtudiantUADB etudiant) {
        return etudiantRepository.findById(id)
                .map(existing -> {
                    if (etudiant.getNom() != null && !etudiant.getNom().isEmpty()) {
                        existing.setNom(etudiant.getNom());
                    }
                    if (etudiant.getAdresse() != null && !etudiant.getAdresse().isEmpty()) {
                        existing.setAdresse(etudiant.getAdresse());
                    }
                    if (etudiant.getSpecialite() != null && !etudiant.getSpecialite().isEmpty()) {
                        existing.setSpecialite(etudiant.getSpecialite());
                    }
                    return ResponseEntity.ok(etudiantRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/incrementer")
    public ResponseEntity<Void> incrementerNbreEmprunts(@PathVariable Long id) {
        return etudiantRepository.findById(id)
                .map(etudiant -> {
                    etudiant.setNbreEmprunts(etudiant.getNbreEmprunts() + 1);
                    etudiantRepository.save(etudiant);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}/decrementer")
    public ResponseEntity<Void> decrementerNbreEmprunts(@PathVariable Long id) {
        return etudiantRepository.findById(id)
                .map(etudiant -> {
                    if (etudiant.getNbreEmprunts() > 0) {
                        etudiant.setNbreEmprunts(etudiant.getNbreEmprunts() - 1);
                        etudiantRepository.save(etudiant);
                    }
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEtudiant(@PathVariable Long id) {
        if (etudiantRepository.existsById(id)) {
            etudiantRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
