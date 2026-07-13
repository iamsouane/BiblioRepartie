package com.gestionbu.uadb.controller;

import com.gestionbu.uadb.model.EmployeUADB;
import com.gestionbu.uadb.repository.EmployeUADBRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employes")
public class EmployeController {
    
    @Autowired
    private EmployeUADBRepository employeRepository;
    
    @GetMapping
    public List<EmployeUADB> getAllEmployes() {
        return employeRepository.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EmployeUADB> getEmployeById(@PathVariable Long id) {
        return employeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public EmployeUADB createEmploye(@RequestBody EmployeUADB employe) {
        return employeRepository.save(employe);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<EmployeUADB> updateEmploye(@PathVariable Long id, @RequestBody EmployeUADB employe) {
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
