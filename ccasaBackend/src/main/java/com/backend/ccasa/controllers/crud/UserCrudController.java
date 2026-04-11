package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.service.IAuthService;
import com.backend.ccasa.service.IUserCrudService;
import com.backend.ccasa.service.IUserSignatureService;
import com.backend.ccasa.service.models.dtos.CrudRequestDTO;
import com.backend.ccasa.service.models.dtos.CrudResponseDTO;
import com.backend.ccasa.service.models.dtos.ResetPasswordResponseDTO;
import com.backend.ccasa.service.models.dtos.UserSignatureResponseDTO;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.backend.ccasa.security.CcasaUserDetails;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
public class UserCrudController {

	private final IUserCrudService service;
	private final IAuthService authService;
	private final IUserSignatureService userSignatureService;

	public UserCrudController(IUserCrudService service, IAuthService authService, IUserSignatureService userSignatureService) {
		this.service = service;
		this.authService = authService;
		this.userSignatureService = userSignatureService;
	}

	@PostMapping
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<CrudResponseDTO> create(@RequestBody CrudRequestDTO request) {
		return ResponseEntity.ok(service.create(request));
	}

	@GetMapping
	@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'ANALYST', 'SAMPLER')")
	public ResponseEntity<List<CrudResponseDTO>> getAll() {
		return ResponseEntity.ok(service.findAllActive());
	}

	/**
	 * Perfil CRUD del usuario autenticado (por email del JWT). Debe declararse antes de {@code /{id}} para que
	 * {@code "me"} no se interprete como id numérico.
	 */
	@GetMapping("/me")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<CrudResponseDTO> getMe(@AuthenticationPrincipal CcasaUserDetails principal) {
		String email = principal != null ? principal.getEmail() : null;
		if (email == null || email.isBlank()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return ResponseEntity.ok(service.findByEmail(email.trim()));
	}

	@GetMapping("/by-role/{roleName}")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<List<CrudResponseDTO>> getByRole(@PathVariable String roleName) {
		return ResponseEntity.ok(service.findByRole(roleName));
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR') or @ccasaUserSecurity.isSelf(#id)")
	public ResponseEntity<CrudResponseDTO> getById(@PathVariable Long id) {
		return ResponseEntity.ok(service.findById(id));
	}

	@PutMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN') or @ccasaUserSecurity.isSelf(#id)")
	public ResponseEntity<CrudResponseDTO> update(@PathVariable Long id, @RequestBody CrudRequestDTO request) {
		return ResponseEntity.ok(service.update(id, request));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		service.delete(id);
		return ResponseEntity.noContent().build();
	}

	/**
	 * Admin resetea la contraseña de otro usuario. Devuelve contraseña temporal.
	 */
	@PostMapping("/{id}/reset-password")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<ResetPasswordResponseDTO> resetPassword(@PathVariable Long id) {
		return ResponseEntity.ok(authService.resetPassword(id));
	}

	@PostMapping("/{id}/signature-file")
	@PreAuthorize("hasRole('ADMIN') or @ccasaUserSecurity.isSelf(#id)")
	public ResponseEntity<UserSignatureResponseDTO> uploadSignature(
		@PathVariable Long id,
		@RequestParam("file") MultipartFile file,
		@AuthenticationPrincipal CcasaUserDetails principal
	) {
		return ResponseEntity.ok(userSignatureService.uploadSignature(id, file, principal));
	}

	@PatchMapping("/{id}/restore")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> restore(@PathVariable Long id) {
		service.restore(id);
		return ResponseEntity.ok().build();
	}
}
