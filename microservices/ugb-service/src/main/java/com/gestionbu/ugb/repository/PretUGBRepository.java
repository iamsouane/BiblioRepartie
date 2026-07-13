package com.gestionbu.ugb.repository;

import com.gestionbu.ugb.model.PretUGB;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PretUGBRepository extends JpaRepository<PretUGB, Long> {
    
    List<PretUGB> findByEtudiantId(Long etudiantId);
    List<PretUGB> findByOuvrageId(Long ouvrageId);
}
