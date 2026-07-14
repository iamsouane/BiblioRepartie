package com.gestionbu.ucad.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "etudiant_ucad")
@Data
public class EtudiantUCAD {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEtud;
    private String nom;
    private String adresse;
    private String universite = "UCAD";
    private String specialite;
    private Integer nbreEmprunts = 0;
}
