package com.gestionbu.ugb.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ouvrage_ugb")
@Data
public class OuvrageUGB {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idOuv;
    private String titre;
    private Long auteurId;
    private String editeur;
    private Integer annee;
    private String domaine;
    private Integer stock;
    private String site = "UGB";
}
