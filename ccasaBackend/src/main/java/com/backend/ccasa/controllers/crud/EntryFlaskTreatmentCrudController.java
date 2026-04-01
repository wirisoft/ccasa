package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.EntryFlaskTreatmentCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entry-flask-treatment")
public class EntryFlaskTreatmentCrudController extends AbstractCrudController {

	public EntryFlaskTreatmentCrudController(EntryFlaskTreatmentCrudService service) {
		super(service);
	}
}
