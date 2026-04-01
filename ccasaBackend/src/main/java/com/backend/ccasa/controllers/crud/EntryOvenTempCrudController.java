package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.EntryOvenTempCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entry-oven-temp")
public class EntryOvenTempCrudController extends AbstractCrudController {

	public EntryOvenTempCrudController(EntryOvenTempCrudService service) {
		super(service);
	}
}
