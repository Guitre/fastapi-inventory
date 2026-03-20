import { test, expect } from '@playwright/test'

const API = '/api/inventory'

async function cleanInventory(request: any) {
  const items = await (await request.get(API)).json()
  for (const item of items) {
    await request.delete(`${API}/${item.id}/permanent`)
  }
}

test.beforeEach(async ({ request }) => {
  await cleanInventory(request)
})

test.afterAll(async ({ request }) => {
  await cleanInventory(request)
})

test.describe('Inventory Page', () => {
  test('loads the page with correct title', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveText('Gerenciamento de Estoque')
  })

  test('shows empty inventory message', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Nenhum item no estoque')).toBeVisible()
  })
})

test.describe('Add Item', () => {
  test('adds a new item and shows success toast', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('h1')

    await page.getByPlaceholder('Nome do item').fill('Arroz')
    await page.getByPlaceholder('Qtd').first().fill('10')
    await page.getByRole('button', { name: 'Adicionar' }).click()

    await expect(page.getByText('"Arroz" adicionado (x10)')).toBeVisible()
    await expect(page.locator('table tbody tr')).toHaveCount(1)
  })

  test('upserts same item with different casing', async ({ page, request }) => {
    await request.post(API, { data: { name: 'Feijao', quantity: 5 } })
    await page.goto('/')
    await page.waitForSelector('h1')

    await page.getByPlaceholder('Nome do item').fill('FEIJAO')
    await page.getByPlaceholder('Qtd').first().fill('3')
    await page.getByRole('button', { name: 'Adicionar' }).click()

    await expect(page.getByText('"FEIJAO" adicionado (x3)')).toBeVisible()
    await page.waitForTimeout(500)
    await expect(page.locator('table tbody tr').first().locator('td').nth(1)).toContainText('8')
  })
})

test.describe('Remove Quantity', () => {
  test('removes quantity successfully', async ({ page, request }) => {
    await request.post(API, { data: { name: 'Leite', quantity: 10 } })
    await page.goto('/')
    await page.waitForSelector('h1')

    const adjustSection = page.locator('section').nth(1)
    await adjustSection.locator('input[type="number"]').fill('3')
    await adjustSection.getByRole('button', { name: '-' }).click()

    await expect(page.getByText('3 unidade(s) removida(s)')).toBeVisible()
  })

  test('shows pt-BR error toast when removing more than available', async ({
    page,
    request,
  }) => {
    await request.post(API, { data: { name: 'Manteiga', quantity: 3 } })
    await page.goto('/')
    await page.waitForSelector('h1')

    const adjustSection = page.locator('section').nth(1)
    await adjustSection.locator('input[type="number"]').fill('10')
    await adjustSection.getByRole('button', { name: '-' }).click()

    await expect(page.getByText('Estoque insuficiente')).toBeVisible({ timeout: 5000 })
    await page.waitForTimeout(500)
    await expect(page.locator('table tbody tr').first().locator('td').nth(1)).toContainText('0')
  })

  test('shows error toast on race condition (stock depleted after page load)', async ({
    page,
    request,
  }) => {
    const resp = await (
      await request.post(API, { data: { name: 'Vazio', quantity: 2 } })
    ).json()
    await page.goto('/')
    await page.waitForSelector('h1')

    await request.delete(`${API}/${resp.id}`, { data: { quantity: 2 } })

    const adjustSection = page.locator('section').nth(1)
    await adjustSection.locator('input[type="number"]').fill('1')
    await adjustSection.getByRole('button', { name: '-' }).click()

    await expect(page.getByText('Estoque insuficiente')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Sorting', () => {
  test('default sort is by name ascending', async ({ page, request }) => {
    await request.post(API, { data: { name: 'Zebra', quantity: 100 } })
    await request.post(API, { data: { name: 'Abacaxi', quantity: 2 } })
    await page.goto('/')
    await page.waitForSelector('table tbody tr')

    const rows = page.locator('table tbody tr')
    await expect(rows.first().locator('td').first()).toContainText('Abacaxi')
    await expect(rows.last().locator('td').first()).toContainText('Zebra')
  })
})

test.describe('Delete Item', () => {
  test('permanently deletes an item', async ({ page, request }) => {
    await request.post(API, { data: { name: 'Descartavel', quantity: 5 } })
    await page.goto('/')
    await page.waitForSelector('table tbody tr')

    await page.locator('button[title="Excluir item"]').first().click()
    await expect(page.getByText('Tem certeza')).toBeVisible()
    await page.getByRole('button', { name: 'Excluir', exact: true }).click()

    await expect(page.getByText('Item excluido com sucesso')).toBeVisible()
  })
})
