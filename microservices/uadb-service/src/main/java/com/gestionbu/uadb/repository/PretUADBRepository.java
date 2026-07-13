package com.gestionbu.uadb.repository;

import com.gestionbu.uadb.model.PretUADB;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PretUADBRepository extends JpaRepository<PretUADB, Long> {
    
    List<PretUADB> findByEtudiantId(Long etudiantId);
    List<PretUADB> findByOuvrageId(Long ouvrageId);
}
