package com.backend.ccasa.security;

import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.repositories.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Bean para expresiones {@code @PreAuthorize}: permitir que un usuario acceda solo a su propio {@code userId}.
 */
@Component("ccasaUserSecurity")
public class CcasaUserSecurity {

	private final UserRepository userRepository;

	public CcasaUserSecurity(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public boolean isSelf(Long userId) {
		if (userId == null) {
			return false;
		}

		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !(auth.getPrincipal() instanceof CcasaUserDetails principal)) {
			return false;
		}

		Long selfId = principal.getUserIdAsLong();

		return selfId != null && selfId.equals(userId);
	}

	/**
	 * Analista con nomenclatura TCM o TMC puede aprobar/revisar conductividad (alineado con la regla de negocio del servicio).
	 * ADMIN y SUPERVISOR se cubren con {@code hasAnyRole} en el controlador.
	 */
	public boolean canReviewConductivityRecord() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !(auth.getPrincipal() instanceof CcasaUserDetails principal)) {
			return false;
		}

		if (!principal.hasRole("ANALYST")) {
			return false;
		}

		Long userId = principal.getUserIdAsLong();
		if (userId == null) {
			return false;
		}

		return userRepository.findByIdAndDeletedAtIsNull(userId)
				.filter(UserEntity::isActive)
				.map(u -> {
					String n = u.getNomenclature();
					if (n == null) {
						return "";
					}
					return n.trim();
				})
				.filter(n -> !n.isEmpty())
				.map(n -> "TCM".equalsIgnoreCase(n) || "TMC".equalsIgnoreCase(n))
				.orElse(false);
	}
}
