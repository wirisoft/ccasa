package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.ReagentJarCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reagent-jars")
public class ReagentJarCrudController extends AbstractCrudController {

	public ReagentJarCrudController(ReagentJarCrudService service) {
		super(service);
	}
}
