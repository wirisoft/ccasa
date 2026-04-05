package com.backend.ccasa.service;

import java.math.BigDecimal;

/**
 * Lectura de parámetros de referencia (límites) con valores por defecto si no hay fila en BD.
 */
public interface IReferenceParameterService {

	BigDecimal getMinValue(String code, BigDecimal defaultMin);

	BigDecimal getMaxValue(String code, BigDecimal defaultMax);
}
