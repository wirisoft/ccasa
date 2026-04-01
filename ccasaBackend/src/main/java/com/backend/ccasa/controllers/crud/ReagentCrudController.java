package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.ReagentCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reagents")
public class ReagentCrudController extends AbstractCrudController {

	public ReagentCrudController(ReagentCrudService service) {
		super(service);
	}
}
