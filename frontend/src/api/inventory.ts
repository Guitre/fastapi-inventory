import axios from 'axios'
import type {
  InventoryItem,
  AddItemPayload,
  RemoveQuantityPayload,
  InventoryCreatedResponse,
  SortParams,
} from '@/types/inventory'

const http = axios.create({ baseURL: '/api/inventory' })

export const inventoryApi = {
  async list(params?: SortParams): Promise<InventoryItem[]> {
    const { data } = await http.get<InventoryItem[]>('/', { params })
    return data
  },

  async get(id: number): Promise<InventoryItem> {
    const { data } = await http.get<InventoryItem>(`/${id}`)
    return data
  },

  async add(payload: AddItemPayload): Promise<InventoryCreatedResponse> {
    const { data } = await http.post<InventoryCreatedResponse>('/', payload)
    return data
  },

  async remove(
    id: number,
    payload: RemoveQuantityPayload,
  ): Promise<{ id: number; quantity: number }> {
    const { data } = await http.delete<{ id: number; quantity: number }>(
      `/${id}`,
      { data: payload },
    )
    return data
  },

  async deleteItem(id: number): Promise<{ id: number; name: string }> {
    const { data } = await http.delete<{ id: number; name: string }>(
      `/${id}/permanent`,
    )
    return data
  },
}
