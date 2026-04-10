package com.backend.ccasa.service;

public interface IEntryMaterialWashCrudService extends ITypedCrudService {

	byte[] generatePdf(Long id);
}
