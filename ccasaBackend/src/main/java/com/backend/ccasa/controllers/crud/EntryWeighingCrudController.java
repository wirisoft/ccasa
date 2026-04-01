package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.EntryWeighingCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entry-weighing")
public class EntryWeighingCrudController extends AbstractCrudController {

	public EntryWeighingCrudController(EntryWeighingCrudService service) {
		super(service);
	}
}
