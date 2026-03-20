import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { useInventory } from '@/hooks/useInventory'
import type { InventoryItem, SortParams } from '@/types/inventory'
import AddItemForm from '@/components/AddItemForm'
import InventoryTable from '@/components/InventoryTable'
import AdjustQuantityCard from '@/components/AdjustQuantityModal'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'

interface Toast {
  message: string
  type: 'success' | 'error'
}

export default function App() {
  const { items, loading, error, fetchItems, addItem, removeQuantity, deleteItem } = useInventory()

  const [currentSort, setCurrentSort] = useState<SortParams>({ order_by: 'name', direction: 'asc' })
  const [activeSubmit, setActiveSubmit] = useState<'add' | 'adjust' | 'delete' | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null)

  const submitting = activeSubmit !== null

  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const currentSortRef = useRef(currentSort)
  currentSortRef.current = currentSort

  function errorMessage(e: unknown, fallback: string): string {
    if (axios.isAxiosError(e) && e.response?.data?.detail) {
      return String(e.response.data.detail)
    }
    if (e instanceof Error) return e.message
    return fallback
  }

  const showToast = useCallback((message: string, type: Toast['type'] = 'success', durationMs = 3000) => {
    setToast({ message, type })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), durationMs)
  }, [])

  useEffect(() => {
    fetchItems({ order_by: 'name', direction: 'asc' })
  }, [fetchItems])

  async function handleAdd(name: string, quantity: number) {
    if (submitting) return
    setActiveSubmit('add')
    try {
      await addItem(name, quantity)
      showToast(`"${name}" adicionado (x${quantity})`)
      await fetchItems(currentSortRef.current)
    } catch (e) {
      showToast(errorMessage(e, 'Falha ao adicionar item'), 'error')
    } finally {
      setActiveSubmit(null)
    }
  }

  function handleSort(params: SortParams) {
    setCurrentSort(params)
    fetchItems(params)
  }

  async function handleAdjustAdd(name: string, quantity: number) {
    if (submitting) return
    setActiveSubmit('adjust')
    try {
      await addItem(name, quantity)
      showToast(`"${name}" +${quantity} unidade(s)`)
      await fetchItems(currentSortRef.current)
    } catch (e) {
      showToast(errorMessage(e, 'Falha ao adicionar quantidade'), 'error')
    } finally {
      setActiveSubmit(null)
    }
  }

  async function handleAdjustRemove(id: number, quantity: number) {
    if (submitting) return
    setActiveSubmit('adjust')
    try {
      await removeQuantity(id, quantity)
      showToast(`${quantity} unidade(s) removida(s)`)
      await fetchItems(currentSortRef.current)
    } catch (e) {
      showToast(errorMessage(e, 'Falha ao remover quantidade'), 'error', 4000)
      await fetchItems(currentSortRef.current)
    } finally {
      setActiveSubmit(null)
    }
  }

  async function handleDelete(id: number) {
    if (submitting) return
    setActiveSubmit('delete')
    try {
      await deleteItem(id)
      setDeleteTarget(null)
      showToast('Item excluido com sucesso')
      await fetchItems(currentSortRef.current)
    } catch (e) {
      showToast(errorMessage(e, 'Falha ao excluir item'), 'error')
    } finally {
      setActiveSubmit(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-[2000] rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg
            transition-all duration-300 ${
              toast.type === 'success'
                ? 'border border-emerald-300 bg-emerald-50 text-emerald-800'
                : 'border border-red-300 bg-red-50 text-red-800'
            }`}
        >
          {toast.message}
        </div>
      )}

      <header className="border-b border-gray-200 bg-white py-4 text-center">
        <h1 className="text-xl font-bold">Gerenciamento de Estoque</h1>
      </header>

      <main className="mx-auto flex max-w-[900px] flex-col gap-4 p-4">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-600">Adicionar Item</h2>
          <AddItemForm submitting={activeSubmit === 'add'} onSubmit={handleAdd} />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-600">Ajustar Estoque</h2>
          <AdjustQuantityCard
            items={items}
            submitting={activeSubmit === 'adjust'}
            onAdd={handleAdjustAdd}
            onRemove={handleAdjustRemove}
          />
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold text-gray-600">Estoque</h2>

          {error && !loading && (
            <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">
              {error}
            </div>
          )}

          <InventoryTable
            items={items}
            loading={loading}
            onSort={handleSort}
            onDelete={(item) => setDeleteTarget(item)}
          />
        </section>
      </main>

      <DeleteConfirmModal
        item={deleteTarget}
        submitting={activeSubmit === 'delete'}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
