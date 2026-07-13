package com.gestionbu.uadb.controller;

import com.gestionbu.uadb.model.EmployeUADB;
import com.gestionbu.uadb.repository.EmployeUADBRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
    public EmployeUADB getEmployeById(@PathVariable Long id) {
        return employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
    }
    
    @PostMapping
    public EmployeUADB createEmploye(@RequestBody EmployeUADB employe) {
        return employeRepository.save(employe);
    }
    
    @DeleteMapping("/{id}")
    public void deleteEmploye(@PathVariable Long id) {
        employeRepository.deleteById(id);
    }
}
