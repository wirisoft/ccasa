package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.BusinessRuleException;
import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.SignatureEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.repositories.EntryRepository;
import com.backend.ccasa.persistence.repositories.SignatureRepository;
import com.backend.ccasa.persistence.repositories.UserRepository;
import com.backend.ccasa.security.CcasaUserDetails;
import com.backend.ccasa.service.ISignatureCrudService;
import com.backend.ccasa.service.models.dtos.CrudResponseDTO;
import com.backend.ccasa.service.models.dtos.SignEntryRequestDTO;
import com.backend.ccasa.service.models.enums.EntryStatusEnum;
import com.backend.ccasa.service.models.enums.SignatureTypeEnum;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SignatureCrudService extends AbstractEntityCrudService<SignatureEntity> implements ISignatureCrudService {

	private final SignatureRepository signatureRepository;
	private final EntryRepository entryRepository;
	private final UserRepository userRepository;

	public SignatureCrudService(SignatureRepository repository, EntityManager entityManager,
			EntryRepository entryRepository, UserRepository userRepository) {
		super(repository, entityManager, SignatureEntity.class, "SIGNATURE");
		this.signatureRepository = repository;
		this.entryRepository = entryRepository;
		this.userRepository = userRepository;
	}

	@Override
	protected SignatureEntity newEntity() {
		return new SignatureEntity();
	}

	@Override
	@Transactional
	public CrudResponseDTO signEntry(Long entryId, SignEntryRequestDTO request, CcasaUserDetails principal) {
		// 1. Parsear tipo de firma
		SignatureTypeEnum signatureType;
		try {
			signatureType = SignatureTypeEnum.valueOf(request.signatureType());
		} catch (IllegalArgumentException | NullPointerException e) {
			throw new BusinessRuleException("INVALID_SIGNATURE_TYPE",
					"Tipo de firma inválido. Use 'Analyst' o 'Supervisor'.");
		}

		// 2. Validar que el rol del usuario coincida con el tipo de firma
		String userRole = principal.getRole();
		if (signatureType == SignatureTypeEnum.Analyst && !"Analyst".equalsIgnoreCase(userRole)) {
			throw new BusinessRuleException("INVALID_SIGNATURE_TYPE",
					"Solo un Analyst puede crear firmas de tipo Analyst.");
		}
		if (signatureType == SignatureTypeEnum.Supervisor && !"Supervisor".equalsIgnoreCase(userRole)) {
			throw new BusinessRuleException("INVALID_SIGNATURE_TYPE",
					"Solo un Supervisor puede crear firmas de tipo Supervisor.");
		}

		// 3. Obtener la entrada
		EntryEntity entry = entryRepository.findByIdAndDeletedAtIsNull(entryId)
				.orElseThrow(() -> new BusinessRuleException("ENTRY_NOT_FOUND",
						"Entrada no encontrada con id: " + entryId));

		// 4. Validar transición de estado
		if (signatureType == SignatureTypeEnum.Analyst) {
			if (entry.getStatus() != EntryStatusEnum.Draft) {
				throw new BusinessRuleException("INVALID_STATE_TRANSITION",
						"Solo se puede firmar como Analyst una entrada en estado Draft. Estado actual: " + entry.getStatus());
			}
		} else {
			if (entry.getStatus() != EntryStatusEnum.Signed) {
				throw new BusinessRuleException("INVALID_STATE_TRANSITION",
						"Solo se puede firmar como Supervisor una entrada en estado Signed. Estado actual: " + entry.getStatus());
			}
		}

		// 5. Verificar que no exista firma duplicada del mismo tipo
		if (signatureRepository.existsByEntryAndSignatureTypeAndDeletedAtIsNull(entry, signatureType)) {
			throw new BusinessRuleException("DUPLICATE_SIGNATURE",
					"Ya existe una firma de tipo " + signatureType + " para esta entrada.");
		}

		// 6. Obtener el usuario que firma
		Long userId = principal.getUserIdAsLong();
		UserEntity signingUser = userRepository.findByIdAndDeletedAtIsNull(userId)
				.orElseThrow(() -> new BusinessRuleException("USER_NOT_FOUND",
						"Usuario firmante no encontrado."));

		// 7. Crear la firma
		SignatureEntity signature = new SignatureEntity();
		signature.setEntry(entry);
		signature.setSupervisorUser(signingUser);
		signature.setSignatureType(signatureType);
		signature.setSignedAt(Instant.now());
		signature = signatureRepository.save(signature);

		// 8. Transicionar el estado de la entrada
		if (signatureType == SignatureTypeEnum.Analyst) {
			entry.setStatus(EntryStatusEnum.Signed);
		} else {
			entry.setStatus(EntryStatusEnum.Locked);
		}
		entry.setUpdatedAt(Instant.now());
		entryRepository.save(entry);

		return toDto(signature);
	}
}
