package com.backend.ccasa.config;

import com.backend.ccasa.persistence.entities.RoleEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.repositories.RoleRepository;
import com.backend.ccasa.persistence.repositories.UserRepository;
import com.backend.ccasa.service.models.enums.RoleNameEnum;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Carga inicial en arranque: catálogo de fórmulas por celda (solo metadatos Excel, sin folios ni registros),
 * datos de laboratorio (bitácoras, parámetros RF, soluciones, equipos) y usuarios.
 * Ver {@code FORMULA_CATALOG.md} en este paquete. Parámetros RF en {@link LaboratoryInitializationService}.
 * <p>
 * Contraseña inicial de los usuarios sembrados: {@code change-me} (obligatorio cambiar en producción).
 */
@Configuration
public class DataLoader {

	private static final Logger LOGGER = LoggerFactory.getLogger(DataLoader.class);

	@Bean
	@Order(0)
	public ApplicationRunner loadFormulaCellCatalog(FormulaCatalogSeedService formulaCatalogSeedService) {
		return args -> formulaCatalogSeedService.ensureFormulaCatalogLoaded();
	}

	@Bean
	@Order(1)
	public ApplicationRunner loadLaboratoryDefaults(LaboratoryInitializationService laboratoryInitializationService) {
		return args -> laboratoryInitializationService.ensureDefaultLaboratoryData();
	}

	@Bean
	@Order(2)
	public ApplicationRunner loadRolesAndUsers(RoleRepository roleRepo, UserRepository userRepo, PasswordEncoder passwordEncoder) {
		return args -> {
			RoleEntity adminRole = ensureRole(roleRepo, RoleNameEnum.Admin, "Administrador del sistema");
			ensureRole(roleRepo, RoleNameEnum.Analyst, "Analista de laboratorio");
			ensureRole(roleRepo, RoleNameEnum.Sampler, "Muestreador");
			RoleEntity supervisorRole = ensureRole(roleRepo, RoleNameEnum.Supervisor, "Supervisor de laboratorio / muestreo");

			ensureUserIfAbsent(userRepo, passwordEncoder, "admin@ccasa.local", "Admin", "Sistema", adminRole);
			ensureUserIfAbsent(userRepo, passwordEncoder, "cesar.alvarado@ccasa.local", "Cesar Clemente", "Alvarado Garcia", adminRole);
			ensureUserIfAbsent(userRepo, passwordEncoder, "bruno.chavez@ccasa.local", "Bruno Ariel", "Chavez Naranjo", supervisorRole);
		};
	}

	private static RoleEntity ensureRole(RoleRepository roleRepo, RoleNameEnum name, String description) {
		return roleRepo.findByName(name).orElseGet(() -> {
			RoleEntity role = new RoleEntity();
			role.setName(name);
			role.setDescription(description);
			return roleRepo.save(role);
		});
	}

	private static void ensureUserIfAbsent(
		UserRepository userRepo,
		PasswordEncoder passwordEncoder,
		String email,
		String firstName,
		String lastName,
		RoleEntity role
	) {
		if (isBlank(email) || isBlank(firstName) || isBlank(lastName)) {
			LOGGER.warn("Usuario sembrado omitido: email, nombre o apellido vacío");
			return;
		}
		if (role == null) {
			LOGGER.warn("Usuario sembrado omitido: rol nulo");
			return;
		}
		String emailKey = email.trim();
		userRepo.findByEmail(emailKey).orElseGet(() -> {
			UserEntity user = new UserEntity();
			user.setFirstName(firstName.trim());
			user.setLastName(lastName.trim());
			user.setEmail(emailKey);
			user.setPasswordHash(passwordEncoder.encode("change-me"));
			user.setRole(role);
			user.setActive(true);
			return userRepo.save(user);
		});
	}

	private static boolean isBlank(String s) {
		return s == null || s.trim().isEmpty();
	}
}
