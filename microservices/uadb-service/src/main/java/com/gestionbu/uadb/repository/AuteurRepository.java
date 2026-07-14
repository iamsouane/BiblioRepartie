package com.gestionbu.uadb.repository;

import com.gestionbu.uadb.model.Auteur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuteurRepository extends JpaRepository<Auteur, Long> {
    Optional<Auteur> findByNomAuteur(String nomAuteur);
}
