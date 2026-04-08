package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.BusinessRuleException;
import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.FolioBlockEntity;
import com.backend.ccasa.persistence.entities.FolioEntity;
import com.backend.ccasa.persistence.entities.LogbookEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.entities.entry.EntryConductivityEntity;
import com.backend.ccasa.persistence.repositories.EntryConductivityRepository;
import com.backend.ccasa.persistence.repositories.EntryRepository;
import com.backend.ccasa.persistence.repositories.FolioBlockRepository;
import com.backend.ccasa.persistence.repositories.FolioRepository;
import com.backend.ccasa.persistence.repositories.LogbookRepository;
import com.backend.ccasa.persistence.repositories.UserRepository;
import com.backend.ccasa.security.CcasaUserDetails;
import com.backend.ccasa.service.IConductivityRecordService;
import com.backend.ccasa.service.IReferenceParameterService;
import com.backend.ccasa.service.impl.support.ConductivityEntryComputation;
import com.backend.ccasa.service.impl.support.ConductivityHighKclComputation;
import com.backend.ccasa.service.impl.support.ConductivityLowKclComputation;
import com.backend.ccasa.service.impl.support.ReferenceParameterCodes;
import com.backend.ccasa.service.impl.support.ReferenceParameterDefaults;
import com.backend.ccasa.service.models.dtos.ConductivityRecordResponseDTO;
import com.backend.ccasa.service.models.dtos.ConductivityReviewRequestDTO;
import com.backend.ccasa.service.models.dtos.CreateConductivityRecordRequestDTO;
import com.backend.ccasa.service.models.enums.ConductivityTypeEnum;
import com.backend.ccasa.service.models.enums.EntryStatusEnum;
import com.backend.ccasa.service.models.enums.FolioStatusEnum;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ConductivityRecordServiceImpl implements IConductivityRecordService {

	private static final String DISPLAY_FOLIO_PREFIX = "BSA-COND-";
	private static final String REVIEWER_NOMENCLATURE = "TCM";
	private static final String ALT_REVIEWER_NOMENCLATURE = "TMC";
	private static final MathContext MC = new MathContext(14, RoundingMode.HALF_UP);
	private static final DateTimeFormatter PDF_DATE = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC);
	private static final Font TITLE_FONT = new Font(Font.HELVETICA, 12, Font.BOLD);
	private static final Font LABEL_FONT = new Font(Font.HELVETICA, 9, Font.BOLD);
	private static final Font BODY_FONT = new Font(Font.HELVETICA, 9, Font.NORMAL);
