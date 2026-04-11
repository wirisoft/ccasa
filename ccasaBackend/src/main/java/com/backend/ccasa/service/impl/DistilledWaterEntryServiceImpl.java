package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.BusinessRuleException;
import com.backend.ccasa.persistence.entities.BatchEntity;
import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.FolioEntity;
import com.backend.ccasa.persistence.entities.LogbookEntity;
import com.backend.ccasa.persistence.entities.SignatureEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.entities.entry.EntryDistilledWaterEntity;
import com.backend.ccasa.persistence.repositories.BatchRepository;
import com.backend.ccasa.persistence.repositories.EntryDistilledWaterRepository;
import com.backend.ccasa.persistence.repositories.EntryRepository;
import com.backend.ccasa.persistence.repositories.FolioRepository;
import com.backend.ccasa.persistence.repositories.LogbookRepository;
import com.backend.ccasa.persistence.repositories.SignatureRepository;
import com.backend.ccasa.persistence.repositories.UserRepository;
import com.backend.ccasa.service.IDistilledWaterEntryService;
import com.backend.ccasa.service.models.dtos.DistilledWaterRequestDTO;
import com.backend.ccasa.service.models.dtos.DistilledWaterResponseDTO;
import com.backend.ccasa.service.models.enums.EntryStatusEnum;
import com.backend.ccasa.service.models.enums.SignatureTypeEnum;
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
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio para entradas de agua destilada (RF-08: 3 lecturas â†’ promedios, is_acceptable).
 */
@Service
public class DistilledWaterEntryServiceImpl implements IDistilledWaterEntryService {

	private static final String PDF_LOGO_CLASSPATH = "static/images/lab-logo.png";
	private static final DateTimeFormatter PDF_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(ZoneOffset.UTC);

	private static final Map<String, String> ENTRY_STATUS_LABELS = Map.of(
		"Draft", "Borrador",
		"Signed", "Firmado",
		"Locked", "Bloqueado",
		"Approved", "Aprobado"
	);

	private static final Color COLOR_NAVY = new Color(44, 62, 80);
	private static final Color COLOR_GRAY_LIGHT = new Color(244, 246, 247);
	private static final Color COLOR_GRAY_MID = new Color(189, 195, 199);
	private static final Color COLOR_GRAY_DARK = new Color(127, 140, 141);
	private static final Color COLOR_WHITE = Color.WHITE;
	private static final Color COLOR_ROW_ALT = new Color(248, 249, 250);
	private static final Color COLOR_RESULT_ROW = new Color(234, 236, 238);

	private static final Font F_11_BOLD_NAVY = new Font(Font.HELVETICA, 11f, Font.BOLD, COLOR_NAVY);
	private static final Font F_12_BOLD_NAVY = new Font(Font.HELVETICA, 12f, Font.BOLD, COLOR_NAVY);
	private static final Font F_9_BOLD_NAVY = new Font(Font.HELVETICA, 9f, Font.BOLD, COLOR_NAVY);
	private static final Font F_10_BOLD_NAVY = new Font(Font.HELVETICA, 10f, Font.BOLD, COLOR_NAVY);
	private static final Font F_9_BOLD_BLACK = new Font(Font.HELVETICA, 9f, Font.BOLD, Color.BLACK);
	private static final Font F_9_NORMAL_GRAY = new Font(Font.HELVETICA, 9f, Font.NORMAL, COLOR_GRAY_DARK);
	private static final Font F_10_BOLD_BLACK = new Font(Font.HELVETICA, 10f, Font.BOLD, Color.BLACK);
	private static final Font F_8_NORMAL_GRAY = new Font(Font.HELVETICA, 8f, Font.NORMAL, COLOR_GRAY_DARK);
	private static final Font F_9_WHITE_BOLD = new Font(Font.HELVETICA, 9f, Font.BOLD, COLOR_WHITE);
	private static final Font F_14_WHITE_BOLD = new Font(Font.HELVETICA, 14f, Font.BOLD, COLOR_WHITE);
	private static final Font F_8_BOLD_NAVY = new Font(Font.HELVETICA, 8f, Font.BOLD, COLOR_NAVY);
	private static final Font F_9_NORMAL_BLACK = new Font(Font.HELVETICA, 9f, Font.NORMAL, Color.BLACK);

