package com.gestionbu.ugb.controller;

import com.gestionbu.ugb.model.EmployeUGB;
import com.gestionbu.ugb.repository.EmployeUGBRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
    public EmployeUGB getEmployeById(@PathVariable Long id) {
        return employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
    }
    
    @PostMapping
    public EmployeUGB createEmploye(@RequestBody EmployeUGB employe) {
        return employeRepository.save(employe);
    }
    
    @DeleteMapping("/{id}")
    public void deleteEmploye(@PathVariable Long id) {
        employeRepository.deleteById(id);
    }
}
