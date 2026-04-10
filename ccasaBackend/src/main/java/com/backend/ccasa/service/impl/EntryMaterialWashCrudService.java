package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.BusinessRuleException;
import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.entities.entry.EntryMaterialWashEntity;
import com.backend.ccasa.persistence.repositories.EntryMaterialWashRepository;
import com.backend.ccasa.service.IEntryMaterialWashCrudService;
import com.backend.ccasa.service.impl.support.OpenPdfEntrySupport;
import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.persistence.EntityManager;
import java.io.ByteArrayOutputStream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EntryMaterialWashCrudService extends AbstractEntityCrudService<EntryMaterialWashEntity> implements IEntryMaterialWashCrudService {

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
		Document document = new Document(PageSize.A4, 36, 36, 36, 36);
		try {
			PdfWriter.getInstance(document, output);
			document.open();
			document.add(OpenPdfEntrySupport.headerWithLogo(entry));
			document.add(new Paragraph(" "));
			document.add(OpenPdfEntrySupport.centeredTitle("Lavado de Material RF-09"));
			document.add(new Paragraph(" "));
			document.add(buildDataTable(entry, e));
			document.add(new Paragraph(" "));
			document.add(OpenPdfEntrySupport.signaturesPreparaMuestreoRevisa(analyst, e.getSupervisorUser()));
		} catch (Exception ex) {
			throw new BusinessRuleException("MATERIAL_WASH_PDF_ERROR", "No fue posible generar el PDF del registro.");
		} finally {
			document.close();
		}
		return output.toByteArray();
	}

	private PdfPTable buildDataTable(EntryEntity entry, EntryMaterialWashEntity e) {
		PdfPTable table = OpenPdfEntrySupport.newTwoColumnDataTable();
		OpenPdfEntrySupport.addLabelValue(table, "Nombre de bitácora",
			entry.getLogbook() != null ? OpenPdfEntrySupport.safe(entry.getLogbook().getName()) : "");
		UserEntity analyst = e.getAnalystUser() != null ? e.getAnalystUser() : entry.getUser();
		OpenPdfEntrySupport.addLabelValue(table, "Nombre del analista", OpenPdfEntrySupport.fullName(analyst));
		OpenPdfEntrySupport.addLabelValue(table, "Fecha lunes", OpenPdfEntrySupport.formatLocalDate(e.getMondayDate()));
		OpenPdfEntrySupport.addLabelValue(table, "Tipo de pieza",
			e.getPieceType() != null ? e.getPieceType().name() : "");
		OpenPdfEntrySupport.addLabelValue(table, "Material", OpenPdfEntrySupport.safe(e.getMaterial()));
		OpenPdfEntrySupport.addLabelValue(table, "Determinación", OpenPdfEntrySupport.safe(e.getDetermination()));
		OpenPdfEntrySupport.addLabelValue(table, "Color", OpenPdfEntrySupport.safe(e.getColor()));
		OpenPdfEntrySupport.addLabelValue(table, "Supervisor", OpenPdfEntrySupport.fullName(e.getSupervisorUser()));
		return table;
	}
}
