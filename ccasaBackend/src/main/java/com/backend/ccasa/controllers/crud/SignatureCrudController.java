package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.SignatureCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/signatures")
public class SignatureCrudController extends AbstractCrudController {

	public SignatureCrudController(SignatureCrudService service) {
		super(service);
	}
}
