import { expect, test } from "./fixtures"

test.beforeEach(async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1, name: "Uma linguagem para todos os produtos Suhdo" })).toBeVisible()
})

test("uses the full desktop work area", async ({ page }) => {
  const layout = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
  }))
  expect(layout.viewportWidth).toBe(2560)
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth)

  const main = page.getByRole("main")
  const workspaces = page.getByRole("region", { name: "Workspaces" })
  const [mainBox, workspacesBox] = await Promise.all([main.boundingBox(), workspaces.boundingBox()])
  if (!mainBox || !workspacesBox) throw new Error("Expected main and workspace layout boxes")

  expect(workspacesBox.width / mainBox.width).toBeGreaterThan(0.95)
  await expect(workspaces.getByRole("table", { name: "Workspaces" })).toBeVisible()
  await expect(workspaces.getByRole("row")).toHaveCount(6)
  await expect(workspaces.getByRole("article")).toHaveCount(0)
  await expect(workspaces.getByRole("button", { name: "Tabela" })).toHaveAttribute("aria-pressed", "true")
})

test("switches organization, workspace and language", async ({ page }) => {
  await page.getByRole("button", { name: "Organizacao ativa: Suhdo Labs" }).click()
  await page.getByRole("menuitem", { name: /3AS Tecnologia/ }).click()
  await expect(page.getByRole("button", { name: "Organizacao ativa: 3AS Tecnologia" })).toBeVisible()

  await page.getByRole("button", { name: "Workspace ativo: Hydrogen" }).click()
  await expect(page.getByRole("menu")).toContainText("Workspaces de 3AS Tecnologia")
  await page.getByRole("menuitem", { name: /Krona/ }).click()
  await expect(page.getByRole("button", { name: "Workspace ativo: Krona" })).toBeVisible()

  await page.getByRole("button", { name: "Idioma: Portugues" }).click()
  await page.getByRole("menuitem", { name: /English/ }).click()
  await expect(page.getByRole("button", { name: "Idioma: English" })).toBeVisible()
})

test("opens and closes the global confirmation", async ({ page }) => {
  await page.getByRole("button", { name: "Confirmacao global" }).click()
  const dialog = page.getByRole("dialog", { name: "Descartar alteracoes?" })
  await expect(dialog).toContainText("Esta acao fecha o editor e remove os dados ainda nao salvos.")
  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
})

test("selects a file, reviews details and confirms the collection", async ({ page }) => {
  await page.getByRole("button", { name: "Biblioteca", exact: true }).click()
  const picker = page.getByRole("dialog", { name: "Biblioteca de arquivos" })
  await expect(picker.getByRole("tab", { name: "Biblioteca", exact: true })).toHaveAttribute("aria-selected", "true")

  const asset = picker.getByRole("button", { name: "produto-capa.svg", exact: true })
  await expect(asset).toHaveAttribute("aria-pressed", "false")
  await asset.click()
  await expect(asset).toHaveAttribute("aria-pressed", "true")
  await expect(picker.getByText("1 selecionado", { exact: true })).toBeVisible()

  await picker.getByRole("button", { name: "Revisar", exact: true }).click()
  await expect(picker.getByRole("tab", { name: "Colecao (1)" })).toHaveAttribute("aria-selected", "true")
  await picker.getByRole("button", { name: "produto-capa.svg", exact: true }).click()

  const details = page.getByRole("dialog", { name: "Detalhes do arquivo" })
  await expect(details.getByText("produto-capa.svg", { exact: true })).toBeVisible()
  await expect(details.getByText("image/svg+xml", { exact: true })).toBeVisible()
  await expect(details.getByText("80 KB", { exact: true })).toBeVisible()
  await expect(details.getByText("1600 x 900 px", { exact: true })).toBeVisible()
  await expect(details).toContainText("Interface do produto Hydrogen")
  await details.getByRole("button", { name: "Fechar" }).click()
  await expect(details).toBeHidden()

  await picker.getByRole("button", { name: "Adicionar", exact: true }).click()
  await expect(picker).toBeHidden()
  await expect(page.getByRole("button", { name: "Biblioteca (1)" })).toBeVisible()
})

test.describe("375px mobile", () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true })

  test("uses cards without horizontal overflow", async ({ page }) => {
    expect(await page.evaluate(() => window.innerWidth)).toBe(375)
    const workspaces = page.getByRole("region", { name: "Workspaces" })
    await expect(workspaces.getByRole("table", { name: "Workspaces" })).toHaveCount(0)
    await expect(workspaces.getByRole("article")).toHaveCount(5)
    await expect(workspaces.getByRole("article", { name: "Hydrogen" })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)
  })
})
