package com.gestionbu.ucad.repository;

import com.gestionbu.ucad.model.EtudiantUCAD;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface EtudiantUCADRepository extends JpaRepository<EtudiantUCAD, Long> {
    
    @Modifying
    @Transactional
    @Query("UPDATE EtudiantUCAD e SET e.nbreEmprunts = e.nbreEmprunts + 1 WHERE e.idEtud = :id")
    void incrementerNbreEmprunts(@Param("id") Long id);
    
    @Modifying
    @Transactional
    @Query("UPDATE EtudiantUCAD e SET e.nbreEmprunts = e.nbreEmprunts - 1 WHERE e.idEtud = :id AND e.nbreEmprunts > 0")
    void decrementerNbreEmprunts(@Param("id") Long id);
}