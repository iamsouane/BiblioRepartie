package com.gestionbu.ucad.controller;

import com.gestionbu.ucad.model.EmployeUCAD;
import com.gestionbu.ucad.repository.EmployeUCADRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
    public EmployeUCAD getEmployeById(@PathVariable Long id) {
        return employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
    }
    
    @PostMapping
    public EmployeUCAD createEmploye(@RequestBody EmployeUCAD employe) {
        return employeRepository.save(employe);
    }
    
    @DeleteMapping("/{id}")
    public void deleteEmploye(@PathVariable Long id) {
        employeRepository.deleteById(id);
    }
}
