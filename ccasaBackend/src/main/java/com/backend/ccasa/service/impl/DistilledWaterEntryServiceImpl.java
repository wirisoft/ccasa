package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.BatchEntity;
import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.FolioEntity;
import com.backend.ccasa.persistence.entities.LogbookEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.entities.entry.EntryDistilledWaterEntity;
import com.backend.ccasa.persistence.repositories.BatchRepository;
import com.backend.ccasa.persistence.repositories.EntryDistilledWaterRepository;
import com.backend.ccasa.persistence.repositories.EntryRepository;
import com.backend.ccasa.persistence.repositories.FolioRepository;
import com.backend.ccasa.persistence.repositories.LogbookRepository;
import com.backend.ccasa.persistence.repositories.UserRepository;
import com.backend.ccasa.service.IDistilledWaterEntryService;
import com.backend.ccasa.services.models.dtos.DistilledWaterRequestDTO;
import com.backend.ccasa.services.models.dtos.DistilledWaterResponseDTO;
import com.backend.ccasa.services.models.enums.EntryStatusEnum;
import com.backend.ccasa.exceptions.EntryNotFoundException;
import com.backend.ccasa.exceptions.FolioNotFoundException;
import com.backend.ccasa.exceptions.LogbookNotFoundException;
import com.backend.ccasa.exceptions.UserNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio para entradas de agua destilada (RF-08: 3 lecturas → promedios, is_acceptable).
 */
@Service
public class DistilledWaterEntryServiceImpl implements IDistilledWaterEntryService {

	private final EntryRepository entryRepository;
	private final EntryDistilledWaterRepository distilledWaterRepository;
	private final FolioRepository folioRepository;
	private final LogbookRepository logbookRepository;
	private final UserRepository userRepository;
	private final BatchRepository batchRepository;

	public DistilledWaterEntryServiceImpl(EntryRepository entryRepository,
			EntryDistilledWaterRepository distilledWaterRepository,
			FolioRepository folioRepository,
			LogbookRepository logbookRepository,
			UserRepository userRepository,
			BatchRepository batchRepository) {
		this.entryRepository = entryRepository;
		this.distilledWaterRepository = distilledWaterRepository;
		this.folioRepository = folioRepository;
		this.logbookRepository = logbookRepository;
		this.userRepository = userRepository;
		this.batchRepository = batchRepository;
	}

	@Override
	@Transactional(readOnly = true)
	public DistilledWaterResponseDTO getByEntryId(Long entryId) {
		EntryEntity entry = entryRepository.findByIdAndDeletedAtIsNull(entryId).orElseThrow(() -> new EntryNotFoundException(entryId));
		EntryDistilledWaterEntity dw = distilledWaterRepository.findByEntry(entry)
			.orElseThrow(() -> new EntryNotFoundException(entryId));
		return toResponseDto(entry, dw);
	}

	@Override
	@Transactional
	public DistilledWaterResponseDTO create(DistilledWaterRequestDTO dto) {
		FolioEntity folio = folioRepository.findByIdAndDeletedAtIsNull(dto.folioId()).orElseThrow(() -> new FolioNotFoundException(dto.folioId()));
		LogbookEntity logbook = logbookRepository.findByIdAndDeletedAtIsNull(dto.logbookId()).orElseThrow(() -> new LogbookNotFoundException(dto.logbookId()));
		UserEntity user = userRepository.findByIdAndDeletedAtIsNull(dto.userId()).orElseThrow(() -> new UserNotFoundException(dto.userId()));

		EntryEntity entry = new EntryEntity();
		entry.setFolio(folio);
		entry.setLogbook(logbook);
		entry.setUser(user);
		entry.setRecordedAt(Instant.now());
		entry.setStatus(EntryStatusEnum.Draft);
		entry = entryRepository.save(entry);

		EntryDistilledWaterEntity dw = new EntryDistilledWaterEntity();
		dw.setEntry(entry);
		dw.setPhReading1(dto.phReading1());
		dw.setPhReading2(dto.phReading2());
		dw.setPhReading3(dto.phReading3());
		dw.setCeReading1(dto.ceReading1());
		dw.setCeReading2(dto.ceReading2());
		dw.setCeReading3(dto.ceReading3());
		dw.setReferenceDifference(dto.referenceDifference());
		dw.setControlStandardPct(dto.controlStandardPct());
		if (dto.waterBatchId() != null) {
			BatchEntity batch = batchRepository.findByIdAndDeletedAtIsNull(dto.waterBatchId()).orElse(null);
			dw.setWaterBatch(batch);
		}
		computeAveragesAndAcceptable(dw);
		dw = distilledWaterRepository.save(dw);
		return toResponseDto(entry, dw);
	}

	private void computeAveragesAndAcceptable(EntryDistilledWaterEntity dw) {
		BigDecimal ph1 = dw.getPhReading1();
		BigDecimal ph2 = dw.getPhReading2();
		BigDecimal ph3 = dw.getPhReading3();
		if (ph1 != null && ph2 != null && ph3 != null) {
			dw.setPhAverage(ph1.add(ph2).add(ph3).divide(BigDecimal.valueOf(3), 3, RoundingMode.HALF_UP));
		}
		BigDecimal ce1 = dw.getCeReading1();
		BigDecimal ce2 = dw.getCeReading2();
		BigDecimal ce3 = dw.getCeReading3();
		if (ce1 != null && ce2 != null && ce3 != null) {
			dw.setCeAverage(ce1.add(ce2).add(ce3).divide(BigDecimal.valueOf(3), 4, RoundingMode.HALF_UP));
		}
		if (dw.getReferenceDifference() != null && dw.getControlStandardPct() != null) {
			dw.setIsAcceptable(dw.getReferenceDifference().compareTo(BigDecimal.ZERO) >= 0 && dw.getControlStandardPct().compareTo(BigDecimal.valueOf(100)) <= 0);
		}
	}

	private DistilledWaterResponseDTO toResponseDto(EntryEntity entry, EntryDistilledWaterEntity dw) {
		return new DistilledWaterResponseDTO(
			entry.getId(),
			dw.getId(),
			dw.getPhReading1(),
			dw.getPhReading2(),
			dw.getPhReading3(),
			dw.getPhAverage(),
			dw.getCeReading1(),
			dw.getCeReading2(),
			dw.getCeReading3(),
			dw.getCeAverage(),
			dw.getReferenceDifference(),
			dw.getControlStandardPct(),
			dw.getIsAcceptable(),
			dw.getWaterBatch() != null ? dw.getWaterBatch().getId() : null,
			entry.getStatus().name()
		);
	}
}
