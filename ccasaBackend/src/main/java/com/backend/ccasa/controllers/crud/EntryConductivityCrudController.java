package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.EntryConductivityCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entry-conductivity")
public class EntryConductivityCrudController extends AbstractCrudController {

	public EntryConductivityCrudController(EntryConductivityCrudService service) {
		super(service);
	}
}
