package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.BusinessRuleException;
import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.FolioEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.entities.entry.EntryMaterialWashEntity;
import com.backend.ccasa.persistence.repositories.EntryMaterialWashRepository;
import com.backend.ccasa.service.IEntryMaterialWashCrudService;
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
import jakarta.persistence.EntityManager;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EntryMaterialWashCrudService extends AbstractEntityCrudService<EntryMaterialWashEntity> implements IEntryMaterialWashCrudService {

	private static final String PDF_LOGO_CLASSPATH = "static/images/lab-logo.png";
	private static final DateTimeFormatter PDF_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(ZoneOffset.UTC);
	private static final DateTimeFormatter MONDAY_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

	private static final Color COLOR_NAVY = new Color(44, 62, 80);
	private static final Color COLOR_GRAY_LIGHT = new Color(244, 246, 247);
	private static final Color COLOR_GRAY_MID = new Color(189, 195, 199);
	private static final Color COLOR_GRAY_DARK = new Color(127, 140, 141);
	private static final Color COLOR_WHITE = Color.WHITE;

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
	private static final Font F_10_WHITE_BOLD = new Font(Font.HELVETICA, 10f, Font.BOLD, COLOR_WHITE);

	public EntryMaterialWashCrudService(EntryMaterialWashRepository repository, EntityManager entityManager) {
		super(repository, entityManager, EntryMaterialWashEntity.class, "E_NT_RY_MA_TE_RI_AL_WA_SH");
	}

	@Override
	protected EntryMaterialWashEntity newEntity() {
		return new EntryMaterialWashEntity();
	}

	@Override
	@Transactional(readOnly = true)
	public byte[] generatePdf(Long id) {
		if (id == null) {
			throw new IllegalArgumentException("El id del registro es obligatorio.");
		}
		EntryMaterialWashEntity e = requireActive(id);
		EntryEntity entry = e.getEntry();
		UserEntity analyst = e.getAnalystUser() != null ? e.getAnalystUser() : entry.getUser();
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		Document document = new Document(PageSize.A4, 32, 32, 28, 22);
		try {
			PdfWriter.getInstance(document, output);
			document.open();
			writePdf(document, entry, e, analyst);
		} catch (Exception ex) {
			throw new BusinessRuleException("MATERIAL_WASH_PDF_ERROR", "No fue posible generar el PDF del registro.");
		} finally {
			document.close();
		}
		return output.toByteArray();
	}

	private void writePdf(Document document, EntryEntity entry, EntryMaterialWashEntity e, UserEntity analyst) throws Exception {
		document.add(headerLine(entry, analyst));
		document.add(headerDividerThick());
		document.add(moduleTitleBanner("LAVADO DE MATERIAL RF-09"));
		document.add(buildPrimaryDataTable(entry, e, analyst));
		document.add(buildDeterminationTable(e));
		document.add(buildSummaryBanner(e));
		addVerificationBlock(document);
		document.add(signaturesBlock(analyst, e.getSupervisorUser()));
		document.add(observationsBlock(entry));
		document.add(pdfFooter());
	}

	private PdfPTable headerLine(EntryEntity entry, UserEntity analyst) {
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
		String analystName = fullName(analyst).trim();
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
		FolioEntity folio = entry.getFolio();
		if (folio != null && folio.getFolioNumber() != null) {
			return String.valueOf(folio.getFolioNumber());
		}
		if (entry.getId() != null) {
			return "REG-" + entry.getId();
		}
		return "REG-";
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
		wrap.addCell(c);
		return wrap;
	}

	private PdfPCell dataHeaderCell(String text) {
		PdfPCell c = new PdfPCell(new Phrase(safe(text), F_9_WHITE_BOLD));
		c.setBackgroundColor(COLOR_NAVY);
		c.setBorder(Rectangle.BOX);
		c.setBorderColor(COLOR_GRAY_MID);
		c.setBorderWidth(0.5f);
		c.setPadding(5f);
		c.setHorizontalAlignment(Element.ALIGN_CENTER);
		c.setVerticalAlignment(Element.ALIGN_MIDDLE);
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

	private PdfPTable buildPrimaryDataTable(EntryEntity entry, EntryMaterialWashEntity e, UserEntity analyst) {
		PdfPTable table = new PdfPTable(new float[] { 1f, 1f, 1f, 1f, 1f });
		table.setWidthPercentage(100);
		table.setSpacingBefore(4f);
		table.addCell(dataHeaderCell("Bitácora"));
		table.addCell(dataHeaderCell("Analista"));
		table.addCell(dataHeaderCell("Fecha lunes"));
		table.addCell(dataHeaderCell("Tipo de pieza"));
		table.addCell(dataHeaderCell("Material"));
		Color rowBg = COLOR_WHITE;
		String logbookName = entry.getLogbook() != null ? safe(entry.getLogbook().getName()) : "";
		String monday = e.getMondayDate() != null ? e.getMondayDate().format(MONDAY_DATE) : "";
		String piece = e.getPieceType() != null ? e.getPieceType().name() : "";
		table.addCell(dataBodyCell(logbookName, F_9_NORMAL_BLACK, rowBg, Element.ALIGN_LEFT));
		table.addCell(dataBodyCell(fullName(analyst), F_9_NORMAL_BLACK, rowBg, Element.ALIGN_LEFT));
		table.addCell(dataBodyCell(monday, F_9_NORMAL_BLACK, rowBg, Element.ALIGN_CENTER));
		table.addCell(dataBodyCell(piece, F_9_NORMAL_BLACK, rowBg, Element.ALIGN_LEFT));
		table.addCell(dataBodyCell(safe(e.getMaterial()), F_9_NORMAL_BLACK, rowBg, Element.ALIGN_LEFT));
		return table;
	}

	private PdfPTable buildDeterminationTable(EntryMaterialWashEntity e) {
		PdfPTable table = new PdfPTable(new float[] { 1.2f, 1f, 1.2f });
		table.setWidthPercentage(100);
		table.setSpacingBefore(6f);
		table.addCell(dataHeaderCell("Determinación"));
		table.addCell(dataHeaderCell("Color"));
		table.addCell(dataHeaderCell("Supervisor"));
		Color rowBg = COLOR_WHITE;
		table.addCell(dataBodyCell(safe(e.getDetermination()), F_9_NORMAL_BLACK, rowBg, Element.ALIGN_LEFT));
		table.addCell(dataBodyCell(safe(e.getColor()), F_9_NORMAL_BLACK, rowBg, Element.ALIGN_LEFT));
		table.addCell(dataBodyCell(fullName(e.getSupervisorUser()), F_9_NORMAL_BLACK, rowBg, Element.ALIGN_LEFT));
		return table;
	}

	private PdfPTable buildSummaryBanner(EntryMaterialWashEntity e) {
		PdfPTable t = new PdfPTable(1);
		t.setWidthPercentage(100);
		t.setSpacingBefore(6f);
		String tipo = e.getPieceType() != null ? e.getPieceType().name() : "—";
		String det = safe(e.getDetermination());
		if (det.isEmpty()) {
			det = "—";
		}
		String line = "Material procesado: " + tipo + " · Determinación: " + det;
		PdfPCell c = new PdfPCell(new Phrase(line, F_10_WHITE_BOLD));
		c.setBackgroundColor(COLOR_NAVY);
		c.setBorder(Rectangle.BOX);
		c.setBorderColor(COLOR_NAVY);
		c.setBorderWidth(0.5f);
		c.setPadding(8f);
		c.setHorizontalAlignment(Element.ALIGN_CENTER);
		c.setVerticalAlignment(Element.ALIGN_MIDDLE);
		t.addCell(c);
		return t;
	}

	private void addVerificationBlock(Document document) throws Exception {
		Paragraph p = new Paragraph(
			"Se analiza de acuerdo al procedimiento de control de calidad con las siguientes muestras:",
			F_9_NORMAL_GRAY);
		p.setAlignment(Element.ALIGN_CENTER);
		p.setSpacingBefore(8f);
		p.setLeading(11f);
		document.add(p);
		Paragraph v = new Paragraph("AJUSTE", F_9_BOLD_BLACK);
		v.setAlignment(Element.ALIGN_CENTER);
		v.setLeading(12f);
		document.add(v);
	}

	private PdfPTable signaturesBlock(UserEntity preparaUser, UserEntity supervisor) {
		PdfPTable signatures = new PdfPTable(new float[] { 1f, 1f, 1f });
		signatures.setWidthPercentage(100);
		signatures.setSpacingBefore(8f);
		String prepNom = preparaUser != null ? safe(preparaUser.getNomenclature()) : "";
		String prepName = fullName(preparaUser);
		String revNom = supervisor != null ? safe(supervisor.getNomenclature()) : "";
		String revName = fullName(supervisor);
		signatures.addCell(signatureBlockCell("PREPARA", prepNom, prepName, preparaUser));
		signatures.addCell(signatureBlockCell("ANALIZA", "", "MUESTREO", null));
		signatures.addCell(signatureBlockCell("REVISA", revNom, revName, supervisor));
		return signatures;
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
		c1.addElement(new Paragraph(entry.getStatus() != null ? entry.getStatus().name() : "—", F_10_BOLD_BLACK));
		PdfPCell c2 = new PdfPCell();
		c2.setBorder(Rectangle.BOX);
		c2.setBorderColor(COLOR_GRAY_MID);
		c2.setBorderWidth(0.5f);
		c2.setPadding(8f);
		c2.addElement(new Paragraph("OBSERVACIONES", F_8_NORMAL_GRAY));
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
			return Image.getInstance(is.readAllBytes());
		} catch (Exception e) {
			return null;
		}
	}

	private String safe(String value) {
		return value == null ? "" : value;
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
}
