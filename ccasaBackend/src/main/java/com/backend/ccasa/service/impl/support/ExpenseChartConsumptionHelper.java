package com.backend.ccasa.service.impl.support;

import com.backend.ccasa.persistence.entities.ReagentJarEntity;
import com.backend.ccasa.persistence.entities.entry.EntryExpenseChartEntity;
import com.backend.ccasa.persistence.repositories.ReagentJarRepository;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

/**
 * RF-04: descuento de KCl en frasco al registrar carta de gastos.
 */
@Component
public class ExpenseChartConsumptionHelper {

	public void applyConsumptionOnCreate(EntryExpenseChartEntity e, ReagentJarRepository jarRepo) {
		if (e.getKclJar() == null || e.getKclUsedG() == null) {
			return;
		}
		if (e.getKclUsedG().compareTo(BigDecimal.ZERO) <= 0) {
			return;
		}
		ReagentJarEntity jar = jarRepo.findByIdAndDeletedAtIsNull(e.getKclJar().getId())
			.orElseThrow(() -> new IllegalArgumentException("Frasco de reactivo no encontrado"));
		subtractFromJar(jar, e.getKclUsedG(), jarRepo);
	}

	public void applyConsumptionOnUpdate(BigDecimal prevKcl, ReagentJarEntity prevJar, EntryExpenseChartEntity after, ReagentJarRepository jarRepo) {
		BigDecimal newKcl = after.getKclUsedG();
		ReagentJarEntity newJar = after.getKclJar();
		Long prevId = prevJar != null ? prevJar.getId() : null;
		Long newId = newJar != null ? newJar.getId() : null;
		boolean sameJar = prevId != null && newId != null && prevId.equals(newId);
		if (sameJar) {
			BigDecimal delta = nz(newKcl).subtract(nz(prevKcl));
			if (delta.compareTo(BigDecimal.ZERO) == 0) {
				return;
			}
			ReagentJarEntity jar = jarRepo.findByIdAndDeletedAtIsNull(newId)
				.orElseThrow(() -> new IllegalArgumentException("Frasco de reactivo no encontrado"));
			adjustJarByDelta(jar, delta, jarRepo);
			return;
		}
		if (prevJar != null && prevKcl != null && prevKcl.compareTo(BigDecimal.ZERO) > 0) {
			ReagentJarEntity j = jarRepo.findByIdAndDeletedAtIsNull(prevJar.getId())
				.orElseThrow(() -> new IllegalArgumentException("Frasco de reactivo no encontrado"));
			BigDecimal c = nz(j.getCurrentAmountG());
			j.setCurrentAmountG(c.add(prevKcl));
			jarRepo.save(j);
		}
		if (newJar != null && newKcl != null && newKcl.compareTo(BigDecimal.ZERO) > 0) {
			ReagentJarEntity j = jarRepo.findByIdAndDeletedAtIsNull(newJar.getId())
				.orElseThrow(() -> new IllegalArgumentException("Frasco de reactivo no encontrado"));
			subtractFromJar(j, newKcl, jarRepo);
		}
	}

	public void restoreConsumptionOnDelete(EntryExpenseChartEntity e, ReagentJarRepository jarRepo) {
		if (e.getKclJar() == null || e.getKclUsedG() == null) {
			return;
		}
		if (e.getKclUsedG().compareTo(BigDecimal.ZERO) <= 0) {
			return;
		}
		ReagentJarEntity jar = jarRepo.findByIdAndDeletedAtIsNull(e.getKclJar().getId())
			.orElseThrow(() -> new IllegalArgumentException("Frasco de reactivo no encontrado"));
		BigDecimal c = nz(jar.getCurrentAmountG());
		jar.setCurrentAmountG(c.add(e.getKclUsedG()));
		jarRepo.save(jar);
	}

	private void adjustJarByDelta(ReagentJarEntity jar, BigDecimal deltaConsumption, ReagentJarRepository jarRepo) {
		BigDecimal cur = nz(jar.getCurrentAmountG());
		if (deltaConsumption.compareTo(BigDecimal.ZERO) > 0) {
			if (cur.compareTo(deltaConsumption) < 0) {
				throw new IllegalArgumentException("Saldo insuficiente en el frasco de KCl");
			}
			jar.setCurrentAmountG(cur.subtract(deltaConsumption));
		} else {
			jar.setCurrentAmountG(cur.subtract(deltaConsumption));
		}
		jarRepo.save(jar);
	}

	private void subtractFromJar(ReagentJarEntity jar, BigDecimal amount, ReagentJarRepository jarRepo) {
		BigDecimal cur = nz(jar.getCurrentAmountG());
		if (cur.compareTo(amount) < 0) {
			throw new IllegalArgumentException("Saldo insuficiente en el frasco de KCl");
		}
		jar.setCurrentAmountG(cur.subtract(amount));
		jarRepo.save(jar);
	}

	private static BigDecimal nz(BigDecimal v) {
		return v != null ? v : BigDecimal.ZERO;
	}

	public static void validateNonNegativeAmounts(EntryExpenseChartEntity e) {
		if (e.getKclUsedG() != null && e.getKclUsedG().compareTo(BigDecimal.ZERO) < 0) {
			throw new IllegalArgumentException("kclUsedG no puede ser negativo");
		}
		if (e.getDistilledWaterQty() != null && e.getDistilledWaterQty().compareTo(BigDecimal.ZERO) < 0) {
			throw new IllegalArgumentException("distilledWaterQty no puede ser negativo");
		}
	}

}
