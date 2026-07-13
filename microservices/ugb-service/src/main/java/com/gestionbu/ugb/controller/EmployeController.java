package com.gestionbu.ugb.controller;

import com.gestionbu.ugb.model.EmployeUGB;
import com.gestionbu.ugb.repository.EmployeUGBRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employes")
public class EmployeController {
    
    @Autowired
    private EmployeUGBRepository employeRepository;
    
    @GetMapping
    public List<EmployeUGB> getAllEmployes() {
        return employeRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EmployeUGB> getEmployeById(@PathVariable Long id) {
        return employeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public EmployeUGB createEmploye(@RequestBody EmployeUGB employe) {
        return employeRepository.save(employe);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<EmployeUGB> updateEmploye(@PathVariable Long id, @RequestBody EmployeUGB employe) {
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
