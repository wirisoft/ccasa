package com.backend.ccasa.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

/**
 * Manejador global de excepciones. Devuelve respuestas de error consistentes.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(LogbookNotFoundException.class)
	public ResponseEntity<Map<String, Object>> handleLogbookNotFound(LogbookNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody("LOGBOOK_NOT_FOUND", ex.getMessage()));
	}

	@ExceptionHandler(EntryNotFoundException.class)
	public ResponseEntity<Map<String, Object>> handleEntryNotFound(EntryNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody("ENTRY_NOT_FOUND", ex.getMessage()));
	}

	@ExceptionHandler(FolioNotFoundException.class)
	public ResponseEntity<Map<String, Object>> handleFolioNotFound(FolioNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody("FOLIO_NOT_FOUND", ex.getMessage()));
	}

	@ExceptionHandler(UserNotFoundException.class)
	public ResponseEntity<Map<String, Object>> handleUserNotFound(UserNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody("USER_NOT_FOUND", ex.getMessage()));
	}

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(ex.getCode(), ex.getMessage()));
	}

	@ExceptionHandler(AuthException.class)
	public ResponseEntity<Map<String, Object>> handleAuthException(AuthException ex) {
		HttpStatus status = "AUTH_INVALID_CREDENTIALS".equals(ex.getCode()) ? HttpStatus.UNAUTHORIZED : HttpStatus.BAD_REQUEST;
		return ResponseEntity.status(status).body(errorBody(ex.getCode(), ex.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, Object>> handleInvalidRequest(IllegalArgumentException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody("INVALID_REQUEST", ex.getMessage()));
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorBody("ACCESS_DENIED", ex.getMessage()));
	}

	private static Map<String, Object> errorBody(String code, String message) {
		return Map.of(
			"code", code,
			"message", message != null ? message : "",
			"timestamp", Instant.now().toString()
		);
	}
}
