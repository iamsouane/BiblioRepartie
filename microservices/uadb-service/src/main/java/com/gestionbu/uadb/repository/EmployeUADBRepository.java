package com.gestionbu.uadb.repository;

import com.gestionbu.uadb.model.EmployeUADB;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeUADBRepository extends JpaRepository<EmployeUADB, Long> {
}
