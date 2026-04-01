package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.EntryDistilledWaterCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entry-distilled-water")
public class EntryDistilledWaterCrudController extends AbstractCrudController {

	public EntryDistilledWaterCrudController(EntryDistilledWaterCrudService service) {
		super(service);
	}
}
