package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.AuthenticationFailedException;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.repositories.UserRepository;
import com.backend.ccasa.service.IAuthService;
import com.backend.ccasa.service.IJWTUtilityService;
import com.backend.ccasa.services.models.dtos.LoginRequestDTO;
import com.backend.ccasa.services.models.dtos.LoginResponseDTO;
import com.backend.ccasa.services.models.enums.RoleNameEnum;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements IAuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final IJWTUtilityService jwtUtilityService;

	@Value("${app.jwt.expiration-ms:86400000}")
	private long expirationMs;

	public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
			IJWTUtilityService jwtUtilityService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtilityService = jwtUtilityService;
	}

	@Override
	@Transactional(readOnly = true)
	public LoginResponseDTO login(LoginRequestDTO request) {
		UserEntity user = userRepository.findByEmailWithRole(request.email().trim().toLowerCase())
				.orElseThrow(() -> new AuthenticationFailedException("Correo o contraseña incorrectos"));

		if (!user.isActive()) {
			throw new AuthenticationFailedException("Usuario desactivado");
		}

		String storedHash = user.getPasswordHash();
		if (storedHash == null || storedHash.isBlank()) {
			throw new AuthenticationFailedException("Credenciales no configuradas");
		}

		if (!passwordEncoder.matches(request.password(), storedHash)) {
			throw new AuthenticationFailedException("Correo o contraseña incorrectos");
		}

		RoleNameEnum roleEnum = user.getRole().getName();
		String roleName = roleEnum != null ? roleEnum.name() : "USER";

		try {
			String token = jwtUtilityService.generateJWT(
					user.getId(),
					user.getEmail(),
					roleName,
					null,
					user.getFirstName(),
					user.getLastName(),
					List.of(roleName),
					List.of());

			long expiresInSeconds = Math.max(1L, expirationMs / 1000L);
			return new LoginResponseDTO(token, "Bearer", expiresInSeconds, user.getEmail(), roleName);
		} catch (Exception e) {
			throw new AuthenticationFailedException("No se pudo generar el token de acceso");
		}
	}
}
