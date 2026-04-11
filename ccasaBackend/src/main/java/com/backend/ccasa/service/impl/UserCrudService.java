package com.backend.ccasa.service.impl;

import com.backend.ccasa.exceptions.UserNotFoundException;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.repositories.UserRepository;
import com.backend.ccasa.security.CcasaUserDetails;
import com.backend.ccasa.service.IUserCrudService;
import com.backend.ccasa.service.models.dtos.CrudRequestDTO;
import com.backend.ccasa.service.models.dtos.CrudResponseDTO;
import com.backend.ccasa.service.models.enums.RoleNameEnum;
import jakarta.persistence.EntityManager;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserCrudService extends AbstractEntityCrudService<UserEntity> implements IUserCrudService {

	private final UserRepository userRepository;

	public UserCrudService(UserRepository repository, EntityManager entityManager) {
		super(repository, entityManager, UserEntity.class, "USER");
		this.userRepository = repository;
	}

	@Override
	@Transactional(readOnly = true)
	public CrudResponseDTO findByEmail(String email) {
		UserEntity user = userRepository.findByEmail(email)
				.orElseThrow(() -> new UserNotFoundException(0L));
		return toDto(user);
	}

	@Override
	@Transactional(readOnly = true)
	public List<CrudResponseDTO> findByRole(String roleName) {
		if (roleName == null || roleName.isBlank()) {
			return List.of();
		}
		RoleNameEnum role;
		try {
			role = RoleNameEnum.valueOf(roleName.trim());
		} catch (IllegalArgumentException ex) {
			return List.of();
		}
		return userRepository.findByRoleNameAndDeletedAtIsNull(role).stream()
				.map(this::toDto)
				.toList();
	}

	@Override
	protected UserEntity newEntity() {
		return new UserEntity();
	}

	@Override
	protected List<String> requiredFields() {
		return List.of("firstName", "lastName", "email", "roleId");
	}

	/**
	 * Admin: actualización completa. Cualquier otro usuario autenticado solo sobre su propio id y únicamente
	 * nombre, apellido y correo (Mi cuenta); no puede cambiar rol, activo ni contraseña por este endpoint.
	 */
	@Override
	public CrudResponseDTO update(Long id, CrudRequestDTO request) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.getPrincipal() instanceof CcasaUserDetails principal) {
			if (principal.hasRole("ADMIN")) {
				return super.update(id, request);
			}

			Long selfId = principal.getUserIdAsLong();
			if (selfId != null && selfId.equals(id)) {
				Map<String, Object> vals = values(request);
				Map<String, Object> allowed = new LinkedHashMap<>();

				copyIfPresent(vals, allowed, "firstName");
				copyIfPresent(vals, allowed, "lastName");
				copyIfPresent(vals, allowed, "email");

				return super.update(id, new CrudRequestDTO(allowed));
			}
		}

		return super.update(id, request);
	}

	private static void copyIfPresent(Map<String, Object> from, Map<String, Object> to, String key) {
		if (from.containsKey(key)) {
			to.put(key, from.get(key));
		}
	}
}
