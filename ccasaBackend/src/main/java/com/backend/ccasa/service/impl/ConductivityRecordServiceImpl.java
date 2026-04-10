package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.BusinessRuleException;
import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.FolioBlockEntity;
import com.backend.ccasa.persistence.entities.FolioEntity;
import com.backend.ccasa.persistence.entities.LogbookEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.entities.entry.EntryConductivityEntity;
import com.backend.ccasa.persistence.repositories.ConductivitySpecifications;
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
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
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
	private static final String PDF_LOGO_CLASSPATH = "static/images/lab-logo.png";

	private static final Color COLOR_NAVY = new Color(44, 62, 80);
	private static final Color COLOR_GRAY_LIGHT = new Color(244, 246, 247);
	private static final Color COLOR_GRAY_MID = new Color(189, 195, 199);
	private static final Color COLOR_GRAY_DARK = new Color(127, 140, 141);
	private static final Color COLOR_WHITE = Color.WHITE;
	private static final Color COLOR_ROW_ALT = new Color(248, 249, 250);
	private static final Color COLOR_RESULT_ROW = new Color(234, 236, 238);

	private static final Font F_11_BOLD_NAVY = new Font(Font.HELVETICA, 11f, Font.BOLD, COLOR_NAVY);
	private static final Font F_8_NORMAL_GRAY_DARK = new Font(Font.HELVETICA, 8f, Font.NORMAL, COLOR_GRAY_DARK);
	private static final Font F_9_BOLD_NAVY = new Font(Font.HELVETICA, 9f, Font.BOLD, COLOR_NAVY);
	private static final Font F_9_BOLD_BLACK = new Font(Font.HELVETICA, 9f, Font.BOLD, Color.BLACK);
	private static final Font F_9_NORMAL_GRAY = new Font(Font.HELVETICA, 9f, Font.NORMAL, COLOR_GRAY_DARK);
	private static final Font F_10_BOLD_BLACK = new Font(Font.HELVETICA, 10f, Font.BOLD, Color.BLACK);
	private static final Font F_8_NORMAL_GRAY = new Font(Font.HELVETICA, 8f, Font.NORMAL, COLOR_GRAY_DARK);
	private static final Font F_9_WHITE_BOLD = new Font(Font.HELVETICA, 9f, Font.BOLD, COLOR_WHITE);
	private static final Font F_10_WHITE_BOLD = new Font(Font.HELVETICA, 10f, Font.BOLD, COLOR_WHITE);
	private static final Font F_14_WHITE_BOLD = new Font(Font.HELVETICA, 14f, Font.BOLD, COLOR_WHITE);
	private static final Font F_8_BOLD_NAVY = new Font(Font.HELVETICA, 8f, Font.BOLD, COLOR_NAVY);
	private static final Font F_9_NORMAL_BLACK = new Font(Font.HELVETICA, 9f, Font.NORMAL, Color.BLACK);

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
		return entryConductivityRepository
			.findAll(
				ConductivitySpecifications.search(
					normalizeBlank(folio),
					fromDate,
					toDate,
					type,
					status,
					createdByUserId,
					reviewerUserId
				)
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
			record.setCalculatedMol(record.getCalculatedMol().setScale(7, RoundingMode.HALF_UP));
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
		document.add(headerDividerThick());
		document.add(new Paragraph(" "));
		document.add(conductivityTypeBanner(dto));
		document.add(new Paragraph(" "));
		document.add(sectionTitleTable("PREPARACIÓN DEL ESTÁNDAR DE CONTROL DE CALIDAD"));
		document.add(new Paragraph(" "));
		document.add(preparationTable(dto));
		document.add(new Paragraph(" "));
		addVerificationBlock(document);
		document.add(new Paragraph(" "));
		document.add(signaturesBlock(dto, record));
		document.add(new Paragraph(" "));
		document.add(observationsBlock(dto));
		document.add(new Paragraph(" "));
		document.add(sectionTitleTable("CÁLCULOS"));
		document.add(new Paragraph(" "));
		document.add(calculationsBlock(dto));
		document.add(new Paragraph(" "));
		document.add(pdfFooter());
	}

	private Image loadClasspathLogo() {
		try (InputStream is = getClass().getClassLoader().getResourceAsStream(PDF_LOGO_CLASSPATH)) {
			if (is == null) {
				return null;
			}
			byte[] bytes = is.readAllBytes();
			return Image.getInstance(bytes);
		} catch (Exception e) {
			return null;
		}
	}

	private PdfPCell buildLogoCell() {
		PdfPCell logoCell = new PdfPCell();
		logoCell.setBorder(Rectangle.NO_BORDER);
		logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
		logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
		logoCell.setPadding(4f);
		Image logo = loadClasspathLogo();
		if (logo != null) {
			logo.scaleToFit(72f, 52f);
			logoCell.addElement(logo);
		} else {
			logoCell.setBackgroundColor(COLOR_NAVY);
			logoCell.setMinimumHeight(52f);
			Paragraph sa = new Paragraph("SA", F_14_WHITE_BOLD);
			sa.setAlignment(Element.ALIGN_CENTER);
			logoCell.addElement(sa);
		}
		return logoCell;
	}

	private PdfPCell folioDateBox(String label, String value) {
		PdfPCell c = new PdfPCell();
		c.setBorder(Rectangle.BOX);
		c.setBorderColor(COLOR_GRAY_MID);
		c.setPadding(6f);
		c.setBackgroundColor(COLOR_WHITE);
		c.addElement(new Paragraph(label, F_8_NORMAL_GRAY));
		c.addElement(new Paragraph(value, F_9_BOLD_BLACK));
		return c;
	}

	private PdfPTable headerLine(ConductivityRecordResponseDTO dto) {
		PdfPTable outer = new PdfPTable(new float[] { 0.85f, 2.15f });
		outer.setWidthPercentage(100);
		outer.addCell(buildLogoCell());

		PdfPTable headerInner = new PdfPTable(new float[] { 1.5f, 1f });
		headerInner.setWidthPercentage(100);

		PdfPCell leftTitles = new PdfPCell();
		leftTitles.setBorder(Rectangle.NO_BORDER);
		leftTitles.addElement(new Paragraph("BITÁCORAS SERVICIOS AMBIENTALES", F_11_BOLD_NAVY));
		leftTitles.addElement(new Paragraph("Laboratorio de análisis ambiental · Control de calidad", F_8_NORMAL_GRAY_DARK));

		PdfPTable boxes = new PdfPTable(new float[] { 1f, 1f });
		boxes.setWidthPercentage(100);
		boxes.addCell(folioDateBox("Folio No.", safe(dto.displayFolio())));
		boxes.addCell(folioDateBox(
			"Fecha",
			safe(PDF_DATE.format(dto.recordedAt() != null ? dto.recordedAt() : Instant.now()))));

		PdfPCell rightBoxes = new PdfPCell(boxes);
		rightBoxes.setBorder(Rectangle.NO_BORDER);
		rightBoxes.setVerticalAlignment(Element.ALIGN_TOP);

		headerInner.addCell(leftTitles);
		headerInner.addCell(rightBoxes);

		PdfPCell wrap = new PdfPCell(headerInner);
		wrap.setBorder(Rectangle.NO_BORDER);
		outer.addCell(wrap);
		return outer;
	}

	private PdfPTable headerDividerThick() {
		PdfPTable t = new PdfPTable(1);
		t.setSpacingBefore(4f);
		t.setWidthPercentage(100);
		PdfPCell c = new PdfPCell();
		c.setFixedHeight(2.5f);
		c.setBorder(Rectangle.NO_BORDER);
		c.setBackgroundColor(COLOR_NAVY);
		t.addCell(c);
		return t;
	}

	private String tipoRfq05(ConductivityRecordResponseDTO dto) {
		if (dto.type() == ConductivityTypeEnum.High) {
			return "Alta (KCl) — Estándar RF-05";
		}
		if (dto.type() == ConductivityTypeEnum.Low) {
			return "Baja (KCl) — Estándar RF-05";
		}
		return "—";
	}

	private PdfPTable conductivityTypeBanner(ConductivityRecordResponseDTO dto) {
		PdfPTable outer = new PdfPTable(new float[] { 2.4f, 1f });
		outer.setWidthPercentage(100);

		PdfPCell left = new PdfPCell();
		left.setBorder(Rectangle.BOX);
		left.setBorderColor(COLOR_GRAY_MID);
		left.setBackgroundColor(COLOR_GRAY_LIGHT);
		left.setPadding(10f);
		left.addElement(new Paragraph("TIPO DE CONDUCTIVIDAD:", F_8_NORMAL_GRAY));
		left.addElement(new Paragraph(tipoRfq05(dto), F_10_BOLD_BLACK));

		PdfPCell right = new PdfPCell();
		right.setBorder(Rectangle.BOX);
		right.setBorderColor(COLOR_GRAY_MID);
		right.setBackgroundColor(COLOR_GRAY_LIGHT);
		right.setPadding(8f);
		right.setVerticalAlignment(Element.ALIGN_MIDDLE);
		right.setHorizontalAlignment(Element.ALIGN_CENTER);
		Boolean ir = dto.inRange();
		if (ir == null) {
			right.addElement(new Paragraph(" ", F_9_NORMAL_BLACK));
		} else if (Boolean.TRUE.equals(ir)) {
			Paragraph ok = new Paragraph("\u2713 En rango aceptable", F_9_BOLD_NAVY);
			ok.setAlignment(Element.ALIGN_CENTER);
			right.addElement(ok);
		} else {
			Paragraph bad = new Paragraph("\u2717 Fuera de rango", F_9_BOLD_NAVY);
			bad.setAlignment(Element.ALIGN_CENTER);
			right.addElement(bad);
		}

		outer.addCell(left);
		outer.addCell(right);
		return outer;
	}

	private PdfPTable sectionTitleTable(String title) {
		PdfPTable wrap = new PdfPTable(1);
		wrap.setWidthPercentage(100);
		PdfPCell c = new PdfPCell(new Phrase(title, F_9_BOLD_NAVY));
		c.setBorder(Rectangle.LEFT);
		c.setBorderWidthLeft(3f);
		c.setBorderColorLeft(COLOR_NAVY);
		c.setPaddingLeft(10f);
		c.setPaddingTop(6f);
		c.setPaddingBottom(4f);
		c.setBorderWidthTop(0f);
		c.setBorderWidthRight(0f);
		c.setBorderWidthBottom(0f);
		wrap.addCell(c);
		return wrap;
	}

	private PdfPCell prepCell(String text, Font font, Color bg, int align) {
		PdfPCell c = new PdfPCell(new Phrase(safe(text), font));
		c.setBackgroundColor(bg);
		c.setBorder(Rectangle.BOX);
		c.setBorderColor(COLOR_GRAY_MID);
		c.setPadding(6f);
		c.setHorizontalAlignment(align);
		c.setVerticalAlignment(Element.ALIGN_MIDDLE);
		return c;
	}

	private void addPrepFullRow(PdfPTable table, String text, int rowIndex) {
		Color bg = rowIndex % 2 == 0 ? COLOR_WHITE : COLOR_ROW_ALT;
		PdfPCell c = prepCell(text, F_9_NORMAL_BLACK, bg, Element.ALIGN_LEFT);
		c.setColspan(5);
		table.addCell(c);
	}

	private PdfPTable preparationTable(ConductivityRecordResponseDTO dto) {
		PdfPTable table = new PdfPTable(new float[] { 1f, 1f, 1f, 1f, 1.1f });
		table.setWidthPercentage(100);

		String[] headers = { "Reactivo", "Marca", "Lote", "Pureza", "Concentración" };
		for (String h : headers) {
			table.addCell(prepCell(h, F_9_WHITE_BOLD, COLOR_NAVY, Element.ALIGN_CENTER));
		}

		table.addCell(prepCell("KCl", F_9_NORMAL_BLACK, COLOR_WHITE, Element.ALIGN_CENTER));
		table.addCell(prepCell("MCF", F_9_NORMAL_BLACK, COLOR_WHITE, Element.ALIGN_CENTER));
		table.addCell(prepCell("B1293638", F_9_NORMAL_BLACK, COLOR_WHITE, Element.ALIGN_CENTER));
		table.addCell(prepCell("100%", F_9_NORMAL_BLACK, COLOR_WHITE, Element.ALIGN_CENTER));
		table.addCell(prepCell(fixed(dto.referenceMol(), 4) + " mol", F_9_NORMAL_BLACK, COLOR_WHITE, Element.ALIGN_CENTER));

		int r = 0;
		addPrepFullRow(
			table,
			"Peso: " + fixed(dto.weightGrams(), 4) + " g · Balanza M-BAD-01 F:25",
			r++);
		addPrepFullRow(table, "Horno: M-HS-01 F:05", r++);
		addPrepFullRow(
			table,
			"Matraz Vol. 1000 ml. 01-FQ · Disolvente 1-MT/02 F:22 · Aforo 1000 ml",
			r++);
		addPrepFullRow(
			table,
			"Concentración final (lectura conductivímetro): " + fixed(dto.calculatedValue(), 0) + " \u00B5S/cm",
			r);
		return table;
	}

	private void addVerificationBlock(Document document) throws Exception {
		Paragraph p = new Paragraph(
			"Se analiza de acuerdo al procedimiento de control de calidad con las siguientes muestras:",
			F_9_NORMAL_GRAY);
		p.setAlignment(Element.ALIGN_CENTER);
		document.add(p);
		Paragraph v = new Paragraph("VERIFICACIÓN", F_9_BOLD_BLACK);
		v.setAlignment(Element.ALIGN_CENTER);
		document.add(v);
	}

	private PdfPTable signaturesBlock(ConductivityRecordResponseDTO dto, EntryConductivityEntity record) {
		PdfPTable signatures = new PdfPTable(new float[] { 1f, 1f, 1f });
		signatures.setWidthPercentage(100);
		signatures.addCell(signatureBlockCell("PREPARA", dto.createdByNomenclature(), dto.createdByName(), entryUser(record)));
		signatures.addCell(signatureBlockCell("ANALIZA", "MUESTREO", "MUESTREO", null));
		signatures.addCell(signatureBlockCell("REVISA", dto.reviewerNomenclature(), dto.reviewerName(), record.getReviewerUser()));
		return signatures;
	}

	private PdfPCell signatureBlockCell(String roleHeader, String nomenclature, String name, UserEntity user) {
		PdfPCell cell = new PdfPCell();
		cell.setPadding(12f);
		cell.setBorder(Rectangle.BOX);
		cell.setBorderColor(COLOR_GRAY_MID);
		cell.setMinimumHeight(115f);

		cell.addElement(new Paragraph(roleHeader, F_8_BOLD_NAVY));
		PdfPTable sep = new PdfPTable(1);
		sep.setWidthPercentage(100);
		PdfPCell sepc = new PdfPCell();
		sepc.setFixedHeight(2f);
		sepc.setBorder(Rectangle.BOTTOM);
		sepc.setBorderColorBottom(COLOR_GRAY_MID);
		sepc.setBorderWidthBottom(1f);
		sepc.setPadding(0f);
		sep.addCell(sepc);
		cell.addElement(sep);

		cell.addElement(new Paragraph(safe(name), F_10_BOLD_BLACK));
		cell.addElement(new Paragraph(safe(nomenclature), F_8_NORMAL_GRAY));

		addSignatureImage(cell, user);

		Paragraph sigLine = new Paragraph("_____________________________", F_8_NORMAL_GRAY);
		sigLine.setAlignment(Element.ALIGN_CENTER);
		cell.addElement(sigLine);
		return cell;
	}

	private PdfPTable observationsBlock(ConductivityRecordResponseDTO dto) {
		PdfPTable obs = new PdfPTable(new float[] { 1f, 1f });
		obs.setWidthPercentage(100);

		PdfPCell c1 = new PdfPCell();
		c1.setBorder(Rectangle.BOX);
		c1.setBorderColor(COLOR_GRAY_MID);
		c1.setPadding(8f);
		c1.addElement(new Paragraph("HORA DE PREPARACIÓN", F_8_NORMAL_GRAY));
		c1.addElement(new Paragraph(
			safe(dto.preparationTime() != null ? dto.preparationTime().toString() : "—"),
			F_10_BOLD_BLACK));

		String obsText = safe(dto.observation()) != null && !safe(dto.observation()).isBlank()
			? safe(dto.observation())
			: "AGUA LIBRE DE CO2";
		PdfPCell c2 = new PdfPCell();
		c2.setBorder(Rectangle.BOX);
		c2.setBorderColor(COLOR_GRAY_MID);
		c2.setPadding(8f);
		c2.addElement(new Paragraph("OBSERVACIONES", F_8_NORMAL_GRAY));
		c2.addElement(new Paragraph(obsText, F_9_NORMAL_BLACK));

		obs.addCell(c1);
		obs.addCell(c2);
		return obs;
	}

	private PdfPCell calcDataCell(String text, Font font, Color bg, int align, int colspan) {
		PdfPCell c = new PdfPCell(new Phrase(safe(text), font));
		c.setColspan(colspan);
		c.setBackgroundColor(bg);
		c.setBorder(Rectangle.BOX);
		c.setBorderColor(COLOR_GRAY_MID);
		c.setPadding(5f);
		c.setHorizontalAlignment(align);
		c.setVerticalAlignment(Element.ALIGN_MIDDLE);
		return c;
	}

	private PdfPTable calculationsBlock(ConductivityRecordResponseDTO dto) {
		PdfPTable calc = new PdfPTable(new float[] { 1f, 1f, 1.1f, 1f });
		calc.setWidthPercentage(100);

		Color r0 = COLOR_WHITE;
		Color r1 = COLOR_ROW_ALT;

		calc.addCell(calcDataCell("7.4565", F_9_NORMAL_BLACK, r0, Element.ALIGN_CENTER, 1));
		calc.addCell(calcDataCell("0.1", F_9_NORMAL_BLACK, r0, Element.ALIGN_CENTER, 1));
		calc.addCell(calcDataCell(fixed(dto.referenceUScm(), 4), F_9_NORMAL_BLACK, r0, Element.ALIGN_CENTER, 1));
		calc.addCell(calcDataCell(fixed(dto.referenceMol(), 4), F_9_NORMAL_BLACK, r0, Element.ALIGN_CENTER, 1));

		calc.addCell(calcDataCell("x", F_9_NORMAL_BLACK, r1, Element.ALIGN_CENTER, 1));
		calc.addCell(calcDataCell("0.01", F_9_NORMAL_BLACK, r1, Element.ALIGN_CENTER, 1));
		calc.addCell(calcDataCell(fixed(dto.weightGrams(), 4), F_9_NORMAL_BLACK, r1, Element.ALIGN_CENTER, 1));
		calc.addCell(calcDataCell("X", F_9_NORMAL_BLACK, r1, Element.ALIGN_CENTER, 1));

		calc.addCell(calcDataCell("x=", F_9_NORMAL_BLACK, r0, Element.ALIGN_RIGHT, 1));
		calc.addCell(calcDataCell(fixed(dto.referenceUScm(), 4) + " uS/cm", F_9_NORMAL_BLACK, r0, Element.ALIGN_CENTER, 1));
		calc.addCell(calcDataCell("X=", F_9_NORMAL_BLACK, r0, Element.ALIGN_RIGHT, 1));
		calc.addCell(calcDataCell(fixed(dto.calculatedMol(), 7), F_9_NORMAL_BLACK, r0, Element.ALIGN_CENTER, 1));

		calc.addCell(calcDataCell(fixed(dto.referenceMol(), 4) + " mol", F_9_BOLD_NAVY, COLOR_RESULT_ROW, Element.ALIGN_CENTER, 2));
		calc.addCell(calcDataCell(fixed(dto.referenceStandardUScm(), 0), F_9_BOLD_NAVY, COLOR_RESULT_ROW, Element.ALIGN_CENTER, 1));
		calc.addCell(calcDataCell("\u00B5S/cm", F_8_NORMAL_GRAY, COLOR_RESULT_ROW, Element.ALIGN_LEFT, 1));

		calc.addCell(calcDataCell(fixed(dto.calculatedMol(), 6) + " mol", F_9_NORMAL_BLACK, r1, Element.ALIGN_CENTER, 2));
		calc.addCell(calcDataCell("X", F_9_NORMAL_BLACK, r1, Element.ALIGN_CENTER, 1));
		calc.addCell(calcDataCell("", F_9_NORMAL_BLACK, r1, Element.ALIGN_LEFT, 1));

		calc.addCell(calcDataCell("X=", F_9_NORMAL_BLACK, r0, Element.ALIGN_RIGHT, 1));
		calc.addCell(calcDataCell(fixed(dto.calculatedValue(), 0), F_9_NORMAL_BLACK, r0, Element.ALIGN_CENTER, 1));
		calc.addCell(calcDataCell("\u00B5S/cm", F_8_NORMAL_GRAY, r0, Element.ALIGN_LEFT, 1));
		calc.addCell(calcDataCell("", F_9_NORMAL_BLACK, r0, Element.ALIGN_LEFT, 1));

		PdfPCell finalRow = new PdfPCell(
			new Phrase(
				"mol calculado: " + fixed(dto.calculatedMol(), 7) + " mol   ·   Conductividad calculada: "
					+ fixed(dto.calculatedValue(), 0) + " \u00B5S/cm",
				F_10_WHITE_BOLD));
		finalRow.setColspan(4);
		finalRow.setBackgroundColor(COLOR_NAVY);
		finalRow.setBorder(Rectangle.BOX);
		finalRow.setBorderColor(COLOR_NAVY);
		finalRow.setPadding(10f);
		finalRow.setHorizontalAlignment(Element.ALIGN_CENTER);
		finalRow.setVerticalAlignment(Element.ALIGN_MIDDLE);
		calc.addCell(finalRow);

		return calc;
	}

	private PdfPTable pdfFooter() {
		PdfPTable t = new PdfPTable(new float[] { 1f, 1f });
		t.setWidthPercentage(100);
		PdfPCell line = new PdfPCell();
		line.setColspan(2);
		line.setFixedHeight(1f);
		line.setBackgroundColor(COLOR_GRAY_MID);
		line.setBorder(Rectangle.NO_BORDER);
		t.addCell(line);

		PdfPCell left = new PdfPCell(new Phrase("Bitácoras Servicios Ambientales · Sistema BSA Lab", F_8_NORMAL_GRAY));
		left.setBorder(Rectangle.NO_BORDER);
		left.setPaddingTop(6f);

		PdfPCell right = new PdfPCell(new Phrase("Documento generado automáticamente", F_8_NORMAL_GRAY));
		right.setBorder(Rectangle.NO_BORDER);
		right.setHorizontalAlignment(Element.ALIGN_RIGHT);
		right.setPaddingTop(6f);

		t.addCell(left);
		t.addCell(right);
		return t;
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
			image.setAlignment(Element.ALIGN_CENTER);
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
