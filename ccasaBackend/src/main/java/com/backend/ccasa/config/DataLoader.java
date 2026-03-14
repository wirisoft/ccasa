package com.backend.ccasa.config;

import com.backend.ccasa.persistence.entities.LogbookEntity;
import com.backend.ccasa.persistence.entities.RoleEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.repositories.LogbookRepository;
import com.backend.ccasa.persistence.repositories.RoleRepository;
import com.backend.ccasa.persistence.repositories.UserRepository;
import com.backend.ccasa.services.models.enums.RoleNameEnum;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

/**
 * Carga inicial: 15 bitácoras (UI-01), rol Admin y usuario de prueba.
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
				l.setName("Bitácora " + code);
				l.setDescription("Bitácora de laboratorio código " + code);
				l.setMaxEntries(200);
				repo.save(l);
			}
		};
	}

	@Bean
	@Order(2)
	public ApplicationRunner loadRolesAndUser(RoleRepository roleRepo, UserRepository userRepo) {
		return args -> {
			if (roleRepo.count() > 0) return;
			RoleEntity admin = new RoleEntity();
			admin.setName(RoleNameEnum.Admin);
			admin.setDescription("Administrador del sistema");
			admin = roleRepo.save(admin);

			UserEntity u = new UserEntity();
			u.setFirstName("Admin");
			u.setLastName("Sistema");
			u.setEmail("admin@ccasa.local");
			u.setPasswordHash("{noop}change-me");
			u.setRole(admin);
			u.setActive(true);
			userRepo.save(u);
		};
	}
}
