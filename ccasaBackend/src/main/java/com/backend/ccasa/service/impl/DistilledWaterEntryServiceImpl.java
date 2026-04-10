package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.BusinessRuleException;
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
import com.backend.ccasa.service.models.dtos.DistilledWaterRequestDTO;
import com.backend.ccasa.service.models.dtos.DistilledWaterResponseDTO;
import com.backend.ccasa.service.models.enums.EntryStatusEnum;
import com.backend.ccasa.exceptions.EntryNotFoundException;
import com.backend.ccasa.exceptions.FolioNotFoundException;
import com.backend.ccasa.exceptions.LogbookNotFoundException;
import com.backend.ccasa.exceptions.UserNotFoundException;
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
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio para entradas de agua destilada (RF-08: 3 lecturas â†’ promedios, is_acceptable).
 */
@Service
public class DistilledWaterEntryServiceImpl implements IDistilledWaterEntryService {

	private static final String PDF_LOGO_CLASSPATH = "static/images/lab-logo.png";
	private static final DateTimeFormatter PDF_DATE = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC);
	private static final Font TITLE_FONT = new Font(Font.HELVETICA, 12, Font.BOLD);
	private static final Font LABEL_FONT = new Font(Font.HELVETICA, 9, Font.BOLD);
	private static final Font BODY_FONT = new Font(Font.HELVETICA, 9, Font.NORMAL);

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

	@Override
	@Transactional(readOnly = true)
	public byte[] generatePdf(Long entryId) {
		if (entryId == null) {
			throw new IllegalArgumentException("El id de entrada es obligatorio.");
		}
		EntryEntity entry = entryRepository.findByIdAndDeletedAtIsNull(entryId).orElseThrow(() -> new EntryNotFoundException(entryId));
		EntryDistilledWaterEntity dw = distilledWaterRepository.findByEntry(entry)
			.orElseThrow(() -> new EntryNotFoundException(entryId));
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		Document document = new Document(PageSize.A4, 36, 36, 36, 36);
		try {
			PdfWriter.getInstance(document, output);
			document.open();
			writePdf(document, entry, dw);
		} catch (Exception ex) {
			throw new BusinessRuleException("DISTILLED_WATER_PDF_ERROR", "No fue posible generar el PDF del registro.");
		} finally {
			document.close();
		}
		return output.toByteArray();
	}

	private void writePdf(Document document, EntryEntity entry, EntryDistilledWaterEntity dw) throws Exception {
		document.add(headerWithLogo(entry));
		document.add(new Paragraph(" "));
		Paragraph title = new Paragraph("Preparacion de agua destilada - Verificación RF-08", TITLE_FONT);
		title.setAlignment(Element.ALIGN_CENTER);
		document.add(title);
		document.add(new Paragraph(" "));
		document.add(dataTable(entry, dw));
		document.add(new Paragraph(" "));
		document.add(signaturesBlock(entry));
	}

	private PdfPTable headerWithLogo(EntryEntity entry) {
		PdfPTable outer = new PdfPTable(new float[] { 0.9f, 2.1f });
		outer.setWidthPercentage(100);

		PdfPCell logoCell = new PdfPCell();
		logoCell.setBorder(Rectangle.NO_BORDER);
		logoCell.setVerticalAlignment(Element.ALIGN_TOP);
		Image logo = loadClasspathLogo();
		if (logo != null) {
			logo.scaleToFit(72f, 48f);
			logo.setAlignment(Element.ALIGN_LEFT);
			logoCell.addElement(logo);
		}
		outer.addCell(logoCell);

		PdfPTable folioDate = new PdfPTable(new float[] { 0.7f, 0.6f, 1f, 0.6f, 0.9f });
		folioDate.setWidthPercentage(100);
		FolioEntity folio = entry.getFolio();
		String folioDisplay = folio != null && folio.getFolioNumber() != null ? String.valueOf(folio.getFolioNumber()) : "";
		Instant recordedAt = entry.getRecordedAt() != null ? entry.getRecordedAt() : Instant.now();
		folioDate.addCell(cell("Folio No.", LABEL_FONT, Element.ALIGN_LEFT, false));
		folioDate.addCell(cell(folioDisplay, LABEL_FONT, Element.ALIGN_CENTER, true));
		folioDate.addCell(cell("", BODY_FONT, Element.ALIGN_LEFT, false));
		folioDate.addCell(cell("Fecha:", LABEL_FONT, Element.ALIGN_RIGHT, false));
		folioDate.addCell(cell(safe(PDF_DATE.format(recordedAt)), LABEL_FONT, Element.ALIGN_CENTER, true));

		PdfPCell right = new PdfPCell(folioDate);
		right.setBorder(Rectangle.NO_BORDER);
		outer.addCell(right);
		return outer;
	}

	private Image loadClasspathLogo() {
		try {
			ClassPathResource resource = new ClassPathResource(PDF_LOGO_CLASSPATH);
			if (!resource.exists()) {
				return null;
			}
			try (InputStream in = resource.getInputStream()) {
				return Image.getInstance(in.readAllBytes());
			}
		} catch (Exception ignored) {
			return null;
		}
	}

	private PdfPTable dataTable(EntryEntity entry, EntryDistilledWaterEntity dw) {
		PdfPTable table = new PdfPTable(new float[] { 1.1f, 1.4f });
		table.setWidthPercentage(100);
		LogbookEntity logbook = entry.getLogbook();
		addLabelValue(table, "Nombre de bitácora", logbook != null ? safe(logbook.getName()) : "");
		addLabelValue(table, "Nombre del analista", fullName(entry.getUser()));
		addLabelValue(table, "pH Lectura 1", fixed(dw.getPhReading1(), 3));
		addLabelValue(table, "pH Lectura 2", fixed(dw.getPhReading2(), 3));
		addLabelValue(table, "pH Lectura 3", fixed(dw.getPhReading3(), 3));
		addLabelValue(table, "pH Promedio", fixed(dw.getPhAverage(), 3));
		addLabelValue(table, "CE Lectura 1 (µS/cm)", fixed(dw.getCeReading1(), 4));
		addLabelValue(table, "CE Lectura 2 (µS/cm)", fixed(dw.getCeReading2(), 4));
		addLabelValue(table, "CE Lectura 3 (µS/cm)", fixed(dw.getCeReading3(), 4));
		addLabelValue(table, "CE Promedio (µS/cm)", fixed(dw.getCeAverage(), 4));
		addLabelValue(table, "Diferencia referencia", fixed(dw.getReferenceDifference(), 4));
		addLabelValue(table, "% Control estándar", fixed(dw.getControlStandardPct(), 2));
		addLabelValue(table, "¿Aceptable?", acceptableLabel(dw.getIsAcceptable()));
		return table;
	}

	private PdfPTable signaturesBlock(EntryEntity entry) {
		PdfPTable signatures = new PdfPTable(new float[] { 1f, 1f, 1f });
		signatures.setWidthPercentage(100);
		UserEntity analyst = entry.getUser();
		String analystNom = analyst != null ? safe(analyst.getNomenclature()) : "";
		String analystName = fullName(analyst);
		signatures.addCell(signatureCell("Prepara", analystNom, analystName, analyst));
		signatures.addCell(signatureCell("Analiza", "MUESTREO", "MUESTREO", null));
		signatures.addCell(signatureCell("Revisa", "", "", null));
		return signatures;
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

	private String acceptableLabel(Boolean acceptable) {
		if (acceptable == null) {
			return "—";
		}
		return acceptable ? "Sí" : "No";
	}

	private String fullName(UserEntity user) {
		if (user == null) {
			return "";
		}
		String firstName = user.getFirstName() != null ? user.getFirstName().trim() : "";
		String lastName = user.getLastName() != null ? user.getLastName().trim() : "";
		String joined = (firstName + " " + lastName).trim();
		return joined.isEmpty() ? safe(user.getEmail()) : joined;
	}

	private String safe(String value) {
		return value == null ? "" : value;
	}

	private String fixed(BigDecimal value, int scale) {
		if (value == null) {
			return "";
		}
		return value.setScale(scale, RoundingMode.HALF_UP).toPlainString();
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

