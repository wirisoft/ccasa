package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.LogbookEntity;
import com.backend.ccasa.persistence.repositories.LogbookRepository;
import com.backend.ccasa.service.ILogbookService;
import com.backend.ccasa.services.models.dtos.LogbookDTO;
import com.backend.ccasa.exceptions.LogbookNotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LogbookServiceImpl implements ILogbookService {

	private final LogbookRepository logbookRepository;

	public LogbookServiceImpl(LogbookRepository logbookRepository) {
		this.logbookRepository = logbookRepository;
	}

	@Override
	@Transactional(readOnly = true)
	public List<LogbookDTO> findAllActive() {
		return logbookRepository.findAllActive().stream()
			.map(this::toDto)
			.toList();
	}

	@Override
	@Transactional(readOnly = true)
	public LogbookDTO getById(Long id) {
		LogbookEntity l = logbookRepository.findById(id).orElseThrow(() -> new LogbookNotFoundException(id));
		return toDto(l);
	}

	private LogbookDTO toDto(LogbookEntity l) {
		return new LogbookDTO(l.getId(), l.getCode(), l.getName(), l.getDescription(), l.getMaxEntries());
	}
}
