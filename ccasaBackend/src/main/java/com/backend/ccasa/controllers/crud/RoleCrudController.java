package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.RoleCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/roles")
public class RoleCrudController extends AbstractCrudController {

	public RoleCrudController(RoleCrudService service) {
		super(service);
	}
}
