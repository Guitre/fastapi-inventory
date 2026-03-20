import { useState, useEffect } from 'react'
import type { InventoryItem } from '@/types/inventory'

interface AdjustQuantityCardProps {
  items: InventoryItem[]
  submitting?: boolean
  onAdd: (name: string, quantity: number) => void
  onRemove: (id: number, quantity: number) => void
}

export default function AdjustQuantityCard({
  items,
  submitting,
  onAdd,
  onRemove,
}: AdjustQuantityCardProps) {
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState(1)
  const [errorMsg, setErrorMsg] = useState('')

  const selectedItem = items.find((i) => i.id === selectedId) ?? null

  useEffect(() => {
    if (items.length > 0 && !items.find((i) => i.id === selectedId)) {
      setSelectedId(items[0].id)
    }
  }, [items, selectedId])

  function handleAdd() {
    if (!selectedItem) return
    if (quantity < 1) {
      setErrorMsg('Quantidade deve ser pelo menos 1')
      return
    }
    setErrorMsg('')
    onAdd(selectedItem.name, quantity)
    setQuantity(1)
  }

  function handleRemove() {
    if (!selectedItem) return
    if (selectedItem.quantity === 0) return
    if (quantity < 1) {
      setErrorMsg('Quantidade deve ser pelo menos 1')
      return
    }
    setErrorMsg('')
    onRemove(selectedItem.id, quantity)
    setQuantity(1)
  }

  const noItems = items.length === 0
  const disabled = submitting || noItems || !selectedItem

  return (
    <div>
      <div className="flex items-center gap-2">
        <select
          disabled={submitting || noItems}
          value={selectedId}
          onChange={(e) => {
            setSelectedId(Number(e.target.value))
            setErrorMsg('')
          }}
          className="min-w-[180px] flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
            outline-none transition-colors focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15
            disabled:cursor-not-allowed disabled:bg-gray-100"
        >
          {noItems && <option value="">Nenhum item</option>}
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} (estoque: {item.quantity})
            </option>
          ))}
        </select>

        <input
          type="number"
          min={1}
          step={1}
          placeholder="Qtd"
          disabled={disabled}
          value={quantity}
          onChange={(e) => {
            setQuantity(Number(e.target.value))
            setErrorMsg('')
          }}
          className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none
            transition-colors focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15
            disabled:cursor-not-allowed disabled:bg-gray-100"
        />

        <div className="flex min-w-[6.5rem] justify-end gap-2">
          <button
            disabled={disabled || selectedItem?.quantity === 0}
            onClick={handleRemove}
            title="Remover quantidade"
            className="flex-1 rounded-md bg-red-500 py-2 text-sm font-bold text-white
              transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            -
          </button>
          <button
            disabled={disabled}
            onClick={handleAdd}
            title="Adicionar quantidade"
            className="flex-1 rounded-md bg-blue-500 py-2 text-sm font-bold text-white
              transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            +
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">
          {errorMsg}
        </div>
      )}
    </div>
  )
}
