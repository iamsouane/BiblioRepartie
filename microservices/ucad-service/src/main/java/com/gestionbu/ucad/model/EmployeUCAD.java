package com.gestionbu.ucad.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "employe_ucad")
@Data
public class EmployeUCAD {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEmp;
    private String nom;
    private String adresse;
    private String statut;
    private String bibliotheque = "UCAD";
}