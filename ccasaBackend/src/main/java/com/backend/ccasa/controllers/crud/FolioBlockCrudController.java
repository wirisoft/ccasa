package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.FolioBlockCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/folio-blocks")
public class FolioBlockCrudController extends AbstractCrudController {

	public FolioBlockCrudController(FolioBlockCrudService service) {
		super(service);
	}
}
