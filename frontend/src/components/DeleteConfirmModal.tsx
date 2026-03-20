import { createPortal } from 'react-dom'
import type { InventoryItem } from '@/types/inventory'

interface DeleteConfirmModalProps {
  item: InventoryItem | null
  submitting?: boolean
  onConfirm: (id: number) => void
  onCancel: () => void
}

export default function DeleteConfirmModal({
  item,
  submitting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!item) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="w-full max-w-[400px] rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Excluir Item</h3>
        <p className="mb-5 text-sm text-gray-600">
          Tem certeza que deseja excluir <strong>{item.name}</strong>? Esta acao nao pode
          ser desfeita.
        </p>

        <div className="flex justify-end gap-2">
          <button
            disabled={submitting}
            onClick={onCancel}
            className="rounded-md bg-gray-100 px-4 py-2 text-xs font-medium text-gray-600
              transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            disabled={submitting}
            onClick={() => onConfirm(item.id)}
            className="rounded-md bg-red-500 px-4 py-2 text-xs font-medium text-white
              transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
