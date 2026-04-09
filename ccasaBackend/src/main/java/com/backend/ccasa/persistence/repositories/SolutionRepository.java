package com.backend.ccasa.persistence.repositories;

import com.backend.ccasa.persistence.entities.SolutionEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;

public interface SolutionRepository extends ActiveRepository<SolutionEntity, Long> {

	@Query("select s from SolutionEntity s where s.deletedAt is null order by s.name")
	List<SolutionEntity> findAllActive();

	Optional<SolutionEntity> findByNameAndConcentrationAndDeletedAtIsNull(String name, String concentration);

	/** Primera coincidencia por nombre y concentración sin filtrar borrado lógico (evita duplicar si hubo soft delete). */
	Optional<SolutionEntity> findFirstByNameAndConcentrationOrderByIdAsc(String name, String concentration);
}
