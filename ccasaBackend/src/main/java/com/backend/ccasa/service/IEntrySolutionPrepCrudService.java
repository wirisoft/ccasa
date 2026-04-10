package com.backend.ccasa.service;

public interface IEntrySolutionPrepCrudService extends ITypedCrudService {

	byte[] generatePdf(Long id);
}
