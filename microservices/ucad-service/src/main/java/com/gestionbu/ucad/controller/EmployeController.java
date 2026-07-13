package com.gestionbu.ucad.controller;

import com.gestionbu.ucad.model.EmployeUCAD;
import com.gestionbu.ucad.repository.EmployeUCADRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employes")
public class EmployeController {
    
    @Autowired
    private EmployeUCADRepository employeRepository;
    
    @GetMapping
    public List<EmployeUCAD> getAllEmployes() {
        return employeRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EmployeUCAD> getEmployeById(@PathVariable Long id) {
        return employeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public EmployeUCAD createEmploye(@RequestBody EmployeUCAD employe) {
        return employeRepository.save(employe);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<EmployeUCAD> updateEmploye(@PathVariable Long id, @RequestBody EmployeUCAD employe) {
        return employeRepository.findById(id)
                .map(existing -> {
                    existing.setNom(employe.getNom());
                    existing.setAdresse(employe.getAdresse());
                    existing.setStatut(employe.getStatut());
                    return ResponseEntity.ok(employeRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmploye(@PathVariable Long id) {
        if (employeRepository.existsById(id)) {
            employeRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
