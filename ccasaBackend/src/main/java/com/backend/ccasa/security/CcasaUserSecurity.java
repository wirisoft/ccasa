package com.backend.ccasa.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Bean para expresiones {@code @PreAuthorize}: permitir que un usuario acceda solo a su propio {@code userId}.
 */
@Component("ccasaUserSecurity")
public class CcasaUserSecurity {

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
}
