package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.AuthException;
import com.backend.ccasa.persistence.entities.RoleEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.repositories.RoleRepository;
import com.backend.ccasa.persistence.repositories.UserRepository;
import com.backend.ccasa.service.IAuthService;
import com.backend.ccasa.service.IJWTUtilityService;
import com.backend.ccasa.service.models.dtos.AuthLoginRequestDTO;
import com.backend.ccasa.service.models.dtos.AuthRegisterRequestDTO;
import com.backend.ccasa.service.models.dtos.AuthResponseDTO;
import com.backend.ccasa.service.models.dtos.ResetPasswordResponseDTO;
import com.backend.ccasa.service.models.enums.RoleNameEnum;
import com.nimbusds.jose.JOSEException;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements IAuthService {

	private static final Logger LOGGER = LoggerFactory.getLogger(AuthServiceImpl.class);

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final PasswordEncoder passwordEncoder;
	private final IJWTUtilityService jwtUtilityService;

	public AuthServiceImpl(
		UserRepository userRepository,
		RoleRepository roleRepository,
		PasswordEncoder passwordEncoder,
		IJWTUtilityService jwtUtilityService
	) {
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtUtilityService = jwtUtilityService;
	}

	@Override
	@Transactional
	public AuthResponseDTO register(AuthRegisterRequestDTO request) {
		String email = normalizedEmail(request.email());
		if (userRepository.findByEmail(email).isPresent()) {
			throw new AuthException("AUTH_EMAIL_ALREADY_EXISTS", "Ya existe un usuario registrado con ese email.");
		}

		RoleEntity defaultRole = roleRepository.findByName(RoleNameEnum.Analyst)
			.orElseGet(() -> {
				RoleEntity role = new RoleEntity();
				role.setName(RoleNameEnum.Analyst);
				role.setDescription("Rol por defecto para nuevos usuarios.");
				return roleRepository.save(role);
			});

		UserEntity user = new UserEntity();
		user.setFirstName(request.firstName().trim());
		user.setLastName(request.lastName().trim());
		user.setEmail(email);
		user.setPasswordHash(passwordEncoder.encode(request.password()));
		user.setRole(defaultRole);
		user.setActive(true);
		user = userRepository.save(user);

		return generateAuthResponse(user);
	}

	@Override
	@Transactional(readOnly = true)
	public AuthResponseDTO login(AuthLoginRequestDTO request) {
		String email = normalizedEmail(request.email());
		UserEntity user = userRepository.findByEmail(email)
			.orElseThrow(() -> new AuthException("AUTH_INVALID_CREDENTIALS", "Credenciales inválidas."));

		if (!user.isActive()) {
			throw new AuthException("AUTH_USER_INACTIVE", "El usuario está inactivo.");
		}

		if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
			throw new AuthException("AUTH_INVALID_CREDENTIALS", "Credenciales inválidas.");
		}

		return generateAuthResponse(user);
	}

	@Override
	@Transactional
	public AuthResponseDTO createInitialAdmin() {
		if (userRepository.findByEmail("admin@ccasa.local").isPresent()) {
			throw new AuthException("AUTH_INITIAL_USER_EXISTS", "El usuario inicial ya existe.");
		}

		RoleEntity adminRole = roleRepository.findByName(RoleNameEnum.Admin)
			.orElseGet(() -> {
				RoleEntity role = new RoleEntity();
				role.setName(RoleNameEnum.Admin);
				role.setDescription("Administrador del sistema");
				return roleRepository.save(role);
			});

		UserEntity admin = new UserEntity();
		admin.setFirstName("Admin");
		admin.setLastName("Sistema");
		admin.setEmail("admin@ccasa.local");
		admin.setPasswordHash(passwordEncoder.encode("change-me"));
		admin.setRole(adminRole);
		admin.setActive(true);
		admin = userRepository.save(admin);

		return generateAuthResponse(admin);
	}

	@Override
	public void forgotPassword(String email) {
		// MVP: no revelar si el email existe. Log interno para auditoría.
		String normalized = normalizedEmail(email);
		boolean exists = userRepository.findByEmail(normalized).isPresent();
		LOGGER.info("Forgot-password solicitado para email={}, exists={}", normalized, exists);
		// En una versión futura se enviaría un email con token de reset.
	}

	@Override
	@Transactional
	public void changePassword(Long userId, String currentPassword, String newPassword) {
		UserEntity user = userRepository.findById(userId)
			.orElseThrow(() -> new AuthException("AUTH_USER_NOT_FOUND", "Usuario no encontrado."));

		if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
			throw new AuthException("AUTH_INVALID_CREDENTIALS", "La contraseña actual es incorrecta.");
		}

		if (newPassword == null || newPassword.length() < 6) {
			throw new AuthException("AUTH_WEAK_PASSWORD", "La nueva contraseña debe tener al menos 6 caracteres.");
		}

		user.setPasswordHash(passwordEncoder.encode(newPassword));
		userRepository.save(user);
	}

	@Override
	@Transactional
	public ResetPasswordResponseDTO resetPassword(Long targetUserId) {
		UserEntity user = userRepository.findById(targetUserId)
			.orElseThrow(() -> new AuthException("AUTH_USER_NOT_FOUND", "Usuario no encontrado."));

		String temporaryPassword = generateTemporaryPassword();
		user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
		userRepository.save(user);

		LOGGER.info("Admin reseteó contraseña del usuario id={}", targetUserId);
		return new ResetPasswordResponseDTO(temporaryPassword);
	}

	private AuthResponseDTO generateAuthResponse(UserEntity user) {
		try {
			String role = user.getRole() != null && user.getRole().getName() != null
				? user.getRole().getName().name()
				: "USER";
			String token = jwtUtilityService.generateJWT(
				user.getId(),
				user.getEmail(),
				role,
				null,
				user.getFirstName(),
				user.getLastName(),
				List.of(role),
				List.of()
			);
			return new AuthResponseDTO(token, user.getId(), user.getEmail(), role,
					user.getFirstName(), user.getLastName());
		}
		catch (IOException | NoSuchAlgorithmException | InvalidKeySpecException | JOSEException ex) {
			throw new AuthException("AUTH_TOKEN_ERROR", "No fue posible generar el token de autenticación.");
		}
	}

	private String normalizedEmail(String email) {
		return email == null ? null : email.trim().toLowerCase();
	}

	private String generateTemporaryPassword() {
		String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
		SecureRandom random = new SecureRandom();
		StringBuilder sb = new StringBuilder(12);
		for (int i = 0; i < 12; i++) {
			sb.append(chars.charAt(random.nextInt(chars.length())));
		}
		return sb.toString();
	}
}