private static final Font SMALL_FONT = new Font(Font.HELVETICA, 8, Font.NORMAL);

	private final EntryConductivityRepository entryConductivityRepository;
	private final EntryRepository entryRepository;
	private final FolioRepository folioRepository;
	private final FolioBlockRepository folioBlockRepository;
	private final LogbookRepository logbookRepository;
	private final UserRepository userRepository;
	private final ConductivityHighKclComputation conductivityHighKclComputation;
	private final ConductivityLowKclComputation conductivityLowKclComputation;
	private final ConductivityEntryComputation conductivityEntryComputation;
	private final IReferenceParameterService referenceParameterService;

	public ConductivityRecordServiceImpl(
		EntryConductivityRepository entryConductivityRepository,
		EntryRepository entryRepository,
		FolioRepository folioRepository,
		FolioBlockRepository folioBlockRepository,
		LogbookRepository logbookRepository,
		UserRepository userRepository,
		ConductivityHighKclComputation conductivityHighKclComputation,
		ConductivityLowKclComputation conductivityLowKclComputation,
		ConductivityEntryComputation conductivityEntryComputation,
		IReferenceParameterService referenceParameterService
	) {
		this.entryConductivityRepository = entryConductivityRepository;
		this.entryRepository = entryRepository;
		this.folioRepository = folioRepository;
		this.folioBlockRepository = folioBlockRepository;
		this.logbookRepository = logbookRepository;
		this.userRepository = userRepository;
		this.conductivityHighKclComputation = conductivityHighKclComputation;
		this.conductivityLowKclComputation = conductivityLowKclComputation;
		this.conductivityEntryComputation = conductivityEntryComputation;
		this.referenceParameterService = referenceParameterService;
	}

	@Override
	public ConductivityRecordResponseDTO createRecord(CreateConductivityRecordRequestDTO request, CcasaUserDetails principal) {
		if (request == null) {
			throw new IllegalArgumentException("La solicitud de conductividad es obligatoria.");
		}
		if (request.type() == null) {
			throw new IllegalArgumentException("El tipo de conductividad es obligatorio.");
		}
		if (request.weightGrams() == null || request.weightGrams().compareTo(BigDecimal.ZERO) <= 0) {
			throw new IllegalArgumentException("El peso debe ser mayor a cero.");
		}
		UserEntity currentUser = requireUser(principal != null ? principal.getUserIdAsLong() : null, "Usuario autenticado no encontrado.");
		LogbookEntity logbook = resolveLogbook(request.logbookId());
		Integer folioNumber = nextFolioNumber(logbook);
		FolioBlockEntity folioBlock = resolveOrCreateBlock(folioNumber);

		FolioEntity folio = new FolioEntity();
		folio.setFolioBlock(folioBlock);
		folio.setLogbook(logbook);
		folio.setFolioNumber(folioNumber);
		folio.setStatus(FolioStatusEnum.Open);
		folio = folioRepository.save(folio);

		EntryEntity entry = new EntryEntity();
		entry.setFolio(folio);
		entry.setLogbook(logbook);
		entry.setUser(currentUser);
		entry.setRecordedAt(request.recordedAt() != null ? request.recordedAt() : Instant.now());
		entry.setStatus(EntryStatusEnum.Draft);
		entry = entryRepository.save(entry);

		EntryConductivityEntity record = new EntryConductivityEntity();
		record.setEntry(entry);
		record.setType(request.type());
		record.setWeightGrams(request.weightGrams());
		record.setPreparationTime(request.preparationTime());
		record.setObservation(normalizeBlank(request.observation()));
		record.setAutoDate(Instant.now());
		record.setDisplayFolio(formatDisplayFolio(folioNumber));
		applyReferenceFields(record);
		applyComputations(record);
		record = entryConductivityRepository.save(record);

		return toDto(record);
	}

	@Override
	@Transactional(readOnly = true)
	public List<ConductivityRecordResponseDTO> findRecords(
		String folio,
		Instant fromDate,
		Instant toDate,
		ConductivityTypeEnum type,
		EntryStatusEnum status,
		Long createdByUserId,
		Long reviewerUserId
	) {
		return entryConductivityRepository.searchRecords(
			normalizeBlank(folio),
			fromDate,
			toDate,
			type,
			status,
			createdByUserId,
			reviewerUserId
		)
			.stream()
			.map(this::toDto)
			.toList();
	}

	@Override
	@Transactional(readOnly = true)
	public ConductivityRecordResponseDTO findRecordById(Long conductivityId) {
		return toDto(requireRecord(conductivityId));
	}

	@Override
	public ConductivityRecordResponseDTO reviewRecord(
		Long conductivityId,
		ConductivityReviewRequestDTO request,
		CcasaUserDetails principal
	) {
		EntryConductivityEntity record = requireRecord(conductivityId);
		EntryEntity entry = requireEntry(record);
		if (entry.getStatus() == EntryStatusEnum.Locked) {
			throw new BusinessRuleException("CONDUCTIVITY_ALREADY_REVIEWED", "El registro ya fue revisado y aprobado.");
		}
		UserEntity reviewer = resolveReviewer(request, principal);
		validateReviewer(reviewer);

		record.setReviewerUser(reviewer);
		record.setReviewedAt(Instant.now());
		entry.setStatus(EntryStatusEnum.Locked);
		entry.setUpdatedAt(Instant.now());

		entryRepository.save(entry);
		record = entryConductivityRepository.save(record);
		return toDto(record);
	}

	@Override
	@Transactional(readOnly = true)
	public byte[] generatePdf(Long conductivityId) {
		EntryConductivityEntity record = requireRecord(conductivityId);
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		Document document = new Document(PageSize.A4, 36, 36, 36, 36);
		try {
			PdfWriter.getInstance(document, output);
			document.open();
			writePdf(document, record);
		} catch (Exception ex) {
			throw new BusinessRuleException("CONDUCTIVITY_PDF_ERROR", "No fue posible generar el PDF del registro.");
		} finally {
			document.close();
		}
		return output.toByteArray();
	}

	@Override
	@Transactional(readOnly = true)
	public byte[] generatePdfZip(List<Long> conductivityIds) {
		if (conductivityIds == null || conductivityIds.isEmpty()) {
			throw new IllegalArgumentException("Debe indicar al menos un registro para exportar.");
		}
		try {
			ByteArrayOutputStream output = new ByteArrayOutputStream();
			ZipOutputStream zipOutputStream = new ZipOutputStream(output);
			for (Long conductivityId : conductivityIds) {
				EntryConductivityEntity record = requireRecord(conductivityId);
				String fileName = sanitizeFileName(record.getDisplayFolio() != null ? record.getDisplayFolio() : "conductividad-" + conductivityId);
				zipOutputStream.putNextEntry(new ZipEntry(fileName + ".pdf"));
				zipOutputStream.write(generatePdf(conductivityId));
				zipOutputStream.closeEntry();
			}
			zipOutputStream.finish();
			zipOutputStream.close();
			return output.toByteArray();
		} catch (BusinessRuleException ex) {
			throw ex;
		} catch (Exception ex) {
			throw new BusinessRuleException("CONDUCTIVITY_ZIP_ERROR", "No fue posible generar el ZIP de PDFs.");
		}
	}

	private EntryConductivityEntity requireRecord(Long conductivityId) {
		if (conductivityId == null) {
			throw new IllegalArgumentException("El id del registro es obligatorio.");
		}
		return entryConductivityRepository.findByIdAndDeletedAtIsNull(conductivityId)
			.orElseThrow(() -> new BusinessRuleException("CONDUCTIVITY_NOT_FOUND", "Registro de conductividad no encontrado."));
	}

	private UserEntity requireUser(Long userId, String message) {
		if (userId == null) {
			throw new BusinessRuleException("USER_NOT_FOUND", message);
		}
		return userRepository.findByIdAndDeletedAtIsNull(userId)
			.orElseThrow(() -> new BusinessRuleException("USER_NOT_FOUND", message));
	}

	private LogbookEntity resolveLogbook(Long requestedLogbookId) {
		if (requestedLogbookId != null) {
			return logbookRepository.findByIdAndDeletedAtIsNull(requestedLogbookId)
				.orElseThrow(() -> new BusinessRuleException("LOGBOOK_NOT_FOUND", "Bitácora no encontrada."));
		}
		return logbookRepository.findAllActive().stream()
			.findFirst()
			.orElseThrow(() -> new BusinessRuleException("LOGBOOK_NOT_FOUND", "No hay bitácoras activas para crear el registro."));
	}

	private Integer nextFolioNumber(LogbookEntity logbook) {
		return folioRepository.findByLogbook(logbook).stream()
			.map(FolioEntity::getFolioNumber)
			.filter(Objects::nonNull)
			.max(Comparator.naturalOrder())
			.map(n -> n + 1)
			.orElse(1);
	}

	private FolioBlockEntity resolveOrCreateBlock(Integer folioNumber) {
		List<FolioBlockEntity> activeBlocks = folioBlockRepository.findAllActive();
		for (FolioBlockEntity block : activeBlocks) {
			if (block.getStartNumber() != null && block.getEndNumber() != null
				&& folioNumber >= block.getStartNumber() && folioNumber <= block.getEndNumber()) {
				return block;
			}
		}

		int blockIndex = ((folioNumber - 1) / 200) + 1;
		int startNumber = ((blockIndex - 1) * 200) + 1;
		int endNumber = blockIndex * 200;

		FolioBlockEntity block = new FolioBlockEntity();
		block.setIdentifier(blockIndex == 1 ? "BSA-COND" : "BSA-COND-" + blockIndex);
		block.setStartNumber(startNumber);
		block.setEndNumber(endNumber);
		block.setCoverGenerated(false);
		return folioBlockRepository.save(block);
	}

	private String formatDisplayFolio(Integer folioNumber) {
		return DISPLAY_FOLIO_PREFIX + String.format(Locale.ROOT, "%06d", folioNumber);
	}

	private void applyReferenceFields(EntryConductivityEntity record) {
		BigDecimal c25 = scalar(record.getType(), "C25");
		BigDecimal b24 = scalar(record.getType(), "B24");
		BigDecimal c24 = scalar(record.getType(), "C24");
		BigDecimal f24 = scalar(record.getType(), "F24");
		BigDecimal f28 = scalar(record.getType(), "F28");
		if (c24.compareTo(BigDecimal.ZERO) == 0) {
			throw new BusinessRuleException("CONDUCTIVITY_REFERENCE_ERROR", "El parámetro de referencia C24 no puede ser cero.");
		}
		BigDecimal referenceUScm = c25.multiply(b24, MC).divide(c24, MC).setScale(4, RoundingMode.HALF_UP);
		record.setReferenceUScm(referenceUScm);
		record.setReferenceMol(f24.setScale(6, RoundingMode.HALF_UP));
		record.setReferenceStandardUScm(f28.setScale(0, RoundingMode.HALF_UP));
	}

	private void applyComputations(EntryConductivityEntity record) {
		if (record.getType() == ConductivityTypeEnum.High) {
			conductivityHighKclComputation.apply(record, referenceParameterService);
		} else {
			conductivityLowKclComputation.apply(record, referenceParameterService);
		}
		if (record.getCalculatedMol() != null) {
			record.setCalculatedMol(record.getCalculatedMol().setScale(6, RoundingMode.HALF_UP));
		}
		if (record.getCalculatedValue() != null) {
			record.setCalculatedValue(record.getCalculatedValue().setScale(0, RoundingMode.HALF_UP));
		}
		conductivityEntryComputation.apply(record, referenceParameterService);
	}

	private BigDecimal scalar(ConductivityTypeEnum type, String suffix) {
		if (type == ConductivityTypeEnum.High) {
			return switch (suffix) {
				case "C25" -> scalar(ReferenceParameterCodes.KCL_HIGH_C25, ReferenceParameterDefaults.KCL_HIGH_C25);
				case "B24" -> scalar(ReferenceParameterCodes.KCL_HIGH_B24, ReferenceParameterDefaults.KCL_HIGH_B24);
				case "C24" -> scalar(ReferenceParameterCodes.KCL_HIGH_C24, ReferenceParameterDefaults.KCL_HIGH_C24);
				case "F24" -> scalar(ReferenceParameterCodes.KCL_HIGH_F24, ReferenceParameterDefaults.KCL_HIGH_F24);
				case "F28" -> scalar(ReferenceParameterCodes.KCL_HIGH_F28, ReferenceParameterDefaults.KCL_HIGH_F28);
				default -> throw new IllegalArgumentException("Constante de referencia no soportada: " + suffix);
			};
		}
		return switch (suffix) {
			case "C25" -> scalar(ReferenceParameterCodes.KCL_LOW_C25, ReferenceParameterDefaults.KCL_LOW_C25);
			case "B24" -> scalar(ReferenceParameterCodes.KCL_LOW_B24, ReferenceParameterDefaults.KCL_LOW_B24);
			case "C24" -> scalar(ReferenceParameterCodes.KCL_LOW_C24, ReferenceParameterDefaults.KCL_LOW_C24);
			case "F24" -> scalar(ReferenceParameterCodes.KCL_LOW_F24, ReferenceParameterDefaults.KCL_LOW_F24);
			case "F28" -> scalar(ReferenceParameterCodes.KCL_LOW_F28, ReferenceParameterDefaults.KCL_LOW_F28);
			default -> throw new IllegalArgumentException("Constante de referencia no soportada: " + suffix);
		};
	}

	private BigDecimal scalar(String code, BigDecimal defaultValue) {
		BigDecimal min = referenceParameterService.getMinValue(code, defaultValue);
		BigDecimal max = referenceParameterService.getMaxValue(code, defaultValue);
		if (min != null && max != null && min.compareTo(max) == 0) {
			return min;
		}
		return min != null ? min : max != null ? max : defaultValue;
	}

	private UserEntity resolveReviewer(ConductivityReviewRequestDTO request, CcasaUserDetails principal) {
		if (request != null && request.reviewerUserId() != null) {
			return requireUser(request.reviewerUserId(), "Usuario revisor no encontrado.");
		}
		Long principalUserId = principal != null ? principal.getUserIdAsLong() : null;
		if (principalUserId != null) {
			UserEntity principalUser = requireUser(principalUserId, "Usuario autenticado no encontrado.");
			if (isReviewerCandidate(principalUser)) {
				return principalUser;
			}
		}
		List<UserEntity> tcmUsers = userRepository.findActiveByNomenclature(REVIEWER_NOMENCLATURE);
		if (!tcmUsers.isEmpty()) {
			return tcmUsers.getFirst();
		}
		List<UserEntity> tmcUsers = userRepository.findActiveByNomenclature(ALT_REVIEWER_NOMENCLATURE);
		if (!tmcUsers.isEmpty()) {
			return tmcUsers.getFirst();
		}
		throw new BusinessRuleException(
			"REVIEWER_NOT_FOUND",
			"No existe un usuario activo con nomenclatura TCM/TMC para revisar la conductividad."
		);
	}

	private void validateReviewer(UserEntity reviewer) {
		if (!isReviewerCandidate(reviewer)) {
			throw new BusinessRuleException(
				"INVALID_REVIEWER",
				"El usuario revisor debe tener nomenclatura TCM/TMC o rol Supervisor/Admin."
			);
		}
	}

	private boolean isReviewerCandidate(UserEntity reviewer) {
		if (reviewer == null || !reviewer.isActive()) {
			return false;
		}
		String nomenclature = reviewer.getNomenclature();
		if (REVIEWER_NOMENCLATURE.equalsIgnoreCase(nomenclature) || ALT_REVIEWER_NOMENCLATURE.equalsIgnoreCase(nomenclature)) {
			return true;
		}
		if (reviewer.getRole() == null || reviewer.getRole().getName() == null) {
			return false;
		}
		String roleName = reviewer.getRole().getName().name();
		return "SUPERVISOR".equalsIgnoreCase(roleName) || "ADMIN".equalsIgnoreCase(roleName);
	}

	private EntryEntity requireEntry(EntryConductivityEntity record) {
		EntryEntity entry = record.getEntry();
		if (entry == null || entry.getId() == null) {
			throw new BusinessRuleException("ENTRY_NOT_FOUND", "La entrada base del registro no existe.");
		}
		return entryRepository.findByIdAndDeletedAtIsNull(entry.getId())
			.orElseThrow(() -> new BusinessRuleException("ENTRY_NOT_FOUND", "La entrada base del registro no existe."));
	}

	private ConductivityRecordResponseDTO toDto(EntryConductivityEntity record) {
		EntryEntity entry = record.getEntry();
		UserEntity createdBy = entry != null ? entry.getUser() : null;
		UserEntity reviewer = record.getReviewerUser();
		return new ConductivityRecordResponseDTO(
			record.getId(),
			entry != null ? entry.getId() : null,
			record.getDisplayFolio(),
			record.getType(),
			record.getWeightGrams(),
			record.getReferenceUScm(),
			record.getReferenceMol(),
			record.getCalculatedMol(),
			record.getReferenceStandardUScm(),
			record.getCalculatedValue(),
			record.getInRange(),
			entry != null ? entry.getRecordedAt() : null,
			record.getPreparationTime(),
			record.getObservation(),
			entry != null ? entry.getStatus() : null,
			createdBy != null ? createdBy.getId() : null,
			fullName(createdBy),
			createdBy != null ? createdBy.getNomenclature() : null,
			reviewer != null ? reviewer.getId() : null,
			fullName(reviewer),
			reviewer != null ? reviewer.getNomenclature() : null,
			record.getReviewedAt()
		);
	}

	private String fullName(UserEntity user) {
		if (user == null) {
			return null;
		}
		String firstName = user.getFirstName() != null ? user.getFirstName().trim() : "";
		String lastName = user.getLastName() != null ? user.getLastName().trim() : "";
		String joined = (firstName + " " + lastName).trim();
		return joined.isEmpty() ? user.getEmail() : joined;
	}

	private String normalizeBlank(String value) {
		return value == null || value.trim().isEmpty() ? null : value.trim();
	}

	private void writePdf(Document document, EntryConductivityEntity record) throws Exception {
		ConductivityRecordResponseDTO dto = toDto(record);
		document.add(headerLine(dto));
		document.add(new Paragraph(" "));
		document.add(topBodyTable(dto));
		document.add(new Paragraph(" "));
		document.add(centered("Se analiza de acuerdo al procedimiento de control de calidad con las siguientes muestras:", BODY_FONT));
		document.add(centered("VERIFICACION", LABEL_FONT));
		document.add(new Paragraph(" "));
		document.add(signaturesBlock(dto, record));
		document.add(new Paragraph(" "));
		document.add(observationsBlock(dto));
		document.add(new Paragraph(" "));
		document.add(calculationsBlock(dto));
	}

	private PdfPTable headerLine(ConductivityRecordResponseDTO dto) {
		PdfPTable header = new PdfPTable(new float[] { 0.7f, 0.6f, 1f, 0.6f, 0.9f });
		header.setWidthPercentage(100);
		header.addCell(cell("Folio No.", LABEL_FONT, Element.ALIGN_LEFT, false));
		header.addCell(cell(safe(dto.displayFolio()), LABEL_FONT, Element.ALIGN_CENTER, true));
		header.addCell(cell("", BODY_FONT, Element.ALIGN_LEFT, false));
		header.addCell(cell("Fecha:", LABEL_FONT, Element.ALIGN_RIGHT, false));
		header.addCell(cell(safe(PDF_DATE.format(dto.recordedAt() != null ? dto.recordedAt() : Instant.now())), LABEL_FONT, Element.ALIGN_CENTER, true));
		return header;
	}

	private PdfPTable topBodyTable(ConductivityRecordResponseDTO dto) {
		PdfPTable table = new PdfPTable(new float[] { 1.2f, 1.1f, 1.1f, 1.3f });
		table.setWidthPercentage(100);
		table.addCell(cell("Preparacion de estandar de control de la calidad, de", BODY_FONT, Element.ALIGN_CENTER, false, 4));
		table.addCell(cell("KCl", LABEL_FONT, Element.ALIGN_CENTER, true));
		table.addCell(cell("marca", BODY_FONT, Element.ALIGN_CENTER, false));
		table.addCell(cell("MCF", LABEL_FONT, Element.ALIGN_CENTER, true));
		table.addCell(cell("lote B1293638", LABEL_FONT, Element.ALIGN_CENTER, true));
		table.addCell(cell("pureza 100%", BODY_FONT, Element.ALIGN_CENTER, true));
		table.addCell(cell("concentracion de", BODY_FONT, Element.ALIGN_CENTER, false));
		table.addCell(cell("g/mol", LABEL_FONT, Element.ALIGN_CENTER, true));
		table.addCell(cell("peso, tomo la cantidad de", BODY_FONT, Element.ALIGN_CENTER, false));
		table.addCell(cell(fixed(dto.weightGrams(), 4) + " g", LABEL_FONT, Element.ALIGN_CENTER, true));
		table.addCell(cell("usando balanza", BODY_FONT, Element.ALIGN_CENTER, false));
		table.addCell(cell("M-BAD-01 F:25", LABEL_FONT, Element.ALIGN_CENTER, true));
		table.addCell(cell("usando horno M-HS-01 F:05", LABEL_FONT, Element.ALIGN_CENTER, true));
		table.addCell(cell("disuelvo y aforo a 1000 ml", BODY_FONT, Element.ALIGN_CENTER, true));
		table.addCell(cell("con un matraz", BODY_FONT, Element.ALIGN_CENTER, false));
		table.addCell(cell("Vol. 1000 ml. 01-FQ", LABEL_FONT, Element.ALIGN_CENTER, true));
		table.addCell(cell("usando como disolvente 1-MT/02 F:22", BODY_FONT, Element.ALIGN_CENTER, true, 2));
		table.addCell(cell("obteniendo la concentracion final de", BODY_FONT, Element.ALIGN_CENTER, false));
		table.addCell(cell(fixed(dto.calculatedValue(), 0) + " uS/cm", LABEL_FONT, Element.ALIGN_CENTER, true));
		return table;
	}

	private PdfPTable signaturesBlock(ConductivityRecordResponseDTO dto, EntryConductivityEntity record) {
		PdfPTable signatures = new PdfPTable(new float[] { 1f, 1f, 1f });
		signatures.setWidthPercentage(100);
		signatures.addCell(signatureCell("Prepara", dto.createdByNomenclature(), dto.createdByName(), entryUser(record)));
		signatures.addCell(signatureCell("Analiza", "MUESTREO", "MUESTREO", null));
		signatures.addCell(signatureCell("Revisa", dto.reviewerNomenclature(), dto.reviewerName(), record.getReviewerUser()));
		return signatures;
	}

	private PdfPTable observationsBlock(ConductivityRecordResponseDTO dto) {
		PdfPTable obs = new PdfPTable(new float[] { 0.6f, 1.4f, 1f });
		obs.setWidthPercentage(100);
		obs.addCell(cell("Observaciones:", LABEL_FONT, Element.ALIGN_LEFT, false));
		obs.addCell(
			cell(
				"HORA DE PREPARACION: " + safe(dto.preparationTime() != null ? dto.preparationTime().toString() : ""),
				BODY_FONT,
				Element.ALIGN_LEFT,
				true
			)
		);
		obs.addCell(cell(safe(dto.observation()) != null && !safe(dto.observation()).isBlank() ? safe(dto.observation()) : "AGUA LIBRE DE CO2", BODY_FONT, Element.ALIGN_LEFT, true));
		return obs;
	}

	private PdfPTable calculationsBlock(ConductivityRecordResponseDTO dto) {
		PdfPTable calc = new PdfPTable(new float[] { 1f, 1f, 1.1f, 1f });
		calc.setWidthPercentage(100);
		calc.addCell(cell("Calculos:", LABEL_FONT, Element.ALIGN_LEFT, false, 4));
		calc.addCell(cell("7.4565", LABEL_FONT, Element.ALIGN_CENTER, true));
		calc.addCell(cell("0.1", LABEL_FONT, Element.ALIGN_CENTER, true));
		calc.addCell(cell(fixed(dto.referenceUScm(), 4), LABEL_FONT, Element.ALIGN_CENTER, true));
		calc.addCell(cell(fixed(dto.referenceMol(), 2), LABEL_FONT, Element.ALIGN_CENTER, true));
		calc.addCell(cell("x", LABEL_FONT, Element.ALIGN_CENTER, true));
		calc.addCell(cell("0.01", LABEL_FONT, Element.ALIGN_CENTER, true));
		calc.addCell(cell(fixed(dto.weightGrams(), 4), LABEL_FONT, Element.ALIGN_CENTER, true));
		calc.addCell(cell("X", LABEL_FONT, Element.ALIGN_CENTER, true));
		calc.addCell(cell("x=", LABEL_FONT, Element.ALIGN_RIGHT, false));
		calc.addCell(cell(fixed(dto.referenceUScm(), 4) + " uS/cm", LABEL_FONT, Element.ALIGN_CENTER, true));
		calc.addCell(cell("X=", LABEL_FONT, Element.ALIGN_RIGHT, false));
		calc.addCell(cell(fixed(dto.calculatedMol(), 6), LABEL_FONT, Element.ALIGN_CENTER, true));
		calc.addCell(cell(fixed(dto.referenceMol(), 2) + " mol", LABEL_FONT, Element.ALIGN_CENTER, true, 2));
		calc.addCell(cell(fixed(dto.referenceStandardUScm(), 0), LABEL_FONT, Element.ALIGN_CENTER, true));
		calc.addCell(cell("uS/cm", SMALL_FONT, Element.ALIGN_LEFT, false));
		calc.addCell(cell(fixed(dto.calculatedMol(), 6) + " mol", LABEL_FONT, Element.ALIGN_CENTER, true, 2));
		calc.addCell(cell("X", LABEL_FONT, Element.ALIGN_CENTER, true));
		calc.addCell(cell("", BODY_FONT, Element.ALIGN_LEFT, false));
		calc.addCell(cell("X=", LABEL_FONT, Element.ALIGN_RIGHT, false));
		calc.addCell(cell(fixed(dto.calculatedValue(), 0), LABEL_FONT, Element.ALIGN_CENTER, true));
		calc.addCell(cell("uS/cm", SMALL_FONT, Element.ALIGN_LEFT, false));
		return calc;
	}

	private Paragraph centered(String text, Font font) {
		Paragraph paragraph = new Paragraph(text, font);
		paragraph.setAlignment(Element.ALIGN_CENTER);
		return paragraph;
	}

	private void addLabelValue(PdfPTable table, String label, String value) {
		table.addCell(cell(label, LABEL_FONT, Element.ALIGN_LEFT, true));
		table.addCell(cell(safe(value), BODY_FONT, Element.ALIGN_LEFT, true));
	}

	private PdfPCell cell(String text, Font font, int align, boolean border) {
		PdfPCell cell = new PdfPCell(new Phrase(safe(text), font));
		cell.setHorizontalAlignment(align);
		cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
		cell.setPadding(6f);
		cell.setBorder(border ? Rectangle.BOX : Rectangle.NO_BORDER);
		return cell;
	}

	private PdfPCell cell(String text, Font font, int align, boolean border, int colspan) {
		PdfPCell cell = cell(text, font, align, border);
		cell.setColspan(colspan);
		return cell;
	}

	private PdfPCell signatureCell(String label, String nomenclature, String name, UserEntity user) {
		PdfPCell cell = new PdfPCell();
		cell.setPadding(8f);
		cell.setBorder(Rectangle.BOX);
		cell.addElement(new Paragraph(label + ": " + safe(nomenclature), LABEL_FONT));
		cell.addElement(new Paragraph(safe(name), BODY_FONT));
		addSignatureImage(cell, user);
		return cell;
	}

	private void addSignatureImage(PdfPCell cell, UserEntity user) {
		if (user == null || user.getSignatureStoragePath() == null || user.getSignatureStoragePath().isBlank()) {
			return;
		}
		try {
			Path signaturePath = Path.of(user.getSignatureStoragePath());
			if (!Files.exists(signaturePath)) {
				return;
			}
			Image image = Image.getInstance(signaturePath.toAbsolutePath().toString());
			image.scaleToFit(100f, 40f);
			image.setAlignment(Element.ALIGN_LEFT);
			cell.addElement(image);
		} catch (Exception ignored) {
			// Si la firma no puede renderizarse no bloqueamos la exportación del PDF.
		}
	}

	private UserEntity entryUser(EntryConductivityEntity record) {
		return record.getEntry() != null ? record.getEntry().getUser() : null;
	}

	private String safe(String value) {
		return value == null ? "" : value;
	}

	private String decimal(BigDecimal value, int scale) {
		if (value == null) {
			return "";
		}
		return value.setScale(scale, RoundingMode.HALF_UP).stripTrailingZeros().toPlainString();
	}

	private String fixed(BigDecimal value, int scale) {
		if (value == null) {
			return "";
		}
		return value.setScale(scale, RoundingMode.HALF_UP).toPlainString();
	}

	private String sanitizeFileName(String value) {
		String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
			.replaceAll("\\p{M}+", "")
			.replaceAll("[^a-zA-Z0-9._-]+", "_");
		return normalized.isBlank() ? "conductividad" : normalized;
	}
}
