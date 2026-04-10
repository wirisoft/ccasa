package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.BusinessRuleException;
import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.SolutionEntity;
import com.backend.ccasa.persistence.entities.entry.EntryWeighingEntity;
import com.backend.ccasa.persistence.repositories.EntryWeighingRepository;
import com.backend.ccasa.service.IEntryWeighingCrudService;
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
public class EntryWeighingCrudService extends AbstractEntityCrudService<EntryWeighingEntity> implements IEntryWeighingCrudService {

	public EntryWeighingCrudService(EntryWeighingRepository repository, EntityManager entityManager) {
		super(repository, entityManager, EntryWeighingEntity.class, "E_NT_RY_WE_IG_HI_NG");
	}

	@Override
	protected EntryWeighingEntity newEntity() {
		return new EntryWeighingEntity();
	}

	@Override
	@Transactional(readOnly = true)
	public byte[] generatePdf(Long id) {
		if (id == null) {
			throw new IllegalArgumentException("El id del registro es obligatorio.");
		}
		EntryWeighingEntity w = requireActive(id);
		EntryEntity entry = w.getEntry();
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		Document document = new Document(PageSize.A4, 36, 36, 36, 36);
		try {
			PdfWriter.getInstance(document, output);
			document.open();
			document.add(OpenPdfEntrySupport.headerWithLogo(entry));
			document.add(new Paragraph(" "));
			document.add(OpenPdfEntrySupport.centeredTitle("Registro de Pesada"));
			document.add(new Paragraph(" "));
			document.add(buildDataTable(entry, w));
			document.add(new Paragraph(" "));
			document.add(OpenPdfEntrySupport.signaturesPreparaMuestreoRevisa(entry.getUser(), null));
		} catch (Exception ex) {
			throw new BusinessRuleException("WEIGHING_PDF_ERROR", "No fue posible generar el PDF del registro.");
		} finally {
			document.close();
		}
		return output.toByteArray();
	}

	private PdfPTable buildDataTable(EntryEntity entry, EntryWeighingEntity w) {
		PdfPTable table = OpenPdfEntrySupport.newTwoColumnDataTable();
		OpenPdfEntrySupport.addLabelValue(table, "Nombre de bitácora",
			entry.getLogbook() != null ? OpenPdfEntrySupport.safe(entry.getLogbook().getName()) : "");
		OpenPdfEntrySupport.addLabelValue(table, "Nombre del analista", OpenPdfEntrySupport.fullName(entry.getUser()));
		OpenPdfEntrySupport.addLabelValue(table, "Reactivo pesado",
			w.getReagent() != null ? OpenPdfEntrySupport.safe(w.getReagent().getName()) : "");
		OpenPdfEntrySupport.addLabelValue(table, "Peso (g)", OpenPdfEntrySupport.fixed(w.getWeightGrams(), 4));
		String solutionLine = "";
		if (w.getTargetSolution() != null) {
			SolutionEntity s = w.getTargetSolution();
			solutionLine = OpenPdfEntrySupport.safe(s.getName());
			if (s.getConcentration() != null && !s.getConcentration().isBlank()) {
				solutionLine = solutionLine + " (" + s.getConcentration() + ")";
			}
		}
		OpenPdfEntrySupport.addLabelValue(table, "Solución destino", solutionLine);
		return table;
	}
}
