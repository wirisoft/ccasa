package com.backend.ccasa.service.impl.support;

import com.backend.ccasa.persistence.entities.entry.EntrySolutionPrepEntity;
import com.backend.ccasa.persistence.entities.entry.EntryWeighingEntity;
import org.springframework.stereotype.Component;

/**
 * La pesada asociada debe pertenecer a la misma entrada que la preparación.
 */
@Component
public class SolutionPrepEntryComputation {

	public void apply(EntrySolutionPrepEntity e) {
		if (e.getWeighingEntry() == null || e.getEntry() == null) {
			return;
		}
		EntryWeighingEntity w = e.getWeighingEntry();
		if (!w.getEntry().getId().equals(e.getEntry().getId())) {
			throw new IllegalArgumentException("La pesada debe pertenecer a la misma entrada que la preparación de solución");
		}
	}
}
