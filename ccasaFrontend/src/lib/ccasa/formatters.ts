export function formatDateDdMmYyyy(isoString: string | null | undefined): string {
  if (!isoString) return '—'
  const d = new Date(isoString)

  if (Number.isNaN(d.getTime())) return '—'

  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  })
}
