package com.gestionbu.ucad.controller;

import com.gestionbu.ucad.model.OuvrageUCAD;
import com.gestionbu.ucad.repository.OuvrageUCADRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ouvrages")
public class OuvrageController {
    
    @Autowired
    private OuvrageUCADRepository ouvrageRepository;
    
    @GetMapping
    public List<OuvrageUCAD> getAllOuvrages() {
        return ouvrageRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OuvrageUCAD> getOuvrageById(@PathVariable Long id) {
        return ouvrageRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/domaine/{domaine}")
    public List<OuvrageUCAD> getOuvragesByDomaine(@PathVariable String domaine) {
        return ouvrageRepository.findByDomaine(domaine);
    }
    
    @PostMapping
    public OuvrageUCAD createOuvrage(@RequestBody OuvrageUCAD ouvrage) {
        return ouvrageRepository.save(ouvrage);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<OuvrageUCAD> updateOuvrage(@PathVariable Long id, @RequestBody OuvrageUCAD ouvrage) {
        return ouvrageRepository.findById(id)
                .map(existing -> {
                    existing.setTitre(ouvrage.getTitre());
                    existing.setAuteurId(ouvrage.getAuteurId());
                    existing.setEditeur(ouvrage.getEditeur());
                    existing.setAnnee(ouvrage.getAnnee());
                    existing.setDomaine(ouvrage.getDomaine());
                    existing.setStock(ouvrage.getStock());
                    existing.setSite(ouvrage.getSite());
                    return ResponseEntity.ok(ouvrageRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOuvrage(@PathVariable Long id) {
        if (ouvrageRepository.existsById(id)) {
            ouvrageRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