	private final EntryRepository entryRepository;
	private final EntryDistilledWaterRepository distilledWaterRepository;
	private final FolioRepository folioRepository;
	private final LogbookRepository logbookRepository;
	private final UserRepository userRepository;
	private final BatchRepository batchRepository;
	private final SignatureRepository signatureRepository;

	public DistilledWaterEntryServiceImpl(EntryRepository entryRepository,
			EntryDistilledWaterRepository distilledWaterRepository,
			FolioRepository folioRepository,
			LogbookRepository logbookRepository,
			UserRepository userRepository,
			BatchRepository batchRepository,
			SignatureRepository signatureRepository) {
		this.entryRepository = entryRepository;
		this.distilledWaterRepository = distilledWaterRepository;
		this.folioRepository = folioRepository;
		this.logbookRepository = logbookRepository;
		this.userRepository = userRepository;
		this.batchRepository = batchRepository;
		this.signatureRepository = signatureRepository;
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
		Document document = new Document(PageSize.A4, 32, 32, 28, 22);
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
		document.add(headerLine(entry));
		document.add(headerDividerThick());
		document.add(moduleTitleBanner("AGUA DESTILADA — Verificación RF-08"));
		document.add(distilledMainDataTable(entry, dw));
		document.add(distilledReadingsTable(dw));
		document.add(distilledResultsTable(dw));
		addVerificationBlock(document);
		document.add(signaturesBlock(entry));
		document.add(observationsBlock(entry));
		document.add(pdfFooter());
	}

	private PdfPTable headerLine(EntryEntity entry) {
		PdfPTable header = new PdfPTable(new float[] { 1f, 3f, 2.5f });
		header.setWidthPercentage(100);
		header.setSpacingAfter(4f);

		PdfPCell logoCell = new PdfPCell();
		logoCell.setBorder(Rectangle.NO_BORDER);
		logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
		logoCell.setPadding(4f);
		Image logo = loadClasspathLogo();
		if (logo != null) {
			logo.scaleToFit(60f, 50f);
			logoCell.addElement(logo);
		} else {
			logoCell.addElement(new Phrase("SA", F_14_WHITE_BOLD));
			logoCell.setBackgroundColor(COLOR_NAVY);
		}
		header.addCell(logoCell);

		PdfPCell centerCell = new PdfPCell();
		centerCell.setBorder(Rectangle.NO_BORDER);
		centerCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
		centerCell.setPadding(4f);
		centerCell.addElement(new Phrase("BITÁCORAS SERVICIOS AMBIENTALES", F_11_BOLD_NAVY));
		String analystName = fullName(entry.getUser()).trim();
		if (!analystName.isEmpty()) {
			centerCell.addElement(new Phrase(analystName.toUpperCase(Locale.ROOT), F_12_BOLD_NAVY));
		}
		centerCell.addElement(new Phrase("SERVICIOS AMBIENTALES", F_8_NORMAL_GRAY));
		header.addCell(centerCell);

		Font labelFont = F_8_NORMAL_GRAY;
		Font valueFont = F_9_BOLD_NAVY;
		PdfPTable metaTable = new PdfPTable(new float[] { 1f, 1f });
		metaTable.setWidthPercentage(100);
		PdfPCell lbl1 = new PdfPCell(new Phrase("Folio No.", labelFont));
		lbl1.setBorder(Rectangle.TOP | Rectangle.LEFT | Rectangle.RIGHT);
		lbl1.setBorderColor(COLOR_GRAY_MID);
		lbl1.setBorderWidth(0.5f);
		lbl1.setPadding(3f);
		metaTable.addCell(lbl1);
		PdfPCell lbl2 = new PdfPCell(new Phrase("Fecha", labelFont));
		lbl2.setBorder(Rectangle.TOP | Rectangle.LEFT | Rectangle.RIGHT);
		lbl2.setBorderColor(COLOR_GRAY_MID);
		lbl2.setBorderWidth(0.5f);
		lbl2.setPadding(3f);
		metaTable.addCell(lbl2);
		PdfPCell val1 = new PdfPCell(new Phrase(pdfFolioDisplay(entry), valueFont));
		val1.setBorder(Rectangle.BOX);
		val1.setBorderColor(COLOR_GRAY_MID);
		val1.setBorderWidth(0.5f);
		val1.setPadding(3f);
		metaTable.addCell(val1);
		Instant recordedAt = entry.getRecordedAt() != null ? entry.getRecordedAt() : Instant.now();
		PdfPCell val2 = new PdfPCell(new Phrase(PDF_DATE.format(recordedAt), valueFont));
		val2.setBorder(Rectangle.BOX);
		val2.setBorderColor(COLOR_GRAY_MID);
		val2.setBorderWidth(0.5f);
		val2.setPadding(3f);
		val2.setNoWrap(true);
		metaTable.addCell(val2);
		PdfPCell metaCell = new PdfPCell(metaTable);
		metaCell.setBorder(Rectangle.NO_BORDER);
		metaCell.setPadding(0f);
		metaCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
		header.addCell(metaCell);
		return header;
	}

