package com.backend.ccasa.persistence.entities;

import com.backend.ccasa.persistence.entities.audit.Auditable;
import com.backend.ccasa.service.models.enums.FolioStatusEnum;
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

@Entity
@Table(name = "folio")
public class FolioEntity extends Auditable {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "folio_id")
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "folio_block_id", nullable = false)
	private FolioBlockEntity folioBlock;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "logbook_id", nullable = false)
	private LogbookEntity logbook;

	@Column(name = "folio_number", nullable = false)
	private Integer folioNumber;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 20)
	private FolioStatusEnum status = FolioStatusEnum.Open;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public FolioBlockEntity getFolioBlock() { return folioBlock; }
	public void setFolioBlock(FolioBlockEntity folioBlock) { this.folioBlock = folioBlock; }
	public LogbookEntity getLogbook() { return logbook; }
	public void setLogbook(LogbookEntity logbook) { this.logbook = logbook; }
	public Integer getFolioNumber() { return folioNumber; }
	public void setFolioNumber(Integer folioNumber) { this.folioNumber = folioNumber; }
	public FolioStatusEnum getStatus() { return status; }
	public void setStatus(FolioStatusEnum status) { this.status = status; }
}

