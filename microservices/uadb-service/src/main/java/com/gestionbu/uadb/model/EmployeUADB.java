package com.gestionbu.uadb.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "employe_uadb")
@Data
public class EmployeUADB {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEmp;
    private String nom;
    private String adresse;
    private String statut;
    private String bibliotheque = "UADB";
}
