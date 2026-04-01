package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.EntrySolutionPrepCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entry-solution-prep")
public class EntrySolutionPrepCrudController extends AbstractCrudController {

	public EntrySolutionPrepCrudController(EntrySolutionPrepCrudService service) {
		super(service);
	}
}
