package com.gestionbu.uadb.dto;

import lombok.Data;

@Data
public class EmpruntRequest {
    private Long etudiantId;
    private Long ouvrageId;
}
