import { useState, useCallback } from 'react'
import axios from 'axios'
import { inventoryApi } from '@/api/inventory'
import type { InventoryItem, SortParams } from '@/types/inventory'

function extractErrorMessage(e: unknown, fallback: string): string {
  if (axios.isAxiosError(e) && e.response?.data?.detail) {
    return String(e.response.data.detail)
  }
  if (e instanceof Error) return e.message
  return fallback
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async (sort?: SortParams) => {
    setLoading(true)
    setError(null)
    try {
      setItems(await inventoryApi.list(sort))
    } catch (e: unknown) {
      setError(extractErrorMessage(e, 'Falha ao buscar itens'))
    } finally {
      setLoading(false)
    }
  }, [])

  const addItem = useCallback(async (name: string, quantity: number) => {
    setError(null)
    try {
      await inventoryApi.add({ name, quantity })
    } catch (e: unknown) {
      setError(extractErrorMessage(e, 'Falha ao adicionar item'))
      throw e
    }
  }, [])

  const removeQuantity = useCallback(async (id: number, quantity: number) => {
    setError(null)
    try {
      await inventoryApi.remove(id, { quantity })
    } catch (e: unknown) {
      setError(extractErrorMessage(e, 'Falha ao remover quantidade'))
      throw e
    }
  }, [])

  const deleteItem = useCallback(async (id: number) => {
    setError(null)
    try {
      await inventoryApi.deleteItem(id)
    } catch (e: unknown) {
      setError(extractErrorMessage(e, 'Falha ao excluir item'))
      throw e
    }
  }, [])

  return { items, loading, error, fetchItems, addItem, removeQuantity, deleteItem }
}
