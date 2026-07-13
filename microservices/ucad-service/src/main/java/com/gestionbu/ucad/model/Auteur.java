package com.gestionbu.ucad.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "auteur")
@Data
public class Auteur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAut;
    private String nomAuteur;
}
