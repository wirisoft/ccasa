package com.backend.ccasa.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class FormulaCellCodeHashTest {

	@Test
	void codeMatchesBuildScriptVector() {
		String code =
			FormulaCellCodeHash.codeFor(
				"1-AGUA_DESTILADA_1-MT_1-MT-02_AGUA_DESTILADA.xlsx",
				"MACHOTE",
				"M8"
			);
		assertEquals("FC2c6803d43af4132b46597d7cbde4a7a7", code);
	}
}