	private String pdfFolioDisplay(EntryEntity entry) {
		if (entry.getFolio() != null && entry.getFolio().getFolioNumber() != null) {
			return entry.getFolio().getFolioNumber().toString();
		}
		return entry.getId() != null ? "REG-" + entry.getId() : "REG-";
	}

	private PdfPTable headerDividerThick() {
		PdfPTable t = new PdfPTable(1);
		t.setSpacingBefore(2f);
		t.setWidthPercentage(100);
		PdfPCell c = new PdfPCell();
		c.setFixedHeight(2.5f);
		c.setBorder(Rectangle.NO_BORDER);
		c.setBackgroundColor(COLOR_NAVY);
		t.addCell(c);
		return t;
	}

	private PdfPTable moduleTitleBanner(String title) {
		PdfPTable wrap = new PdfPTable(1);
		wrap.setWidthPercentage(100);
		PdfPCell c = new PdfPCell(new Phrase(title, F_10_BOLD_NAVY));
		c.setBorder(Rectangle.BOX);
		c.setBorderColor(COLOR_GRAY_MID);
		c.setBorderWidth(0.5f);
		c.setBackgroundColor(COLOR_GRAY_LIGHT);
		c.setPadding(10f);
		c.setVerticalAlignment(Element.ALIGN_MIDDLE);
		wrap.addCell(c);
		return wrap;
	}

	private PdfPCell dataHeaderCell(String text) {
		return dataHeaderCell(text, true);
	}

	private PdfPCell dataHeaderCell(String text, boolean noWrap) {
		PdfPCell c = new PdfPCell(new Phrase(safe(text), F_9_WHITE_BOLD));
		c.setBackgroundColor(COLOR_NAVY);
		c.setBorder(Rectangle.BOX);
		c.setBorderColor(COLOR_GRAY_MID);
		c.setBorderWidth(0.5f);
		c.setPadding(5f);
		c.setHorizontalAlignment(Element.ALIGN_CENTER);
		c.setVerticalAlignment(Element.ALIGN_MIDDLE);
		c.setNoWrap(noWrap);
		return c;
	}

	private PdfPCell dataBodyCell(String text, Font font, Color bg, int align) {
		PdfPCell c = new PdfPCell(new Phrase(safe(text), font));
		c.setBackgroundColor(bg);
		c.setBorder(Rectangle.BOX);
		c.setBorderColor(COLOR_GRAY_MID);
		c.setBorderWidth(0.5f);
		c.setPadding(5f);
		c.setHorizontalAlignment(align);
		c.setVerticalAlignment(Element.ALIGN_MIDDLE);
		return c;
	}

	private PdfPTable distilledMainDataTable(EntryEntity entry, EntryDistilledWaterEntity dw) {
		PdfPTable table = new PdfPTable(new float[] { 1.2f, 1.2f, 1f, 0.8f });
		table.setWidthPercentage(100);
		table.setSpacingBefore(4f);
		table.addCell(dataHeaderCell("Bitácora"));
		table.addCell(dataHeaderCell("Analista"));
		table.addCell(dataHeaderCell("Lote de agua"));
		table.addCell(dataHeaderCell("¿Aceptable?"));
		Color rowBg = COLOR_WHITE;
		LogbookEntity logbook = entry.getLogbook();
		table.addCell(dataBodyCell(logbook != null ? safe(logbook.getName()) : "", F_9_NORMAL_BLACK, rowBg, Element.ALIGN_LEFT));
		table.addCell(dataBodyCell(fullName(entry.getUser()), F_9_NORMAL_BLACK, rowBg, Element.ALIGN_LEFT));
		String lote = "";
		if (dw.getWaterBatch() != null && dw.getWaterBatch().getBatchCode() != null) {
			lote = dw.getWaterBatch().getBatchCode();
		}
		table.addCell(dataBodyCell(lote, F_9_NORMAL_BLACK, rowBg, Element.ALIGN_CENTER));
		table.addCell(dataBodyCell(acceptableLabel(dw.getIsAcceptable()), F_9_BOLD_NAVY, rowBg, Element.ALIGN_CENTER));
		return table;
	}

