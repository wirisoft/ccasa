package com.backend.ccasa.config;

import com.backend.ccasa.persistence.repositories.LabFormulaCellRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Carga masiva idempotente del catálogo de fórmulas por celda desde {@code classpath:catalog/formula_cells.jsonl}.
 * Solo inserta si no hay filas activas ({@code deleted_at IS NULL}).
 */
@Service
public class FormulaCatalogSeedService {

	private static final Logger LOGGER = LoggerFactory.getLogger(FormulaCatalogSeedService.class);
	private static final String CATALOG_RESOURCE = "catalog/formula_cells.jsonl";
	private static final int BATCH_SIZE = 1000;

	private final LabFormulaCellRepository labFormulaCellRepository;
	private final JdbcTemplate jdbcTemplate;
	private final ObjectMapper objectMapper;

	@Value("${ccasa.formula-catalog.seed-enabled:true}")
	private boolean seedEnabled;

	public FormulaCatalogSeedService(
		LabFormulaCellRepository labFormulaCellRepository,
		JdbcTemplate jdbcTemplate,
		ObjectMapper objectMapper
	) {
		this.labFormulaCellRepository = labFormulaCellRepository;
		this.jdbcTemplate = jdbcTemplate;
		this.objectMapper = objectMapper;
	}

	@Transactional
	public void ensureFormulaCatalogLoaded() {
		if (!seedEnabled) {
			LOGGER.info("Semilla de catálogo de fórmulas desactivada (ccasa.formula-catalog.seed-enabled=false)");
			return;
		}
		long existing = labFormulaCellRepository.countByDeletedAtIsNull();
		if (existing > 0) {
			LOGGER.debug("Catálogo de fórmulas ya presente ({} filas activas); omitiendo carga", existing);
			return;
		}
		Resource resource = new ClassPathResource(CATALOG_RESOURCE);
		if (!resource.exists()) {
			LOGGER.warn(
				"Recurso {} no encontrado en classpath. Ejecute build_formula_cell_catalog.py y copie formula_cells.jsonl a src/main/resources/catalog/",
				CATALOG_RESOURCE
			);
			return;
		}
		Instant now = Instant.now();
		Timestamp ts = Timestamp.from(now);
		int inserted = 0;
		try (InputStream in = resource.getInputStream();
			BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
			List<Object[]> batch = new ArrayList<>(BATCH_SIZE);
			String line;
			while ((line = reader.readLine()) != null) {
				line = line.trim();
				if (line.isEmpty()) {
					continue;
				}
				JsonNode node = objectMapper.readTree(line);
				String code = text(node, "code");
				String fileKey = text(node, "fileKey");
				String sheetName = text(node, "sheetName");
				String cellRef = text(node, "cellRef");
				String formulaText = text(node, "formulaText");
				if (code == null || fileKey == null || sheetName == null || cellRef == null || formulaText == null) {
					LOGGER.warn("Línea JSONL omitida (campos incompletos)");
					continue;
				}
				batch.add(new Object[] { code, fileKey, sheetName, cellRef, formulaText });
				if (batch.size() >= BATCH_SIZE) {
					inserted += flushBatch(batch, ts);
					batch.clear();
				}
			}
			if (!batch.isEmpty()) {
				inserted += flushBatch(batch, ts);
			}
		} catch (Exception e) {
			throw new IllegalStateException("Error al cargar catálogo de fórmulas desde " + CATALOG_RESOURCE, e);
		}
		LOGGER.info("Catálogo de fórmulas: {} filas insertadas (aprox.; con ON CONFLICT filas duplicadas no cuentan)", inserted);
	}

	private int flushBatch(List<Object[]> batch, Timestamp ts) {
		String sql =
			"INSERT INTO lab_formula_cell (code, file_key, sheet_name, cell_ref, formula_text, created_at, updated_at, deleted_at) "
				+ "VALUES (?,?,?,?,?,?,?,?) ON CONFLICT (code) DO NOTHING";
		int[] results =
			jdbcTemplate.batchUpdate(
				sql,
				new BatchPreparedStatementSetter() {
					@Override
					public void setValues(PreparedStatement ps, int i) throws SQLException {
						Object[] row = batch.get(i);
						ps.setString(1, (String) row[0]);
						ps.setString(2, (String) row[1]);
						ps.setString(3, (String) row[2]);
						ps.setString(4, (String) row[3]);
						ps.setString(5, (String) row[4]);
						ps.setTimestamp(6, ts);
						ps.setTimestamp(7, ts);
						ps.setObject(8, null);
					}

					@Override
					public int getBatchSize() {
						return batch.size();
					}
				}
			);
		int sum = 0;
		for (int r : results) {
			sum += r;
		}
		return sum;
	}

	private static String text(JsonNode node, String field) {
		JsonNode v = node.get(field);
		if (v == null || v.isNull()) {
			return null;
		}
		return v.asText();
	}
}
