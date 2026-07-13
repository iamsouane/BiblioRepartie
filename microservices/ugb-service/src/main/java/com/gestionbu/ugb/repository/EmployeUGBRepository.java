package com.gestionbu.ugb.repository;

import com.gestionbu.ugb.model.EmployeUGB;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeUGBRepository extends JpaRepository<EmployeUGB, Long> {
}
