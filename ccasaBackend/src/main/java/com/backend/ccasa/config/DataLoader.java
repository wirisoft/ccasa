package com.backend.ccasa.config;

import com.backend.ccasa.persistence.entities.LogbookEntity;
import com.backend.ccasa.persistence.entities.RoleEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.repositories.LogbookRepository;
import com.backend.ccasa.persistence.repositories.RoleRepository;
import com.backend.ccasa.persistence.repositories.UserRepository;
import com.backend.ccasa.service.models.enums.RoleNameEnum;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

/**
 * Carga inicial: 15 bitÃ¡coras (UI-01), rol Admin y usuario de prueba.
 */
@Configuration
public class DataLoader {

	@Bean
	@Order(1)
	public ApplicationRunner loadLogbooks(LogbookRepository repo) {
		return args -> {
			if (repo.count() > 0) return;
			for (int code = 1; code <= 15; code++) {
				LogbookEntity l = new LogbookEntity();
				l.setCode(code);
				l.setName("BitÃ¡cora " + code);
				l.setDescription("BitÃ¡cora de laboratorio cÃ³digo " + code);
				l.setMaxEntries(200);
				repo.save(l);
			}
		};
	}

	@Bean
	@Order(2)
	public ApplicationRunner loadRolesAndUser(RoleRepository roleRepo, UserRepository userRepo, PasswordEncoder passwordEncoder) {
		return args -> {
			RoleEntity adminRole = roleRepo.findByName(RoleNameEnum.Admin).orElseGet(() -> {
				RoleEntity role = new RoleEntity();
				role.setName(RoleNameEnum.Admin);
				role.setDescription("Administrador del sistema");
				return roleRepo.save(role);
			});

			userRepo.findByEmail("admin@ccasa.local").orElseGet(() -> {
				UserEntity user = new UserEntity();
				user.setFirstName("Admin");
				user.setLastName("Sistema");
				user.setEmail("admin@ccasa.local");
				user.setPasswordHash(passwordEncoder.encode("change-me"));
				user.setRole(adminRole);
				user.setActive(true);
				return userRepo.save(user);
			});
		};
	}
}

