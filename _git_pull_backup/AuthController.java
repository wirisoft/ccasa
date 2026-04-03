package com.backend.ccasa.controllers;

import com.backend.ccasa.service.IAuthService;
import com.backend.ccasa.services.models.dtos.LoginRequestDTO;
import com.backend.ccasa.services.models.dtos.LoginResponseDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Autenticación pública: login (JWT).
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	private final IAuthService authService;

	public AuthController(IAuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/login")
	public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
		return ResponseEntity.ok(authService.login(request));
	}
}
