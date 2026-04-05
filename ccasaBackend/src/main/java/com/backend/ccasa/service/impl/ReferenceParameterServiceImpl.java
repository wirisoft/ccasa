package com.backend.ccasa.service.impl;

import com.backend.ccasa.persistence.entities.ReferenceParameterEntity;
import com.backend.ccasa.persistence.repositories.ReferenceParameterRepository;
import com.backend.ccasa.service.IReferenceParameterService;
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReferenceParameterServiceImpl implements IReferenceParameterService {

	private final ReferenceParameterRepository referenceParameterRepository;

	public ReferenceParameterServiceImpl(ReferenceParameterRepository referenceParameterRepository) {
		this.referenceParameterRepository = referenceParameterRepository;
	}

	@Override
	@Transactional(readOnly = true)
	public BigDecimal getMinValue(String code, BigDecimal defaultMin) {
		Optional<ReferenceParameterEntity> row = referenceParameterRepository.findByCodeAndDeletedAtIsNull(code);
		return row.map(ReferenceParameterEntity::getMinValue).filter(v -> v != null).orElse(defaultMin);
	}

	@Override
	@Transactional(readOnly = true)
	public BigDecimal getMaxValue(String code, BigDecimal defaultMax) {
		Optional<ReferenceParameterEntity> row = referenceParameterRepository.findByCodeAndDeletedAtIsNull(code);
		return row.map(ReferenceParameterEntity::getMaxValue).filter(v -> v != null).orElse(defaultMax);
	}
}
