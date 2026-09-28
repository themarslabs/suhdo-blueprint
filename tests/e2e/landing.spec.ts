import { expect, test } from "./fixtures"

test.beforeEach(async ({ page }) => {
  await page.goto("/")
})

test("explains the blueprint installation flow", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1, name: "Uma base de UI consistente, direto no seu código." })).toBeVisible()
  await expect(page.getByText("npx @suhdo/ui-blueprint@latest init", { exact: true }).first()).toBeVisible()
  await expect(page.getByRole("heading", { level: 2, name: "Do zero ao blueprint em três passos." })).toBeVisible()
  await expect(page.getByRole("heading", { level: 2, name: "Adapte sem perder seu trabalho." })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(2560)
})

test("opens the component showcase", async ({ page }) => {
  await page.getByRole("link", { name: "Explorar componentes" }).click()
  await expect(page).toHaveURL(/\/showcase$/)
  await expect(page.getByRole("heading", { level: 1, name: "UI Blueprint" })).toBeVisible()
})

test.describe("390px mobile", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test("keeps commands and content inside the viewport", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  })
})
