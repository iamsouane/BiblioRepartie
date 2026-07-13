package com.gestionbu.ugb.repository;

import com.gestionbu.ugb.model.EtudiantUGB;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface EtudiantUGBRepository extends JpaRepository<EtudiantUGB, Long> {
    
    @Modifying
    @Transactional
    @Query("UPDATE EtudiantUGB e SET e.nbreEmprunts = e.nbreEmprunts + 1 WHERE e.idEtud = :id")
    void incrementerNbreEmprunts(@Param("id") Long id);
    
    @Modifying
    @Transactional
    @Query("UPDATE EtudiantUGB e SET e.nbreEmprunts = e.nbreEmprunts - 1 WHERE e.idEtud = :id AND e.nbreEmprunts > 0")
    void decrementerNbreEmprunts(@Param("id") Long id);
}
