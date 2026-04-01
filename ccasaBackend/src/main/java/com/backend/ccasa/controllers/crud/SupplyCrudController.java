package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.SupplyCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/supplies")
public class SupplyCrudController extends AbstractCrudController {

	public SupplyCrudController(SupplyCrudService service) {
		super(service);
	}
}
