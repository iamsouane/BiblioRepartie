package com.gestionbu.ucad.repository;

import com.gestionbu.ucad.model.PretUCAD;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PretUCADRepository extends JpaRepository<PretUCAD, Long> {
    
    List<PretUCAD> findByEtudiantId(Long etudiantId);
    List<PretUCAD> findByOuvrageId(Long ouvrageId);
}