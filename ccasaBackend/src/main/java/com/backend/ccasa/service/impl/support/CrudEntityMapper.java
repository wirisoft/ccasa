package com.backend.ccasa.service.impl.support;

import com.backend.ccasa.persistence.entities.AlertEntity;
import com.backend.ccasa.persistence.entities.BatchEntity;
import com.backend.ccasa.persistence.entities.EntryEntity;
import com.backend.ccasa.persistence.entities.FolioBlockEntity;
import com.backend.ccasa.persistence.entities.FolioEntity;
import com.backend.ccasa.persistence.entities.LaboratoryEquipmentEntity;
import com.backend.ccasa.persistence.entities.LogbookEntity;
import com.backend.ccasa.persistence.entities.ReagentEntity;
import com.backend.ccasa.persistence.entities.ReagentJarEntity;
import com.backend.ccasa.persistence.entities.ReferenceParameterEntity;
import com.backend.ccasa.persistence.entities.RoleEntity;
import com.backend.ccasa.persistence.entities.SignatureEntity;
import com.backend.ccasa.persistence.entities.SolutionEntity;
import com.backend.ccasa.persistence.entities.SupplyEntity;
import com.backend.ccasa.persistence.entities.UserEntity;
import com.backend.ccasa.persistence.entities.audit.Auditable;
import com.backend.ccasa.persistence.entities.entry.EntryAccuracyEntity;
import com.backend.ccasa.persistence.entities.entry.EntryConductivityEntity;
import com.backend.ccasa.persistence.entities.entry.EntryDistilledWaterEntity;
import com.backend.ccasa.persistence.entities.entry.EntryDryingOvenEntity;
import com.backend.ccasa.persistence.entities.entry.EntryExpenseChartEntity;
import com.backend.ccasa.persistence.entities.entry.EntryFlaskTreatmentEntity;
import com.backend.ccasa.persistence.entities.entry.EntryMaterialWashEntity;
import com.backend.ccasa.persistence.entities.entry.EntryOvenTempEntity;
import com.backend.ccasa.persistence.entities.entry.EntrySolutionPrepEntity;
import com.backend.ccasa.persistence.entities.entry.EntryWeighingEntity;
import com.backend.ccasa.service.models.enums.AlertStatusEnum;
import com.backend.ccasa.service.models.enums.ConductivityTypeEnum;
import com.backend.ccasa.service.models.enums.EntryStatusEnum;
import com.backend.ccasa.service.models.enums.FolioStatusEnum;
import com.backend.ccasa.service.models.enums.PieceTypeEnum;
import com.backend.ccasa.service.models.enums.RoleNameEnum;
import com.backend.ccasa.service.models.enums.SignatureTypeEnum;
import com.backend.ccasa.service.models.enums.WaterTypeEnum;
import jakarta.persistence.EntityManager;
import java.util.LinkedHashMap;
import java.util.Map;

public final class CrudEntityMapper {

	private CrudEntityMapper() {
	}

