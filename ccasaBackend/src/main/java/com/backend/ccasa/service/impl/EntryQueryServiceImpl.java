package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.repositories.EntryRepository;
import com.backend.ccasa.persistence.repositories.LogbookRepository;
import com.backend.ccasa.service.IEntryQueryService;
import com.backend.ccasa.service.models.dtos.EntrySummaryDTO;
import com.backend.ccasa.exceptions.LogbookNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EntryQueryServiceImpl implements IEntryQueryService {

	private final EntryRepository entryRepository;
	private final LogbookRepository logbookRepository;

	public EntryQueryServiceImpl(EntryRepository entryRepository, LogbookRepository logbookRepository) {
		this.entryRepository = entryRepository;
		this.logbookRepository = logbookRepository;
	}

	@Override
	@Transactional(readOnly = true)
	public List<EntrySummaryDTO> findByLogbookId(Long logbookId) {
		var logbook = logbookRepository.findByIdAndDeletedAtIsNull(logbookId).orElseThrow(() -> new LogbookNotFoundException(logbookId));
		return entryRepository.findByLogbook(logbook).stream()
			.map(this::toSummaryDto)
			.toList();
	}

	private EntrySummaryDTO toSummaryDto(EntryEntity e) {
		return new EntrySummaryDTO(
			e.getId(),
			e.getFolio().getId(),
			e.getFolio().getFolioNumber(),
			e.getLogbook().getId(),
			e.getLogbook().getCode(),
			e.getLogbook().getName(),
			e.getUser().getId(),
			e.getStatus().name(),
			e.getRecordedAt()
		);
	}
}

