import { useState } from 'react'
import type { InventoryItem, SortParams } from '@/types/inventory'

interface InventoryTableProps {
  items: InventoryItem[]
  loading: boolean
  onSort: (params: SortParams) => void
  onDelete: (item: InventoryItem) => void
}

type SortField = 'name' | 'quantity' | 'last_updated'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function SortIndicator({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) {
  if (!active) return <span className="ml-1 text-gray-300">&#x25B4;&#x25BE;</span>
  return (
    <span className="ml-1">
      {direction === 'asc' ? '\u25B4' : '\u25BE'}
    </span>
  )
}

export default function InventoryTable({ items, loading, onSort, onDelete }: InventoryTableProps) {
  const [activeField, setActiveField] = useState<SortField>('name')
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc')

  function handleHeaderClick(field: SortField) {
    let newDir: 'asc' | 'desc'
    if (activeField === field) {
      newDir = direction === 'asc' ? 'desc' : 'asc'
    } else {
      newDir = 'asc'
    }
    setActiveField(field)
    setDirection(newDir)
    onSort({ order_by: field, direction: newDir })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
        Carregando...
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        Nenhum item no estoque
      </div>
    )
  }

  const thBase =
    'cursor-pointer select-none border-b border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-600 transition-colors hover:bg-gray-100'

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            <th className={`${thBase} w-[40%] text-left`} onClick={() => handleHeaderClick('name')}>
              Nome
              <SortIndicator active={activeField === 'name'} direction={direction} />
            </th>
            <th className={`${thBase} w-[15%] text-center`} onClick={() => handleHeaderClick('quantity')}>
              Quantidade
              <SortIndicator active={activeField === 'quantity'} direction={direction} />
            </th>
            <th className={`${thBase} w-[30%] text-left`} onClick={() => handleHeaderClick('last_updated')}>
              Atualizado
              <SortIndicator active={activeField === 'last_updated'} direction={direction} />
            </th>
            <th className={`${thBase} w-[15%] cursor-default text-center hover:bg-gray-50`}>
              Acoes
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-100">
              <td className="truncate border-b border-gray-200 px-3 py-2.5 text-sm">
                {item.name}
              </td>
              <td className="border-b border-gray-200 px-3 py-2.5 text-center text-sm">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    item.quantity < 5
                      ? 'bg-red-50 text-red-800'
                      : 'bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {item.quantity}
                </span>
              </td>
              <td className="whitespace-nowrap border-b border-gray-200 px-3 py-2.5 text-sm text-gray-500">
                {formatDate(item.last_updated)}
              </td>
              <td className="border-b border-gray-200 px-3 py-2.5 text-center">
                <button
                  onClick={() => onDelete(item)}
                  title="Excluir item"
                  className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-400
                    transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
