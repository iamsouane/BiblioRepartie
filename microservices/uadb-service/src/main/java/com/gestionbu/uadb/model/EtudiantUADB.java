package com.gestionbu.uadb.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "etudiant_uadb")
@Data
public class EtudiantUADB {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEtud;
    private String nom;
    private String adresse;
    private String universite = "UADB";
    private String specialite;
    private Integer nbreEmprunts = 0;
}
