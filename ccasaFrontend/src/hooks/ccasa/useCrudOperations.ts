'use client'

// React Imports
import { useCallback, useState } from 'react'

// Lib Imports
import { apiFetch } from '@/lib/ccasa/api'
import type { CrudRequestDTO } from '@/lib/ccasa/crudFields'
import type { CrudResponseDTO } from '@/lib/ccasa/types'

/** Quita barra final y asegura barra inicial (consistente con rutas del backend). */
function normalizeCrudPath(apiPath: string): string {
  const trimmed = apiPath.trim()

  const withLeading = trimmed.startsWith('/') ? trimmed : `/${trimmed}`

  return withLeading.replace(/\/$/, '')
}

function pathWithId(apiPath: string, id: number | string): string {
  return `${normalizeCrudPath(apiPath)}/${id}`
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message
  }

  return String(err)
}

export function useCrudOperations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const create = useCallback(
    async (apiPath: string, values: Record<string, unknown>): Promise<CrudResponseDTO | null> => {
      setError(null)
      setLoading(true)

      try {
        const body: CrudRequestDTO = { values }

        const res = await apiFetch<CrudResponseDTO>(normalizeCrudPath(apiPath), {
          method: 'POST',
          body: JSON.stringify(body)
        })

        return res
      } catch (e) {
        setError(errorMessage(e))

        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const update = useCallback(
    async (
      apiPath: string,
      id: number | string,
      values: Record<string, unknown>
    ): Promise<CrudResponseDTO | null> => {
      setError(null)
      setLoading(true)

      try {
        const body: CrudRequestDTO = { values }

        const res = await apiFetch<CrudResponseDTO>(pathWithId(apiPath, id), {
          method: 'PUT',
          body: JSON.stringify(body)
        })

        return res
      } catch (e) {
        setError(errorMessage(e))

        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const remove = useCallback(async (apiPath: string, id: number | string): Promise<boolean> => {
    setError(null)
    setLoading(true)

    try {
      await apiFetch<void>(pathWithId(apiPath, id), { method: 'DELETE' })

      return true
    } catch (e) {
      setError(errorMessage(e))

      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    create,
    update,
    remove,
    clearError
  }
}
