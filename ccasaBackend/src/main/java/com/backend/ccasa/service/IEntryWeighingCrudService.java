package com.backend.ccasa.service;

public interface IEntryWeighingCrudService extends ITypedCrudService {

	byte[] generatePdf(Long id);
}
