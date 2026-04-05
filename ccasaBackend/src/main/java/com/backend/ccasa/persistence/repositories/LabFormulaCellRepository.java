package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.LabFormulaCellEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LabFormulaCellRepository extends JpaRepository<LabFormulaCellEntity, Long> {

	long countByDeletedAtIsNull();
}
