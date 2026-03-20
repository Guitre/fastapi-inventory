export interface InventoryItem {
  id: number
  name: string
  normalized_name: string
  quantity: number
  created_at: string
  last_updated: string
}

export interface AddItemPayload {
  name: string
  quantity: number
}

export interface RemoveQuantityPayload {
  quantity: number
}

export interface InventoryCreatedResponse {
  id: number
  identifier: string
}

export interface SortParams {
  order_by?: 'name' | 'quantity' | 'last_updated'
  direction?: 'asc' | 'desc'
}
