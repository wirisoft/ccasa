package com.backend.ccasa.controllers.crud;

import com.backend.ccasa.controllers.AbstractCrudController;
import com.backend.ccasa.service.impl.EntryExpenseChartCrudService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entry-expense-chart")
public class EntryExpenseChartCrudController extends AbstractCrudController {

	public EntryExpenseChartCrudController(EntryExpenseChartCrudService service) {
		super(service);
	}
}
