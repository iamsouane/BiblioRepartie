package com.gestionbu.ucad.repository;

import com.gestionbu.ucad.model.EmployeUCAD;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeUCADRepository extends JpaRepository<EmployeUCAD, Long> {
}
