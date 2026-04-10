package com.backend.ccasa.service.impl.support;

import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.FolioEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import org.springframework.core.io.ClassPathResource;

/**
 * Utilidades comunes para PDFs de registros de entrada (OpenPDF / com.lowagie).
 */
public final class OpenPdfEntrySupport {

	public static final String PDF_LOGO_CLASSPATH = "static/images/lab-logo.png";
	public static final DateTimeFormatter PDF_DATE = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC);
	public static final Font TITLE_FONT = new Font(Font.HELVETICA, 12, Font.BOLD);
	public static final Font LABEL_FONT = new Font(Font.HELVETICA, 9, Font.BOLD);
	public static final Font BODY_FONT = new Font(Font.HELVETICA, 9, Font.NORMAL);

	private OpenPdfEntrySupport() {
	}

	public static Image loadClasspathLogo() {
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

	public static PdfPTable headerWithLogo(EntryEntity entry) {
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

	public static Paragraph centeredTitle(String text) {
		Paragraph title = new Paragraph(safe(text), TITLE_FONT);
		title.setAlignment(Element.ALIGN_CENTER);
		return title;
	}

	public static PdfPTable newTwoColumnDataTable() {
		PdfPTable table = new PdfPTable(new float[] { 1.1f, 1.4f });
		table.setWidthPercentage(100);
		return table;
	}

	public static void addLabelValue(PdfPTable table, String label, String value) {
		table.addCell(cell(label, LABEL_FONT, Element.ALIGN_LEFT, true));
		table.addCell(cell(dash(value), BODY_FONT, Element.ALIGN_LEFT, true));
	}

	public static PdfPTable signaturesPreparaMuestreoRevisa(UserEntity preparaUser, UserEntity revisaUserOrNull) {
		PdfPTable signatures = new PdfPTable(new float[] { 1f, 1f, 1f });
		signatures.setWidthPercentage(100);
		String prepNom = preparaUser != null ? safe(preparaUser.getNomenclature()) : "";
		String prepName = fullName(preparaUser);
		signatures.addCell(signatureCell("Prepara", prepNom, prepName, preparaUser));
		signatures.addCell(signatureCell("Analiza", "MUESTREO", "MUESTREO", null));
		String revNom = revisaUserOrNull != null ? safe(revisaUserOrNull.getNomenclature()) : "";
		String revName = fullName(revisaUserOrNull);
		signatures.addCell(signatureCell("Revisa", revNom, revName, revisaUserOrNull));
		return signatures;
	}

	public static PdfPCell cell(String text, Font font, int align, boolean border) {
		PdfPCell cell = new PdfPCell(new Phrase(safe(text), font));
		cell.setHorizontalAlignment(align);
		cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
		cell.setPadding(6f);
		cell.setBorder(border ? Rectangle.BOX : Rectangle.NO_BORDER);
		return cell;
	}

	public static PdfPCell signatureCell(String label, String nomenclature, String name, UserEntity user) {
		PdfPCell cell = new PdfPCell();
		cell.setPadding(8f);
		cell.setBorder(Rectangle.BOX);
		cell.addElement(new Paragraph(label + ": " + safe(nomenclature), LABEL_FONT));
		cell.addElement(new Paragraph(safe(name), BODY_FONT));
		addSignatureImage(cell, user);
		return cell;
	}

	public static void addSignatureImage(PdfPCell cell, UserEntity user) {
		if (user == null || user.getSignatureStoragePath() == null || user.getSignatureStoragePath().isBlank()) {
			return;
		}
		try {
			java.nio.file.Path signaturePath = java.nio.file.Path.of(user.getSignatureStoragePath());
			if (!java.nio.file.Files.exists(signaturePath)) {
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

	public static String fullName(UserEntity user) {
		if (user == null) {
			return "";
		}
		String firstName = user.getFirstName() != null ? user.getFirstName().trim() : "";
		String lastName = user.getLastName() != null ? user.getLastName().trim() : "";
		String joined = (firstName + " " + lastName).trim();
		return joined.isEmpty() ? safe(user.getEmail()) : joined;
	}

	public static String safe(String value) {
		return value == null ? "" : value;
	}

	public static String dash(String value) {
		if (value == null || value.isBlank()) {
			return "—";
		}
		return value;
	}

	public static String fixed(BigDecimal value, int scale) {
		if (value == null) {
			return "";
		}
		return value.setScale(scale, RoundingMode.HALF_UP).toPlainString();
	}

	public static String formatLocalDate(LocalDate date) {
		if (date == null) {
			return "";
		}
		return date.format(DateTimeFormatter.ISO_LOCAL_DATE);
	}
}
