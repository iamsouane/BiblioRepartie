package com.gestionbu.ugb.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "etudiant_ugb")
@Data
public class EtudiantUGB {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idEtud;
    private String nom;
    private String adresse;
    private String universite = "UGB";
    private String specialite;
    private Integer nbreEmprunts = 0;
}
