package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.BusinessRuleException;
import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.SolutionEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.entities.entry.EntrySolutionPrepEntity;
import com.backend.ccasa.persistence.repositories.EntrySolutionPrepRepository;
import com.backend.ccasa.service.IEntrySolutionPrepCrudService;
import com.backend.ccasa.service.impl.support.OpenPdfEntrySupport;
import com.backend.ccasa.service.impl.support.SolutionPrepEntryComputation;
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
public class EntrySolutionPrepCrudService extends AbstractEntityCrudService<EntrySolutionPrepEntity> implements IEntrySolutionPrepCrudService {

	private final SolutionPrepEntryComputation solutionPrepEntryComputation;

	public EntrySolutionPrepCrudService(
		EntrySolutionPrepRepository repository,
		EntityManager entityManager,
		SolutionPrepEntryComputation solutionPrepEntryComputation
	) {
		super(repository, entityManager, EntrySolutionPrepEntity.class, "E_NT_RY_SO_LU_TI_ON_PR_EP");
		this.solutionPrepEntryComputation = solutionPrepEntryComputation;
	}

	@Override
	protected void afterApply(EntrySolutionPrepEntity entity) {
		solutionPrepEntryComputation.apply(entity);
	}

	@Override
	protected EntrySolutionPrepEntity newEntity() {
		return new EntrySolutionPrepEntity();
	}

	@Override
	@Transactional(readOnly = true)
	public byte[] generatePdf(Long id) {
		if (id == null) {
			throw new IllegalArgumentException("El id del registro es obligatorio.");
		}
		EntrySolutionPrepEntity e = requireActive(id);
		EntryEntity entry = e.getEntry();
		UserEntity analyst = e.getAnalystUser() != null ? e.getAnalystUser() : entry.getUser();
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		Document document = new Document(PageSize.A4, 36, 36, 36, 36);
		try {
			PdfWriter.getInstance(document, output);
			document.open();
			document.add(OpenPdfEntrySupport.headerWithLogo(entry));
			document.add(new Paragraph(" "));
			document.add(OpenPdfEntrySupport.centeredTitle("Preparación de Solución"));
			document.add(new Paragraph(" "));
			document.add(buildDataTable(entry, e));
			document.add(new Paragraph(" "));
			document.add(OpenPdfEntrySupport.signaturesPreparaMuestreoRevisa(analyst, null));
		} catch (Exception ex) {
			throw new BusinessRuleException("SOLUTION_PREP_PDF_ERROR", "No fue posible generar el PDF del registro.");
		} finally {
			document.close();
		}
		return output.toByteArray();
	}

	private PdfPTable buildDataTable(EntryEntity entry, EntrySolutionPrepEntity e) {
		PdfPTable table = OpenPdfEntrySupport.newTwoColumnDataTable();
		OpenPdfEntrySupport.addLabelValue(table, "Nombre de bitácora",
			entry.getLogbook() != null ? OpenPdfEntrySupport.safe(entry.getLogbook().getName()) : "");
		UserEntity analyst = e.getAnalystUser() != null ? e.getAnalystUser() : entry.getUser();
		OpenPdfEntrySupport.addLabelValue(table, "Nombre del analista", OpenPdfEntrySupport.fullName(analyst));
		String solutionLine = "";
		if (e.getSolution() != null) {
			SolutionEntity s = e.getSolution();
			solutionLine = OpenPdfEntrySupport.safe(s.getName());
			if (s.getConcentration() != null && !s.getConcentration().isBlank()) {
				solutionLine = solutionLine + " (" + s.getConcentration() + ")";
			}
		}
		OpenPdfEntrySupport.addLabelValue(table, "Solución preparada", solutionLine);
		String weighingRef = "";
		if (e.getWeighingEntry() != null && e.getWeighingEntry().getId() != null) {
			weighingRef = "Registro de pesada #" + e.getWeighingEntry().getId();
		}
		OpenPdfEntrySupport.addLabelValue(table, "Entrada de pesada asociada", weighingRef);
		return table;
	}
}
