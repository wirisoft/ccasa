package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.EntryAccuracyCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entry-accuracy")
public class EntryAccuracyCrudController extends AbstractCrudController {

	public EntryAccuracyCrudController(EntryAccuracyCrudService service) {
		super(service);
	}
}
