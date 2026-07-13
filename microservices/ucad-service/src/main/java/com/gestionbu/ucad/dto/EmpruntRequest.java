package com.gestionbu.ucad.dto;

import lombok.Data;

@Data
public class EmpruntRequest {
    private Long etudiantId;
    private Long ouvrageId;
}