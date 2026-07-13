package com.gestionbu.ucad.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "pret_ucad")
@Data
public class PretUCAD {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPret;
    private Long ouvrageId;
    private Long etudiantId;
    private LocalDate dateEmprunt;
    private LocalDate dateRetour;
}