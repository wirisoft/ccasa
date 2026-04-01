package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.EntryDryingOvenCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entry-drying-oven")
public class EntryDryingOvenCrudController extends AbstractCrudController {

	public EntryDryingOvenCrudController(EntryDryingOvenCrudService service) {
		super(service);
	}
}
