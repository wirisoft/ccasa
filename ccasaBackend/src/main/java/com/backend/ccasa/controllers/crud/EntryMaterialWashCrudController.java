package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.EntryMaterialWashCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entry-material-wash")
public class EntryMaterialWashCrudController extends AbstractCrudController {

	public EntryMaterialWashCrudController(EntryMaterialWashCrudService service) {
		super(service);
	}
}
