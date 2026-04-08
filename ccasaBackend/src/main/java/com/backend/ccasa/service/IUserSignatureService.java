package com.backend.ccasa.service;

import com.backend.ccasa.security.CcasaUserDetails;
import com.backend.ccasa.service.models.dtos.UserSignatureResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface IUserSignatureService {

	UserSignatureResponseDTO uploadSignature(Long userId, MultipartFile file, CcasaUserDetails principal);
}
