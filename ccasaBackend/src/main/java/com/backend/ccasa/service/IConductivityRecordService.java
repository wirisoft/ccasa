package com.backend.ccasa.service;

import com.backend.ccasa.security.CcasaUserDetails;
import com.backend.ccasa.service.models.dtos.ConductivityRecordResponseDTO;
import com.backend.ccasa.service.models.dtos.ConductivityReviewRequestDTO;
import com.backend.ccasa.service.models.dtos.CreateConductivityRecordRequestDTO;
import com.backend.ccasa.service.models.enums.ConductivityTypeEnum;
import com.backend.ccasa.service.models.enums.EntryStatusEnum;
import java.time.Instant;
import java.util.List;

public interface IConductivityRecordService {

	ConductivityRecordResponseDTO createRecord(CreateConductivityRecordRequestDTO request, CcasaUserDetails principal);

	List<ConductivityRecordResponseDTO> findRecords(
		String folio,
		Instant fromDate,
		Instant toDate,
		ConductivityTypeEnum type,
		EntryStatusEnum status,
		Long createdByUserId,
		Long reviewerUserId
	);

	ConductivityRecordResponseDTO findRecordById(Long conductivityId);

	ConductivityRecordResponseDTO reviewRecord(Long conductivityId, ConductivityReviewRequestDTO request, CcasaUserDetails principal);

	byte[] generatePdf(Long conductivityId);

	byte[] generatePdfZip(List<Long> conductivityIds);
}
