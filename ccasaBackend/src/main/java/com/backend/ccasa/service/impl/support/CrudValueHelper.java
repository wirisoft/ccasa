package com.backend.ccasa.service.impl.support;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public final class CrudValueHelper {

	private CrudValueHelper() {
	}

	public static String asString(Object raw) {
		return raw == null ? null : String.valueOf(raw);
	}

	public static Integer asInteger(Object raw) {
		if (raw == null) {
			return null;
		}
		if (raw instanceof Integer value) {
			return value;
		}
		return Integer.valueOf(String.valueOf(raw));
	}

	public static Long asLong(Object raw) {
		if (raw == null) {
			return null;
		}
		if (raw instanceof Long value) {
			return value;
		}
		return Long.valueOf(String.valueOf(raw));
	}

	public static Boolean asBoolean(Object raw) {
		if (raw == null) {
			return null;
		}
		if (raw instanceof Boolean value) {
			return value;
		}
		return Boolean.valueOf(String.valueOf(raw));
	}

	public static BigDecimal asBigDecimal(Object raw) {
		if (raw == null) {
			return null;
		}
		if (raw instanceof BigDecimal value) {
			return value;
		}
		return new BigDecimal(String.valueOf(raw));
	}

	public static Instant asInstant(Object raw) {
		if (raw == null) {
			return null;
		}
		if (raw instanceof Instant value) {
			return value;
		}
		return Instant.parse(String.valueOf(raw));
	}

	public static LocalDate asLocalDate(Object raw) {
		if (raw == null) {
			return null;
		}
		if (raw instanceof LocalDate value) {
			return value;
		}
		return LocalDate.parse(String.valueOf(raw));
	}

	public static LocalTime asLocalTime(Object raw) {
		if (raw == null) {
			return null;
		}
		if (raw instanceof LocalTime value) {
			return value;
		}
		return LocalTime.parse(String.valueOf(raw));
	}

	public static <E extends Enum<E>> E asEnum(Object raw, Class<E> enumType) {
		if (raw == null) {
			return null;
		}
		if (enumType.isInstance(raw)) {
			return enumType.cast(raw);
		}
		return Enum.valueOf(enumType, String.valueOf(raw));
	}
}
