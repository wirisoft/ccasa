package com.backend.ccasa.service.impl;

import com.backend.ccasa.service.IJWTUtilityService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.List;

@Service
public class JWTUtilityServiceImpl implements IJWTUtilityService {

	private static final Logger LOGGER = LoggerFactory.getLogger(JWTUtilityServiceImpl.class);

	private static final long DEFAULT_EXPIRATION_MS = 86400000L; // 24 horas

	@Value("classpath:jwtKeys/private_key.pem")
	private Resource privateKeyResource;

	@Value("classpath:jwtKeys/public_key.pem")
	private Resource publicKeyResource;

	@Value("${app.jwt.expiration-ms:86400000}")
	private long expirationMs = DEFAULT_EXPIRATION_MS;

	@Override
	public String generateJWT(Long userId, String email, String role, Long tenantId,
			String name, String lastName,
			List<String> roles, List<String> permissions)
			throws IOException, NoSuchAlgorithmException, InvalidKeySpecException, JOSEException {

		PrivateKey privateKey = loadPrivateKey(privateKeyResource);
		JWSSigner signer = new RSASSASigner(privateKey);
		Date now = new Date();

		JWTClaimsSet.Builder builder = new JWTClaimsSet.Builder()
				.subject(userId != null ? userId.toString() : null)
				.claim("email", email)
				.claim("role", role != null ? role : "USER")
				.claim("name", name)
				.claim("lastName", lastName)
				.claim("tenantId", tenantId)
				.issuer("ccasa-api")
				.audience("ccasa-frontend")
				.issueTime(now)
				.expirationTime(new Date(now.getTime() + expirationMs));

		if (roles != null && !roles.isEmpty()) {
			builder.claim("roles", new ArrayList<>(roles));
		}
		if (permissions != null && !permissions.isEmpty()) {
			builder.claim("permissions", new ArrayList<>(permissions));
		}

		JWTClaimsSet claimsSet = builder.build();
		SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.RS256), claimsSet);
		signedJWT.sign(signer);

		LOGGER.debug("JWT generado para usuario: {} (tenantId: {})", email, tenantId);
		return signedJWT.serialize();
	}

	@Override
	public JWTClaimsSet parseJWT(String jwt)
			throws IOException, NoSuchAlgorithmException, InvalidKeySpecException, ParseException, JOSEException {

		PublicKey publicKey = loadPublicKey(publicKeyResource);
		SignedJWT signedJWT = SignedJWT.parse(jwt);

		JWSVerifier verifier = new RSASSAVerifier((RSAPublicKey) publicKey);
		if (!signedJWT.verify(verifier)) {
			LOGGER.error("Firma del JWT inválida");
			throw new JOSEException("Invalid signature");
		}

		JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();
		if (claimsSet.getExpirationTime() != null && claimsSet.getExpirationTime().before(new Date())) {
			LOGGER.error("Token JWT expirado");
			throw new JOSEException("Expired token");
		}

		return claimsSet;
	}

	private PrivateKey loadPrivateKey(Resource resource) throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
		byte[] keyBytes = resource.getInputStream().readAllBytes();
		String privateKeyPEM = new String(keyBytes, StandardCharsets.UTF_8)
				.replace("-----BEGIN PRIVATE KEY-----", "")
				.replace("-----END PRIVATE KEY-----", "")
				.replaceAll("\\s", "");
		byte[] decodedKey = Base64.getDecoder().decode(privateKeyPEM);
		KeyFactory keyFactory = KeyFactory.getInstance("RSA");
		return keyFactory.generatePrivate(new PKCS8EncodedKeySpec(decodedKey));
	}

	private PublicKey loadPublicKey(Resource resource) throws IOException, NoSuchAlgorithmException, InvalidKeySpecException {
		byte[] keyBytes = resource.getInputStream().readAllBytes();
		String publicKeyPEM = new String(keyBytes, StandardCharsets.UTF_8)
				.replace("-----BEGIN PUBLIC KEY-----", "")
				.replace("-----END PUBLIC KEY-----", "")
				.replaceAll("\\s", "");
		byte[] decodedKey = Base64.getDecoder().decode(publicKeyPEM);
		KeyFactory keyFactory = KeyFactory.getInstance("RSA");
		return keyFactory.generatePublic(new X509EncodedKeySpec(decodedKey));
	}
}
