package com.gestionbu.ugb.repository;

import com.gestionbu.ugb.model.Auteur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuteurRepository extends JpaRepository<Auteur, Long> {
    Optional<Auteur> findByNomAuteur(String nomAuteur);
}