	private PdfPTable distilledReadingsTable(EntryDistilledWaterEntity dw) {
		PdfPTable table = new PdfPTable(new float[] { 0.9f, 1f, 1f, 1f, 1.1f, 1f, 1f, 1f, 1.35f });
		table.setWidthPercentage(100);
		table.setSpacingBefore(6f);
		String[] headers = {
			"Lectura", "pH 1", "pH 2", "pH 3", "Promedio pH", "CE 1", "CE 2", "CE 3", "Promedio CE"
		};
		for (int i = 0; i < headers.length; i++) {
			String h = headers[i];
			boolean noWrap = i != headers.length - 1;
			table.addCell(dataHeaderCell(h, noWrap));
		}
		Color rowBg = COLOR_ROW_ALT;
		table.addCell(dataBodyCell("Valor", F_9_NORMAL_BLACK, rowBg, Element.ALIGN_CENTER));
		table.addCell(dataBodyCell(fixed(dw.getPhReading1(), 3), F_9_NORMAL_BLACK, rowBg, Element.ALIGN_CENTER));
		table.addCell(dataBodyCell(fixed(dw.getPhReading2(), 3), F_9_NORMAL_BLACK, rowBg, Element.ALIGN_CENTER));
		table.addCell(dataBodyCell(fixed(dw.getPhReading3(), 3), F_9_NORMAL_BLACK, rowBg, Element.ALIGN_CENTER));
		table.addCell(dataBodyCell(fixed(dw.getPhAverage(), 3), F_9_BOLD_BLACK, rowBg, Element.ALIGN_CENTER));
		table.addCell(dataBodyCell(fixed(dw.getCeReading1(), 4), F_9_NORMAL_BLACK, rowBg, Element.ALIGN_CENTER));
		table.addCell(dataBodyCell(fixed(dw.getCeReading2(), 4), F_9_NORMAL_BLACK, rowBg, Element.ALIGN_CENTER));
		table.addCell(dataBodyCell(fixed(dw.getCeReading3(), 4), F_9_NORMAL_BLACK, rowBg, Element.ALIGN_CENTER));
		table.addCell(dataBodyCell(fixed(dw.getCeAverage(), 4), F_9_BOLD_BLACK, rowBg, Element.ALIGN_CENTER));
		return table;
	}

	private PdfPTable distilledResultsTable(EntryDistilledWaterEntity dw) {
		PdfPTable table = new PdfPTable(new float[] { 1.4f, 1f });
		table.setWidthPercentage(100);
		table.setSpacingBefore(6f);
		Color bg0 = COLOR_WHITE;
		Color bg1 = COLOR_ROW_ALT;
		table.addCell(dataBodyCell("Diferencia referencia", F_9_NORMAL_BLACK, bg0, Element.ALIGN_LEFT));
		table.addCell(dataBodyCell(fixed(dw.getReferenceDifference(), 4), F_9_BOLD_BLACK, bg0, Element.ALIGN_RIGHT));
		table.addCell(dataBodyCell("% Control estándar", F_9_NORMAL_BLACK, bg1, Element.ALIGN_LEFT));
		table.addCell(dataBodyCell(fixed(dw.getControlStandardPct(), 2), F_9_BOLD_BLACK, bg1, Element.ALIGN_RIGHT));
		table.addCell(dataBodyCell("¿Aceptable?", F_9_NORMAL_BLACK, bg0, Element.ALIGN_LEFT));
		Boolean ok = dw.getIsAcceptable();
		String label = acceptableLabel(ok);
		Font valFont = Boolean.TRUE.equals(ok) ? F_9_BOLD_NAVY : F_9_BOLD_BLACK;
		Color valBg = Boolean.TRUE.equals(ok) ? COLOR_RESULT_ROW : COLOR_GRAY_LIGHT;
		table.addCell(dataBodyCell(label, valFont, valBg, Element.ALIGN_CENTER));
		return table;
	}

