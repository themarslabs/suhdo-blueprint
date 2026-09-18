import { expect, test as base } from "@playwright/test"

export const test = base.extend<{ browserErrorGuard: void }>({
  browserErrorGuard: [
    async ({ page }, use) => {
      const errors: string[] = []

      page.on("console", (message) => {
        if (message.type() === "error") errors.push(`console.error: ${message.text()}`)
      })
      page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`))

      await use()
      expect(errors, "Unexpected browser errors").toEqual([])
    },
    { auto: true },
  ],
})

export { expect }
