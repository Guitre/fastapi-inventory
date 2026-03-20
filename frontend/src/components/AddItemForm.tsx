import { useState } from 'react'

interface AddItemFormProps {
  submitting?: boolean
  onSubmit: (name: string, quantity: number) => void
}

export default function AddItemForm({ submitting, onSubmit }: AddItemFormProps) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    if (!name.trim() || quantity < 1) return
    onSubmit(name.trim(), quantity)
    setName('')
    setQuantity(1)
  }

  return (
    <form className="flex items-center gap-2" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome do item"
        required
        disabled={submitting}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="min-w-[180px] flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm
          outline-none transition-colors focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15
          disabled:cursor-not-allowed disabled:bg-gray-100"
      />
      <input
        type="number"
        placeholder="Qtd"
        min={1}
        step={1}
        required
        disabled={submitting}
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none
          transition-colors focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15
          disabled:cursor-not-allowed disabled:bg-gray-100"
      />
      <button
        type="submit"
        disabled={submitting}
        className="min-w-[6.5rem] whitespace-nowrap rounded-md bg-blue-500 px-4 py-2 text-sm
          font-medium text-white transition-colors hover:bg-blue-600
          disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {submitting ? 'Adicionando...' : 'Adicionar'}
      </button>
    </form>
  )
}
