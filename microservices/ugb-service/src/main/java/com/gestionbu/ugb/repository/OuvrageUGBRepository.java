package com.gestionbu.ugb.repository;

import com.gestionbu.ugb.model.OuvrageUGB;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface OuvrageUGBRepository extends JpaRepository<OuvrageUGB, Long> {
    
    List<OuvrageUGB> findByDomaine(String domaine);
    
    @Modifying
    @Transactional
    @Query("UPDATE OuvrageUGB o SET o.stock = o.stock - 1 WHERE o.idOuv = :id AND o.stock > 0")
    int decrementerStock(@Param("id") Long id);
    
    @Modifying
    @Transactional
    @Query("UPDATE OuvrageUGB o SET o.stock = o.stock + 1 WHERE o.idOuv = :id")
    void incrementerStock(@Param("id") Long id);
}
