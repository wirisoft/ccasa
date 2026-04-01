package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.FolioCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/folios")
public class FolioCrudController extends AbstractCrudController {

	public FolioCrudController(FolioCrudService service) {
		super(service);
	}
}
