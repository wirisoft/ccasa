import type { CrudResponseDTO } from '@/lib/ccasa/types'

const MAX_COLUMNS = 14

export function collectCrudColumns(rows: CrudResponseDTO[]): string[] {
  const keys = new Set<string>()

  for (const row of rows) {
    if (row.values && typeof row.values === 'object') {
      Object.keys(row.values).forEach(k => keys.add(k))
    }
  }

  return ['id', ...Array.from(keys).sort().slice(0, MAX_COLUMNS)]
}

export function formatCrudCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '—'
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}