	public static <E extends Auditable> void apply(Class<E> entityClass, E entity, Map<String, Object> values, EntityManager entityManager) {
		applyAudit(entity, values, entityManager);
		if (entity instanceof RoleEntity e) {
			if (values.containsKey("name")) e.setName(CrudValueHelper.asEnum(values.get("name"), RoleNameEnum.class));
			if (values.containsKey("description")) e.setDescription(CrudValueHelper.asString(values.get("description")));
			return;
		}
		if (entity instanceof UserEntity e) {
			if (values.containsKey("firstName")) e.setFirstName(CrudValueHelper.asString(values.get("firstName")));
			if (values.containsKey("lastName")) e.setLastName(CrudValueHelper.asString(values.get("lastName")));
			if (values.containsKey("email")) e.setEmail(CrudValueHelper.asString(values.get("email")));
			if (values.containsKey("passwordHash")) e.setPasswordHash(CrudValueHelper.asString(values.get("passwordHash")));
			if (values.containsKey("active")) e.setActive(Boolean.TRUE.equals(CrudValueHelper.asBoolean(values.get("active"))));
			if (values.containsKey("roleId")) e.setRole(requireActive(entityManager, RoleEntity.class, values.get("roleId")));
			return;
		}
		if (entity instanceof LogbookEntity e) {
			if (values.containsKey("code")) e.setCode(CrudValueHelper.asInteger(values.get("code")));
			if (values.containsKey("name")) e.setName(CrudValueHelper.asString(values.get("name")));
			if (values.containsKey("description")) e.setDescription(CrudValueHelper.asString(values.get("description")));
			if (values.containsKey("maxEntries")) e.setMaxEntries(CrudValueHelper.asInteger(values.get("maxEntries")));
			return;
		}
		if (entity instanceof FolioBlockEntity e) {
			if (values.containsKey("identifier")) e.setIdentifier(CrudValueHelper.asString(values.get("identifier")));
			if (values.containsKey("startNumber")) e.setStartNumber(CrudValueHelper.asInteger(values.get("startNumber")));
			if (values.containsKey("endNumber")) e.setEndNumber(CrudValueHelper.asInteger(values.get("endNumber")));
			if (values.containsKey("coverGenerated")) e.setCoverGenerated(Boolean.TRUE.equals(CrudValueHelper.asBoolean(values.get("coverGenerated"))));
			return;
		}
		if (entity instanceof FolioEntity e) {
			if (values.containsKey("folioNumber")) e.setFolioNumber(CrudValueHelper.asInteger(values.get("folioNumber")));
			if (values.containsKey("status")) e.setStatus(CrudValueHelper.asEnum(values.get("status"), FolioStatusEnum.class));
			if (values.containsKey("folioBlockId")) e.setFolioBlock(requireActive(entityManager, FolioBlockEntity.class, values.get("folioBlockId")));
			if (values.containsKey("logbookId")) e.setLogbook(requireActive(entityManager, LogbookEntity.class, values.get("logbookId")));
			return;
		}
		if (entity instanceof EntryEntity e) {
			if (values.containsKey("recordedAt")) e.setRecordedAt(CrudValueHelper.asInstant(values.get("recordedAt")));
			if (values.containsKey("status")) e.setStatus(CrudValueHelper.asEnum(values.get("status"), EntryStatusEnum.class));
			if (values.containsKey("folioId")) e.setFolio(requireActive(entityManager, FolioEntity.class, values.get("folioId")));
			if (values.containsKey("logbookId")) e.setLogbook(requireActive(entityManager, LogbookEntity.class, values.get("logbookId")));
			if (values.containsKey("userId")) e.setUser(requireActive(entityManager, UserEntity.class, values.get("userId")));
			return;
		}
		if (entity instanceof AlertEntity e) {
			if (values.containsKey("type")) e.setType(CrudValueHelper.asString(values.get("type")));
			if (values.containsKey("message")) e.setMessage(CrudValueHelper.asString(values.get("message")));
			if (values.containsKey("generatedAt")) e.setGeneratedAt(CrudValueHelper.asInstant(values.get("generatedAt")));
			if (values.containsKey("status")) e.setStatus(CrudValueHelper.asEnum(values.get("status"), AlertStatusEnum.class));
			if (values.containsKey("targetUserId")) e.setTargetUser(requireActive(entityManager, UserEntity.class, values.get("targetUserId")));
			return;
		}
		if (entity instanceof SignatureEntity e) {
			if (values.containsKey("signedAt")) e.setSignedAt(CrudValueHelper.asInstant(values.get("signedAt")));
			if (values.containsKey("signatureType")) e.setSignatureType(CrudValueHelper.asEnum(values.get("signatureType"), SignatureTypeEnum.class));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("supervisorUserId")) e.setSupervisorUser(requireActive(entityManager, UserEntity.class, values.get("supervisorUserId")));
			return;
		}
		if (entity instanceof ReagentEntity e) {
			if (values.containsKey("name")) e.setName(CrudValueHelper.asString(values.get("name")));
			if (values.containsKey("chemicalFormula")) e.setChemicalFormula(CrudValueHelper.asString(values.get("chemicalFormula")));
			if (values.containsKey("unit")) e.setUnit(CrudValueHelper.asString(values.get("unit")));
			if (values.containsKey("totalStock")) e.setTotalStock(CrudValueHelper.asBigDecimal(values.get("totalStock")));
			return;
		}
		if (entity instanceof BatchEntity e) {
			if (values.containsKey("batchCode")) e.setBatchCode(CrudValueHelper.asString(values.get("batchCode")));
			if (values.containsKey("generatedAt")) e.setGeneratedAt(CrudValueHelper.asLocalDate(values.get("generatedAt")));
			if (values.containsKey("startDate")) e.setStartDate(CrudValueHelper.asLocalDate(values.get("startDate")));
			if (values.containsKey("endDate")) e.setEndDate(CrudValueHelper.asLocalDate(values.get("endDate")));
			if (values.containsKey("reagentId")) e.setReagent(requireActive(entityManager, ReagentEntity.class, values.get("reagentId")));
			return;
		}
		if (entity instanceof ReagentJarEntity e) {
			if (values.containsKey("initialAmountG")) e.setInitialAmountG(CrudValueHelper.asBigDecimal(values.get("initialAmountG")));
			if (values.containsKey("currentAmountG")) e.setCurrentAmountG(CrudValueHelper.asBigDecimal(values.get("currentAmountG")));
			if (values.containsKey("openedAt")) e.setOpenedAt(CrudValueHelper.asLocalDate(values.get("openedAt")));
			if (values.containsKey("reagentId")) e.setReagent(requireActive(entityManager, ReagentEntity.class, values.get("reagentId")));
			return;
		}
		if (entity instanceof SolutionEntity e) {
			if (values.containsKey("name")) e.setName(CrudValueHelper.asString(values.get("name")));
			if (values.containsKey("concentration")) e.setConcentration(CrudValueHelper.asString(values.get("concentration")));
			if (values.containsKey("quantity")) e.setQuantity(CrudValueHelper.asString(values.get("quantity")));
			return;
		}
		if (entity instanceof SupplyEntity e) {
			if (values.containsKey("name")) e.setName(CrudValueHelper.asString(values.get("name")));
			if (values.containsKey("availableQty")) e.setAvailableQty(CrudValueHelper.asBigDecimal(values.get("availableQty")));
			if (values.containsKey("unit")) e.setUnit(CrudValueHelper.asString(values.get("unit")));
			return;
		}
		if (entity instanceof EntryConductivityEntity e) {
			if (values.containsKey("type")) e.setType(CrudValueHelper.asEnum(values.get("type"), ConductivityTypeEnum.class));
			if (values.containsKey("measuredValue")) e.setMeasuredValue(CrudValueHelper.asBigDecimal(values.get("measuredValue")));
			if (values.containsKey("weightGrams")) e.setWeightGrams(CrudValueHelper.asBigDecimal(values.get("weightGrams")));
			if (values.containsKey("calculatedMol")) e.setCalculatedMol(CrudValueHelper.asBigDecimal(values.get("calculatedMol")));
			if (values.containsKey("calculatedValue")) e.setCalculatedValue(CrudValueHelper.asBigDecimal(values.get("calculatedValue")));
			if (values.containsKey("inRange")) e.setInRange(CrudValueHelper.asBoolean(values.get("inRange")));
			if (values.containsKey("autoDate")) e.setAutoDate(CrudValueHelper.asInstant(values.get("autoDate")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			return;
		}
		if (entity instanceof EntryDistilledWaterEntity e) {
			if (values.containsKey("phReading1")) e.setPhReading1(CrudValueHelper.asBigDecimal(values.get("phReading1")));
			if (values.containsKey("phReading2")) e.setPhReading2(CrudValueHelper.asBigDecimal(values.get("phReading2")));
			if (values.containsKey("phReading3")) e.setPhReading3(CrudValueHelper.asBigDecimal(values.get("phReading3")));
			if (values.containsKey("phAverage")) e.setPhAverage(CrudValueHelper.asBigDecimal(values.get("phAverage")));
			if (values.containsKey("ceReading1")) e.setCeReading1(CrudValueHelper.asBigDecimal(values.get("ceReading1")));
			if (values.containsKey("ceReading2")) e.setCeReading2(CrudValueHelper.asBigDecimal(values.get("ceReading2")));
			if (values.containsKey("ceReading3")) e.setCeReading3(CrudValueHelper.asBigDecimal(values.get("ceReading3")));
			if (values.containsKey("ceAverage")) e.setCeAverage(CrudValueHelper.asBigDecimal(values.get("ceAverage")));
			if (values.containsKey("referenceDifference")) e.setReferenceDifference(CrudValueHelper.asBigDecimal(values.get("referenceDifference")));
			if (values.containsKey("controlStandardPct")) e.setControlStandardPct(CrudValueHelper.asBigDecimal(values.get("controlStandardPct")));
			if (values.containsKey("isAcceptable")) e.setIsAcceptable(CrudValueHelper.asBoolean(values.get("isAcceptable")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("waterBatchId")) e.setWaterBatch(requireActive(entityManager, BatchEntity.class, values.get("waterBatchId")));
			return;
		}
		if (entity instanceof EntryOvenTempEntity e) {
			if (values.containsKey("rawTemperature")) e.setRawTemperature(CrudValueHelper.asBigDecimal(values.get("rawTemperature")));
			if (values.containsKey("correctedTemperature")) e.setCorrectedTemperature(CrudValueHelper.asBigDecimal(values.get("correctedTemperature")));
			if (values.containsKey("readingNumber")) e.setReadingNumber(CrudValueHelper.asInteger(values.get("readingNumber")));
			if (values.containsKey("recordedAt")) e.setRecordedAt(CrudValueHelper.asInstant(values.get("recordedAt")));
			if (values.containsKey("inRange")) e.setInRange(CrudValueHelper.asBoolean(values.get("inRange")));
			if (values.containsKey("isMaintenance")) e.setIsMaintenance(CrudValueHelper.asBoolean(values.get("isMaintenance")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			return;
		}
		if (entity instanceof EntryWeighingEntity e) {
			if (values.containsKey("weightGrams")) e.setWeightGrams(CrudValueHelper.asBigDecimal(values.get("weightGrams")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("reagentId")) e.setReagent(requireActive(entityManager, ReagentEntity.class, values.get("reagentId")));
			if (values.containsKey("targetSolutionId")) e.setTargetSolution(requireActive(entityManager, SolutionEntity.class, values.get("targetSolutionId")));
			return;
		}
		if (entity instanceof EntryMaterialWashEntity e) {
			if (values.containsKey("mondayDate")) e.setMondayDate(CrudValueHelper.asLocalDate(values.get("mondayDate")));
			if (values.containsKey("pieceType")) e.setPieceType(CrudValueHelper.asEnum(values.get("pieceType"), PieceTypeEnum.class));
			if (values.containsKey("material")) e.setMaterial(CrudValueHelper.asString(values.get("material")));
			if (values.containsKey("determination")) e.setDetermination(CrudValueHelper.asString(values.get("determination")));
			if (values.containsKey("color")) e.setColor(CrudValueHelper.asString(values.get("color")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("analystUserId")) e.setAnalystUser(requireActive(entityManager, UserEntity.class, values.get("analystUserId")));
			if (values.containsKey("supervisorUserId")) e.setSupervisorUser(requireActive(entityManager, UserEntity.class, values.get("supervisorUserId")));
			return;
		}
		if (entity instanceof EntrySolutionPrepEntity e) {
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("solutionId")) e.setSolution(requireActive(entityManager, SolutionEntity.class, values.get("solutionId")));
			if (values.containsKey("weighingEntryId")) e.setWeighingEntry(requireActive(entityManager, EntryWeighingEntity.class, values.get("weighingEntryId")));
			if (values.containsKey("analystUserId")) e.setAnalystUser(requireActive(entityManager, UserEntity.class, values.get("analystUserId")));
			return;
		}
		if (entity instanceof EntryDryingOvenEntity e) {
			if (values.containsKey("entryTime")) e.setEntryTime(CrudValueHelper.asLocalTime(values.get("entryTime")));
			if (values.containsKey("exitTime")) e.setExitTime(CrudValueHelper.asLocalTime(values.get("exitTime")));
			if (values.containsKey("meetsTemp")) e.setMeetsTemp(CrudValueHelper.asBoolean(values.get("meetsTemp")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("reagentId")) e.setReagent(requireActive(entityManager, ReagentEntity.class, values.get("reagentId")));
			if (values.containsKey("analystUserId")) e.setAnalystUser(requireActive(entityManager, UserEntity.class, values.get("analystUserId")));
			if (values.containsKey("supervisorUserId")) e.setSupervisorUser(requireActive(entityManager, UserEntity.class, values.get("supervisorUserId")));
			return;
		}
		if (entity instanceof EntryAccuracyEntity e) {
			if (values.containsKey("batch1Avg")) e.setBatch1Avg(CrudValueHelper.asBigDecimal(values.get("batch1Avg")));
			if (values.containsKey("batch2Avg")) e.setBatch2Avg(CrudValueHelper.asBigDecimal(values.get("batch2Avg")));
			if (values.containsKey("difference")) e.setDifference(CrudValueHelper.asBigDecimal(values.get("difference")));
			if (values.containsKey("inRange")) e.setInRange(CrudValueHelper.asBoolean(values.get("inRange")));
			if (values.containsKey("phFolioNumber")) e.setPhFolioNumber(CrudValueHelper.asInteger(values.get("phFolioNumber")));
			if (values.containsKey("dailyRecordDate")) e.setDailyRecordDate(CrudValueHelper.asLocalDate(values.get("dailyRecordDate")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("samplerUserId")) e.setSamplerUser(requireActive(entityManager, UserEntity.class, values.get("samplerUserId")));
			if (values.containsKey("phLogbookId")) e.setPhLogbook(requireActive(entityManager, LogbookEntity.class, values.get("phLogbookId")));
			return;
		}
		if (entity instanceof EntryExpenseChartEntity e) {
			if (values.containsKey("employmentDate")) e.setEmploymentDate(CrudValueHelper.asLocalDate(values.get("employmentDate")));
			if (values.containsKey("endDate")) e.setEndDate(CrudValueHelper.asLocalDate(values.get("endDate")));
			if (values.containsKey("equipmentKey")) e.setEquipmentKey(CrudValueHelper.asString(values.get("equipmentKey")));
			if (values.containsKey("distilledWaterQty")) e.setDistilledWaterQty(CrudValueHelper.asBigDecimal(values.get("distilledWaterQty")));
			if (values.containsKey("waterType")) e.setWaterType(CrudValueHelper.asEnum(values.get("waterType"), WaterTypeEnum.class));
			if (values.containsKey("kclUsedG")) e.setKclUsedG(CrudValueHelper.asBigDecimal(values.get("kclUsedG")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("batchId")) e.setBatch(requireActive(entityManager, BatchEntity.class, values.get("batchId")));
			if (values.containsKey("kclJarId")) e.setKclJar(requireActive(entityManager, ReagentJarEntity.class, values.get("kclJarId")));
			return;
		}
		if (entity instanceof EntryFlaskTreatmentEntity e) {
			if (values.containsKey("swabsUsed")) e.setSwabsUsed(CrudValueHelper.asInteger(values.get("swabsUsed")));
			if (values.containsKey("analysisValue")) e.setAnalysisValue(CrudValueHelper.asBigDecimal(values.get("analysisValue")));
			if (values.containsKey("cmcResult")) e.setCmcResult(CrudValueHelper.asString(values.get("cmcResult")));
			if (values.containsKey("reportDate")) e.setReportDate(CrudValueHelper.asLocalDate(values.get("reportDate")));
			if (values.containsKey("entryId")) e.setEntry(requireActive(entityManager, EntryEntity.class, values.get("entryId")));
			if (values.containsKey("washEntryId")) e.setWashEntry(requireActive(entityManager, EntryMaterialWashEntity.class, values.get("washEntryId")));
			if (values.containsKey("swabSupplyId")) e.setSwabSupply(requireActive(entityManager, SupplyEntity.class, values.get("swabSupplyId")));
			if (values.containsKey("supervisorUserId")) e.setSupervisorUser(requireActive(entityManager, UserEntity.class, values.get("supervisorUserId")));
			return;
		}
		if (entity instanceof LaboratoryEquipmentEntity e) {
			if (values.containsKey("equipmentType")) e.setEquipmentType(CrudValueHelper.asString(values.get("equipmentType")));
			if (values.containsKey("denomination")) e.setDenomination(CrudValueHelper.asString(values.get("denomination")));
			return;
		}
		if (entity instanceof ReferenceParameterEntity e) {
			if (values.containsKey("code")) e.setCode(CrudValueHelper.asString(values.get("code")));
			if (values.containsKey("minValue")) e.setMinValue(CrudValueHelper.asBigDecimal(values.get("minValue")));
			if (values.containsKey("maxValue")) e.setMaxValue(CrudValueHelper.asBigDecimal(values.get("maxValue")));
			if (values.containsKey("description")) e.setDescription(CrudValueHelper.asString(values.get("description")));
			if (values.containsKey("ruleDetail")) e.setRuleDetail(CrudValueHelper.asString(values.get("ruleDetail")));
			return;
		}
		throw new IllegalArgumentException("Unsupported entity for CRUD mapping: " + entityClass.getSimpleName());
	}

	public static <E extends Auditable> Map<String, Object> toValues(Class<E> entityClass, E entity) {
		Map<String, Object> values = new LinkedHashMap<>();
		if (entity instanceof RoleEntity e) {
			values.put("name", e.getName());
			values.put("description", e.getDescription());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof UserEntity e) {
			values.put("firstName", e.getFirstName());
			values.put("lastName", e.getLastName());
			values.put("email", e.getEmail());
			values.put("passwordHash", e.getPasswordHash());
			values.put("active", e.isActive());
			values.put("roleId", idOf(e.getRole()));
			putAudit(values, e);
			return values;
		}
		if (entity instanceof LogbookEntity e) {
			values.put("code", e.getCode());
			values.put("name", e.getName());
			values.put("description", e.getDescription());
			values.put("maxEntries", e.getMaxEntries());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof FolioBlockEntity e) {
			values.put("identifier", e.getIdentifier());
			values.put("startNumber", e.getStartNumber());
			values.put("endNumber", e.getEndNumber());
			values.put("coverGenerated", e.isCoverGenerated());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof FolioEntity e) {
			values.put("folioBlockId", idOf(e.getFolioBlock()));
			values.put("logbookId", idOf(e.getLogbook()));
			values.put("folioNumber", e.getFolioNumber());
			values.put("status", e.getStatus());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryEntity e) {
			values.put("folioId", idOf(e.getFolio()));
			values.put("logbookId", idOf(e.getLogbook()));
			values.put("userId", idOf(e.getUser()));
			values.put("recordedAt", e.getRecordedAt());
			values.put("status", e.getStatus());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof AlertEntity e) {
			values.put("type", e.getType());
			values.put("message", e.getMessage());
			values.put("generatedAt", e.getGeneratedAt());
			values.put("targetUserId", idOf(e.getTargetUser()));
			values.put("status", e.getStatus());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof SignatureEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("supervisorUserId", idOf(e.getSupervisorUser()));
			values.put("signedAt", e.getSignedAt());
			values.put("signatureType", e.getSignatureType());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof ReagentEntity e) {
			values.put("name", e.getName());
			values.put("chemicalFormula", e.getChemicalFormula());
			values.put("unit", e.getUnit());
			values.put("totalStock", e.getTotalStock());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof BatchEntity e) {
			values.put("batchCode", e.getBatchCode());
			values.put("reagentId", idOf(e.getReagent()));
			values.put("generatedAt", e.getGeneratedAt());
			values.put("startDate", e.getStartDate());
			values.put("endDate", e.getEndDate());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof ReagentJarEntity e) {
			values.put("reagentId", idOf(e.getReagent()));
			values.put("initialAmountG", e.getInitialAmountG());
			values.put("currentAmountG", e.getCurrentAmountG());
			values.put("openedAt", e.getOpenedAt());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof SolutionEntity e) {
			values.put("name", e.getName());
			values.put("concentration", e.getConcentration());
			values.put("quantity", e.getQuantity());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof SupplyEntity e) {
			values.put("name", e.getName());
			values.put("availableQty", e.getAvailableQty());
			values.put("unit", e.getUnit());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryConductivityEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("type", e.getType());
			values.put("measuredValue", e.getMeasuredValue());
			values.put("weightGrams", e.getWeightGrams());
			values.put("calculatedMol", e.getCalculatedMol());
			values.put("calculatedValue", e.getCalculatedValue());
			values.put("inRange", e.getInRange());
			values.put("autoDate", e.getAutoDate());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryDistilledWaterEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("phReading1", e.getPhReading1());
			values.put("phReading2", e.getPhReading2());
			values.put("phReading3", e.getPhReading3());
			values.put("phAverage", e.getPhAverage());
			values.put("ceReading1", e.getCeReading1());
			values.put("ceReading2", e.getCeReading2());
			values.put("ceReading3", e.getCeReading3());
			values.put("ceAverage", e.getCeAverage());
			values.put("referenceDifference", e.getReferenceDifference());
			values.put("controlStandardPct", e.getControlStandardPct());
			values.put("isAcceptable", e.getIsAcceptable());
			values.put("waterBatchId", idOf(e.getWaterBatch()));
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryOvenTempEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("rawTemperature", e.getRawTemperature());
			values.put("correctedTemperature", e.getCorrectedTemperature());
			values.put("readingNumber", e.getReadingNumber());
			values.put("recordedAt", e.getRecordedAt());
			values.put("inRange", e.getInRange());
			values.put("isMaintenance", e.getIsMaintenance());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryWeighingEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("reagentId", idOf(e.getReagent()));
			values.put("weightGrams", e.getWeightGrams());
			values.put("targetSolutionId", idOf(e.getTargetSolution()));
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryMaterialWashEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("mondayDate", e.getMondayDate());
			values.put("pieceType", e.getPieceType());
			values.put("material", e.getMaterial());
			values.put("determination", e.getDetermination());
			values.put("color", e.getColor());
			values.put("analystUserId", idOf(e.getAnalystUser()));
			values.put("supervisorUserId", idOf(e.getSupervisorUser()));
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntrySolutionPrepEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("solutionId", idOf(e.getSolution()));
			values.put("weighingEntryId", idOf(e.getWeighingEntry()));
			values.put("analystUserId", idOf(e.getAnalystUser()));
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryDryingOvenEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("reagentId", idOf(e.getReagent()));
			values.put("entryTime", e.getEntryTime());
			values.put("exitTime", e.getExitTime());
			values.put("analystUserId", idOf(e.getAnalystUser()));
			values.put("supervisorUserId", idOf(e.getSupervisorUser()));
			values.put("meetsTemp", e.getMeetsTemp());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryAccuracyEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("samplerUserId", idOf(e.getSamplerUser()));
			values.put("batch1Avg", e.getBatch1Avg());
			values.put("batch2Avg", e.getBatch2Avg());
			values.put("difference", e.getDifference());
			values.put("inRange", e.getInRange());
			values.put("phLogbookId", idOf(e.getPhLogbook()));
			values.put("phFolioNumber", e.getPhFolioNumber());
			values.put("dailyRecordDate", e.getDailyRecordDate());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryExpenseChartEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("employmentDate", e.getEmploymentDate());
			values.put("endDate", e.getEndDate());
			values.put("equipmentKey", e.getEquipmentKey());
			values.put("distilledWaterQty", e.getDistilledWaterQty());
			values.put("waterType", e.getWaterType());
			values.put("batchId", idOf(e.getBatch()));
			values.put("kclJarId", idOf(e.getKclJar()));
			values.put("kclUsedG", e.getKclUsedG());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof EntryFlaskTreatmentEntity e) {
			values.put("entryId", idOf(e.getEntry()));
			values.put("washEntryId", idOf(e.getWashEntry()));
			values.put("swabSupplyId", idOf(e.getSwabSupply()));
			values.put("swabsUsed", e.getSwabsUsed());
			values.put("analysisValue", e.getAnalysisValue());
			values.put("cmcResult", e.getCmcResult());
			values.put("reportDate", e.getReportDate());
			values.put("supervisorUserId", idOf(e.getSupervisorUser()));
			putAudit(values, e);
			return values;
		}
		if (entity instanceof LaboratoryEquipmentEntity e) {
			values.put("equipmentType", e.getEquipmentType());
			values.put("denomination", e.getDenomination());
			putAudit(values, e);
			return values;
		}
		if (entity instanceof ReferenceParameterEntity e) {
			values.put("code", e.getCode());
			values.put("minValue", e.getMinValue());
			values.put("maxValue", e.getMaxValue());
			values.put("description", e.getDescription());
			values.put("ruleDetail", e.getRuleDetail());
			putAudit(values, e);
			return values;
		}
		throw new IllegalArgumentException("Unsupported entity for CRUD mapping: " + entityClass.getSimpleName());
	}

	private static void applyAudit(Auditable entity, Map<String, Object> values, EntityManager entityManager) {
		if (values.containsKey("createdByUserId")) {
			entity.setCreatedByUser(requireActive(entityManager, UserEntity.class, values.get("createdByUserId")));
		}
		if (values.containsKey("updatedByUserId")) {
			entity.setUpdatedByUser(requireActive(entityManager, UserEntity.class, values.get("updatedByUserId")));
		}
		if (values.containsKey("deletedByUserId")) {
			entity.setDeletedByUser(requireActive(entityManager, UserEntity.class, values.get("deletedByUserId")));
		}
	}

	private static void putAudit(Map<String, Object> values, Auditable entity) {
		values.put("createdAt", entity.getCreatedAt());
		values.put("updatedAt", entity.getUpdatedAt());
		values.put("deletedAt", entity.getDeletedAt());
		values.put("createdByUserId", idOf(entity.getCreatedByUser()));
		values.put("updatedByUserId", idOf(entity.getUpdatedByUser()));
		values.put("deletedByUserId", idOf(entity.getDeletedByUser()));
	}

	private static <R extends Auditable> R requireActive(EntityManager entityManager, Class<R> relationClass, Object rawId) {
		Long id = CrudValueHelper.asLong(rawId);
		if (id == null) {
			return null;
		}
		R relation = entityManager.find(relationClass, id);
		if (relation == null || relation.getDeletedAt() != null) {
			throw new IllegalArgumentException("Related entity not found: " + relationClass.getSimpleName() + " id=" + id);
		}
		return relation;
	}

	private static Long idOf(Auditable relation) {
		if (relation == null) {
			return null;
		}
		if (relation instanceof RoleEntity e) return e.getId();
		if (relation instanceof UserEntity e) return e.getId();
		if (relation instanceof LogbookEntity e) return e.getId();
		if (relation instanceof FolioBlockEntity e) return e.getId();
		if (relation instanceof FolioEntity e) return e.getId();
		if (relation instanceof EntryEntity e) return e.getId();
		if (relation instanceof AlertEntity e) return e.getId();
		if (relation instanceof SignatureEntity e) return e.getId();
		if (relation instanceof ReagentEntity e) return e.getId();
		if (relation instanceof BatchEntity e) return e.getId();
		if (relation instanceof ReagentJarEntity e) return e.getId();
		if (relation instanceof SolutionEntity e) return e.getId();
		if (relation instanceof SupplyEntity e) return e.getId();
		if (relation instanceof EntryConductivityEntity e) return e.getId();
		if (relation instanceof EntryDistilledWaterEntity e) return e.getId();
		if (relation instanceof EntryOvenTempEntity e) return e.getId();
		if (relation instanceof EntryWeighingEntity e) return e.getId();
		if (relation instanceof EntryMaterialWashEntity e) return e.getId();
		if (relation instanceof EntrySolutionPrepEntity e) return e.getId();
		if (relation instanceof EntryDryingOvenEntity e) return e.getId();
		if (relation instanceof EntryAccuracyEntity e) return e.getId();
		if (relation instanceof EntryExpenseChartEntity e) return e.getId();
		if (relation instanceof EntryFlaskTreatmentEntity e) return e.getId();
		if (relation instanceof LaboratoryEquipmentEntity e) return e.getId();
		if (relation instanceof ReferenceParameterEntity e) return e.getId();
		return null;
	}
}