	private void addVerificationBlock(Document document) throws Exception {
		Paragraph p = new Paragraph(
			"Se analiza de acuerdo al procedimiento de control de calidad con las siguientes muestras:",
			F_9_NORMAL_GRAY);
		p.setAlignment(Element.ALIGN_CENTER);
		p.setSpacingBefore(8f);
		p.setSpacingAfter(0f);
		p.setLeading(11f);
		document.add(p);
		Paragraph v = new Paragraph("AJUSTE", F_9_BOLD_BLACK);
		v.setAlignment(Element.ALIGN_CENTER);
		v.setSpacingBefore(0f);
		v.setSpacingAfter(0f);
		v.setLeading(12f);
		document.add(v);
	}

	private PdfPTable signaturesBlock(EntryEntity entry) {
		PdfPTable signatures = new PdfPTable(new float[] { 1f, 1f, 1f });
		signatures.setWidthPercentage(100);
		signatures.setSpacingBefore(8f);
		List<SignatureEntity> signatureList = signatureRepository.findByEntry(entry);
		SignatureEntity analystSignature = findSignatureByType(signatureList, SignatureTypeEnum.Analyst);
		SignatureEntity supervisorSignature = findSignatureByType(signatureList, SignatureTypeEnum.Supervisor);

		UserEntity preparaUser = analystSignature != null ? analystSignature.getSupervisorUser() : entry.getUser();
		String preparaNom = preparaUser != null ? safe(preparaUser.getNomenclature()) : "";
		String preparaName = fullName(preparaUser);
		signatures.addCell(signatureBlockCell("PREPARA", preparaNom, preparaName, preparaUser));

		// RF-08: no hay tipo de firma “Muestreo” en BD; columna reservada (sin texto fijo).
		signatures.addCell(signatureBlockCell("ANALIZA", "", "—", null));

		UserEntity revisaUser = supervisorSignature != null ? supervisorSignature.getSupervisorUser() : null;
		String revisaNom = revisaUser != null ? safe(revisaUser.getNomenclature()) : "";
		String revisaName = revisaUser != null ? fullName(revisaUser) : "";
		signatures.addCell(signatureBlockCell("REVISA", revisaNom, revisaName, revisaUser));
		return signatures;
	}

	private static SignatureEntity findSignatureByType(List<SignatureEntity> signatures, SignatureTypeEnum type) {
		if (signatures == null) {
			return null;
		}
		for (SignatureEntity s : signatures) {
			if (s.getSignatureType() == type) {
				return s;
			}
		}
		return null;
	}

