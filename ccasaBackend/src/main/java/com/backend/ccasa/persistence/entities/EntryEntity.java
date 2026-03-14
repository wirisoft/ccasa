package com.backend.ccasa.persistence.entities;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import com.backend.ccasa.services.models.enums.EntryStatusEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * Entrada genérica de bitácora (RNF-01: Draft → Signed → Locked).
 */
@Entity
@Table(name = "entry")
public class EntryEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "entry_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "folio_id", nullable = false)
	private FolioEntity folio;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "logbook_id", nullable = false)
	private LogbookEntity logbook;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private UserEntity user;

	@Column(name = "recorded_at")
	private Instant recordedAt;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 20)
	private EntryStatusEnum status = EntryStatusEnum.Draft;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public FolioEntity getFolio() { return folio; }
	public void setFolio(FolioEntity folio) { this.folio = folio; }
	public LogbookEntity getLogbook() { return logbook; }
	public void setLogbook(LogbookEntity logbook) { this.logbook = logbook; }
	public UserEntity getUser() { return user; }
	public void setUser(UserEntity user) { this.user = user; }
	public Instant getRecordedAt() { return recordedAt; }
	public void setRecordedAt(Instant recordedAt) { this.recordedAt = recordedAt; }
	public EntryStatusEnum getStatus() { return status; }
	public void setStatus(EntryStatusEnum status) { this.status = status; }
}
