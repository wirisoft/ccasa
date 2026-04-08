package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.BusinessRuleException;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.repositories.UserRepository;
import com.backend.ccasa.security.CcasaUserDetails;
import com.backend.ccasa.service.IUserSignatureService;
import com.backend.ccasa.service.models.dtos.UserSignatureResponseDTO;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Locale;
import java.util.Set;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class UserSignatureServiceImpl implements IUserSignatureService {

	private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
		"image/png",
		"image/jpeg",
		"image/jpg",
		"image/webp",
		"image/gif"
	);

	private final UserRepository userRepository;

	public UserSignatureServiceImpl(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public UserSignatureResponseDTO uploadSignature(Long userId, MultipartFile file, CcasaUserDetails principal) {
		if (userId == null) {
			throw new IllegalArgumentException("El id de usuario es obligatorio.");
		}
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("Debe enviar un archivo de firma.");
		}
		validatePrincipal(userId, principal);
		validateFile(file);

		UserEntity user = userRepository.findByIdAndDeletedAtIsNull(userId)
			.orElseThrow(() -> new BusinessRuleException("USER_NOT_FOUND", "Usuario no encontrado."));

		String extension = resolveExtension(file.getOriginalFilename(), file.getContentType());
		String fileName = "user-" + userId + "-signature-" + Instant.now().toEpochMilli() + "." + extension;
		Path storageDir = Path.of("c:\\Users\\misju\\ccasa\\ccasaBackend\\uploads\\signatures");
		Path destination = storageDir.resolve(fileName);
		try {
			Files.createDirectories(storageDir);
			Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
		} catch (IOException ex) {
			throw new BusinessRuleException("SIGNATURE_UPLOAD_ERROR", "No fue posible almacenar la firma del usuario.");
		}

		user.setSignatureFileName(file.getOriginalFilename());
		user.setSignatureContentType(file.getContentType());
		user.setSignatureStoragePath(destination.toAbsolutePath().toString());
		user.setSignatureUploadedAt(Instant.now());
		user = userRepository.save(user);

		return new UserSignatureResponseDTO(
			user.getId(),
			user.getSignatureFileName(),
			user.getSignatureContentType(),
			user.getSignatureStoragePath(),
			user.getSignatureUploadedAt()
		);
	}

	private void validatePrincipal(Long userId, CcasaUserDetails principal) {
		if (principal == null) {
			throw new AccessDeniedException("Usuario no autenticado.");
		}
		Long principalUserId = principal.getUserIdAsLong();
		boolean isSelf = principalUserId != null && principalUserId.equals(userId);
		boolean isAdmin = principal.hasRole("ADMIN");
		if (!isSelf && !isAdmin) {
			throw new AccessDeniedException("No tiene permisos para actualizar la firma de este usuario.");
		}
	}

	private void validateFile(MultipartFile file) {
		String contentType = file.getContentType() != null ? file.getContentType().toLowerCase(Locale.ROOT) : "";
		if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
			throw new BusinessRuleException(
				"INVALID_SIGNATURE_FILE",
				"Solo se permiten archivos de imagen PNG, JPG, JPEG, WEBP o GIF para la firma."
			);
		}
	}

	private String resolveExtension(String originalFilename, String contentType) {
		if (originalFilename != null && originalFilename.contains(".")) {
			String ext = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).trim().toLowerCase(Locale.ROOT);
			if (!ext.isBlank()) {
				return ext;
			}
		}
		return switch (contentType == null ? "" : contentType.toLowerCase(Locale.ROOT)) {
			case "image/png" -> "png";
			case "image/jpeg", "image/jpg" -> "jpg";
			case "image/webp" -> "webp";
			case "image/gif" -> "gif";
			default -> "img";
		};
	}
}
