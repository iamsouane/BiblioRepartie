package com.gestionbu.ugb.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "employe_ugb")
@Data
public class EmployeUGB {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEmp;
    private String nom;
    private String adresse;
    private String statut;
    private String bibliotheque = "UGB";
}
