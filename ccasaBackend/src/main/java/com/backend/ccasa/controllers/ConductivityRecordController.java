package com.backend.ccasa.controllers;

import com.backend.ccasa.security.CcasaUserDetails;
import com.backend.ccasa.service.IConductivityRecordService;
import com.backend.ccasa.service.models.dtos.ConductivityBatchPdfRequestDTO;
import com.backend.ccasa.service.models.dtos.ConductivityRecordResponseDTO;
import com.backend.ccasa.service.models.dtos.ConductivityReviewRequestDTO;
import com.backend.ccasa.service.models.dtos.CreateConductivityRecordRequestDTO;
import com.backend.ccasa.service.models.enums.ConductivityTypeEnum;
import com.backend.ccasa.service.models.enums.EntryStatusEnum;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/conductivity-records")
public class ConductivityRecordController {

	private final IConductivityRecordService conductivityRecordService;

	public ConductivityRecordController(IConductivityRecordService conductivityRecordService) {
		this.conductivityRecordService = conductivityRecordService;
	}

	@PostMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'SUPERVISOR')")
	public ResponseEntity<ConductivityRecordResponseDTO> create(
		@RequestBody CreateConductivityRecordRequestDTO request,
		@AuthenticationPrincipal CcasaUserDetails principal
	) {
		return ResponseEntity.ok(conductivityRecordService.createRecord(request, principal));
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'SUPERVISOR')")
	public ResponseEntity<List<ConductivityRecordResponseDTO>> search(
		@RequestParam(required = false) String folio,
		@RequestParam(required = false) LocalDate fromDate,
		@RequestParam(required = false) LocalDate toDate,
		@RequestParam(required = false) ConductivityTypeEnum type,
		@RequestParam(required = false) EntryStatusEnum status,
		@RequestParam(required = false) Long createdByUserId,
		@RequestParam(required = false) Long reviewerUserId
	) {
		Instant fromInstant = fromDate != null ? fromDate.atStartOfDay().toInstant(ZoneOffset.UTC) : null;
		Instant toInstant = toDate != null ? toDate.plusDays(1).atStartOfDay().minusNanos(1).toInstant(ZoneOffset.UTC) : null;
		return ResponseEntity.ok(
			conductivityRecordService.findRecords(folio, fromInstant, toInstant, type, status, createdByUserId, reviewerUserId)
		);
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'SUPERVISOR')")
	public ResponseEntity<ConductivityRecordResponseDTO> detail(@PathVariable Long id) {
		return ResponseEntity.ok(conductivityRecordService.findRecordById(id));
	}

	@PostMapping("/{id}/review")
	@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR') or @ccasaUserSecurity.canReviewConductivityRecord()")
	public ResponseEntity<ConductivityRecordResponseDTO> review(
		@PathVariable Long id,
		@RequestBody(required = false) ConductivityReviewRequestDTO request,
		@AuthenticationPrincipal CcasaUserDetails principal
	) {
		return ResponseEntity.ok(conductivityRecordService.reviewRecord(id, request, principal));
	}

	@GetMapping("/{id}/pdf")
	@PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'SUPERVISOR')")
	public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
		byte[] pdf = conductivityRecordService.generatePdf(id);
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename("conductividad-" + id + ".pdf").build().toString())
			.contentType(MediaType.APPLICATION_PDF)
			.body(pdf);
	}

	@PostMapping("/pdf-batch")
	@PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'SUPERVISOR')")
	public ResponseEntity<byte[]> downloadBatchPdf(@RequestBody ConductivityBatchPdfRequestDTO request) {
		byte[] zip = conductivityRecordService.generatePdfZip(request != null ? request.conductivityIds() : null);
		return ResponseEntity.ok()
			.header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename("conductividad-registros.zip").build().toString())
			.contentType(MediaType.APPLICATION_OCTET_STREAM)
			.body(zip);
	}
}
