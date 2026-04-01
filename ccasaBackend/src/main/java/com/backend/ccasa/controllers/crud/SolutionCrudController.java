package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.SolutionCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/solutions")
public class SolutionCrudController extends AbstractCrudController {

	public SolutionCrudController(SolutionCrudService service) {
		super(service);
	}
}