	private PdfPCell signatureBlockCell(String roleHeader, String nomenclature, String name, UserEntity user) {
		PdfPCell cell = new PdfPCell();
		cell.setPadding(9f);
		cell.setBorder(Rectangle.BOX);
		cell.setBorderColor(COLOR_GRAY_MID);
		cell.setBorderWidth(0.5f);
		cell.setMinimumHeight(92f);
		cell.addElement(new Paragraph(roleHeader, F_8_BOLD_NAVY));
		PdfPTable sep = new PdfPTable(1);
		sep.setWidthPercentage(100);
		PdfPCell sepc = new PdfPCell();
		sepc.setFixedHeight(1f);
		sepc.setBorder(Rectangle.BOTTOM);
		sepc.setBorderColorBottom(COLOR_GRAY_MID);
		sepc.setBorderWidthBottom(1f);
		sepc.setPadding(0f);
		sep.addCell(sepc);
		cell.addElement(sep);
		boolean skipImage = "ANALIZA".equals(roleHeader);
		boolean revisaNomPrincipal = "REVISA".equals(roleHeader) && !safe(nomenclature).trim().isEmpty();
		if (revisaNomPrincipal) {
			cell.addElement(new Paragraph(safe(nomenclature).trim(), F_10_BOLD_BLACK));
		}
		if (!skipImage) {
			addSignatureImage(cell, user);
		}
		Paragraph sigLine = new Paragraph("_____________________________", F_8_NORMAL_GRAY);
		sigLine.setAlignment(Element.ALIGN_CENTER);
		cell.addElement(sigLine);
		if ("REVISA".equals(roleHeader)) {
			if (revisaNomPrincipal) {
				cell.addElement(new Paragraph(safe(name), F_8_NORMAL_GRAY));
			} else {
				cell.addElement(new Paragraph(safe(name), F_10_BOLD_BLACK));
			}
		} else if ("PREPARA".equals(roleHeader)) {
			cell.addElement(new Paragraph(safe(name), F_10_BOLD_BLACK));
			String rol = safe(nomenclature);
			if (!rol.isEmpty()) {
				cell.addElement(new Paragraph(rol, F_8_NORMAL_GRAY));
			}
		} else {
			cell.addElement(new Paragraph(safe(name), F_10_BOLD_BLACK));
		}
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
			image.setAlignment(Element.ALIGN_CENTER);
			cell.addElement(image);
		} catch (Exception ignored) {
			// Si la firma no puede renderizarse no bloqueamos la exportación del PDF.
		}
	}

	private PdfPTable observationsBlock(EntryEntity entry) {
		PdfPTable obs = new PdfPTable(new float[] { 1f, 1f });
		obs.setWidthPercentage(100);
		obs.setSpacingBefore(8f);
		PdfPCell c1 = new PdfPCell();
		c1.setBorder(Rectangle.BOX);
		c1.setBorderColor(COLOR_GRAY_MID);
		c1.setBorderWidth(0.5f);
		c1.setPadding(8f);
		c1.addElement(new Paragraph("ESTADO DEL REGISTRO", F_8_NORMAL_GRAY));
		String statusKey = entry.getStatus() != null ? entry.getStatus().name() : "";
		String statusLabel = statusKey.isEmpty()
			? "—"
			: ENTRY_STATUS_LABELS.getOrDefault(statusKey, statusKey);
		c1.addElement(new Paragraph(statusLabel, F_10_BOLD_BLACK));
		PdfPCell c2 = new PdfPCell();
		c2.setBorder(Rectangle.BOX);
		c2.setBorderColor(COLOR_GRAY_MID);
		c2.setBorderWidth(0.5f);
		c2.setPadding(8f);
		c2.addElement(new Paragraph("OBSERVACIONES", F_8_NORMAL_GRAY));
		// EntryEntity no tiene campo de observaciones; mostrar placeholder hasta exista en el modelo.
		c2.addElement(new Paragraph("—", F_9_NORMAL_BLACK));
		obs.addCell(c1);
		obs.addCell(c2);
		return obs;
	}

	private PdfPTable pdfFooter() {
		PdfPTable t = new PdfPTable(new float[] { 1f, 1f });
		t.setWidthPercentage(100);
		t.setSpacingBefore(10f);
		PdfPCell line = new PdfPCell();
		line.setColspan(2);
		line.setFixedHeight(1f);
		line.setBackgroundColor(COLOR_GRAY_MID);
		line.setBorder(Rectangle.NO_BORDER);
		t.addCell(line);
		PdfPCell left = new PdfPCell(new Phrase("Bitácoras Servicios Ambientales · Sistema BSA Lab", F_8_NORMAL_GRAY));
		left.setBorder(Rectangle.NO_BORDER);
		left.setPaddingTop(3f);
		PdfPCell right = new PdfPCell(new Phrase("Documento generado automáticamente", F_8_NORMAL_GRAY));
		right.setBorder(Rectangle.NO_BORDER);
		right.setHorizontalAlignment(Element.ALIGN_RIGHT);
		right.setPaddingTop(3f);
		t.addCell(left);
		t.addCell(right);
		return t;
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
		LogbookEntity logbook = entry.getLogbook();
		String logbookName = logbook != null && logbook.getName() != null ? logbook.getName().trim() : "";
		Instant recordedAt = entry.getRecordedAt();
		String recordedAtStr = recordedAt != null ? PDF_DATE.format(recordedAt) : "";

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
			entry.getStatus().name(),
			logbookName,
			fullName(entry.getUser()),
			pdfFolioDisplay(entry),
			recordedAtStr
		);
	}
}

