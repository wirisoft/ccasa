package com.backend.ccasa.security;

import java.util.Collections;
import java.util.List;

/**
 * Datos del usuario autenticado en el SecurityContext (principal del JWT).
 * Multi-tenant: tenantId identifica la empresa/laboratorio del usuario.
 *
 * Uso en controllers/servicios:
 *   CcasaUserDetails user = (CcasaUserDetails)
 *       SecurityContextHolder.getContext().getAuthentication().getPrincipal();
 *   Long tenantId = user.getTenantId();
 *   boolean isAdmin = user.hasRole("ADMIN");
 */
public class CcasaUserDetails {

	private final String userId;
	private final String email;
	private final String role;
	private final String name;
	private final String lastName;
	private final Long tenantId;
	private final List<String> roles;
	private final List<String> permissions;

	public CcasaUserDetails(String userId, String email, String role,
			String name, String lastName, Long tenantId,
			List<String> roles, List<String> permissions) {
		this.userId = userId;
		this.email = email;
		this.role = role;
		this.name = name;
		this.lastName = lastName;
		this.tenantId = tenantId;
		this.roles = roles != null ? Collections.unmodifiableList(roles) : Collections.emptyList();
		this.permissions = permissions != null ? Collections.unmodifiableList(permissions) : Collections.emptyList();
	}

	public Long getUserIdAsLong() {
		try {
			return Long.parseLong(userId);
		} catch (NumberFormatException e) {
			return null;
		}
	}

	public boolean hasPermission(String permissionKey) {
		return permissions.contains(permissionKey);
	}

	public boolean hasRole(String roleName) {
		return roles.contains(roleName) || (roleName != null && roleName.equalsIgnoreCase(role));
	}

	public String getUserId() {
		return userId;
	}

	public String getEmail() {
		return email;
	}

	public String getRole() {
		return role;
	}

	public String getName() {
		return name;
	}

	public String getLastName() {
		return lastName;
	}

	public Long getTenantId() {
		return tenantId;
	}

	public List<String> getRoles() {
		return roles;
	}

	public List<String> getPermissions() {
		return permissions;
	}
}
