package com.backend.ccasa.service;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.JWTClaimsSet;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.text.ParseException;
import java.util.List;

/**
 * Servicio de utilidad JWT: generación y validación con RSA.
 * Los claims incluyen userId, email, role, tenantId, name, lastName, roles, permissions.
 */
public interface IJWTUtilityService {

	/**
	 * Genera un JWT para el usuario con el contexto de tenant (empresa/laboratorio).
	 */
	String generateJWT(Long userId, String email, String role, Long tenantId,
			String name, String lastName,
			List<String> roles, List<String> permissions)
			throws IOException, NoSuchAlgorithmException, InvalidKeySpecException, JOSEException;

	/**
	 * Parsea y valida el JWT (firma RSA + expiración). Lanza si es inválido.
	 */
	JWTClaimsSet parseJWT(String jwt)
			throws IOException, NoSuchAlgorithmException, InvalidKeySpecException, ParseException, JOSEException;
}
