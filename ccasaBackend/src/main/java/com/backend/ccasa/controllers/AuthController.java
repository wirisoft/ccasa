package com.backend.ccasa.controllers;

import com.backend.ccasa.security.CcasaUserDetails;
import com.backend.ccasa.service.IAuthService;
import com.backend.ccasa.service.models.dtos.AuthLoginRequestDTO;
import com.backend.ccasa.service.models.dtos.AuthRegisterRequestDTO;
import com.backend.ccasa.service.models.dtos.AuthResponseDTO;
import com.backend.ccasa.service.models.dtos.ChangePasswordRequestDTO;
import com.backend.ccasa.service.models.dtos.ForgotPasswordRequestDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	private final IAuthService authService;

	public AuthController(IAuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/register")
	public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody AuthRegisterRequestDTO request) {
		return ResponseEntity.ok(authService.register(request));
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody AuthLoginRequestDTO request) {
		return ResponseEntity.ok(authService.login(request));
	}

	@PostMapping("/init-admin")
	public ResponseEntity<AuthResponseDTO> createInitialAdmin() {
		return ResponseEntity.ok(authService.createInitialAdmin());
	}

	@PostMapping("/forgot-password")
	public ResponseEntity<Void> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) {
		authService.forgotPassword(request.email());
		return ResponseEntity.ok().build();
	}

	@PostMapping("/change-password")
	public ResponseEntity<Void> changePassword(
			@RequestBody ChangePasswordRequestDTO request,
			@AuthenticationPrincipal CcasaUserDetails principal) {
		authService.changePassword(principal.getUserIdAsLong(), request.currentPassword(), request.newPassword());
		return ResponseEntity.ok().build();
	}
}
