package com.gestionbu.uadb.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "pret_uadb")
@Data
public class PretUADB {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPret;
    private Long ouvrageId;
    private Long etudiantId;
    private LocalDate dateEmprunt;
    private LocalDate dateRetour;
}
