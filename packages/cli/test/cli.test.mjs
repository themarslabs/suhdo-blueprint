import assert from "node:assert/strict"
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { spawnSync } from "node:child_process"
import test from "node:test"
import { Client } from "@modelcontextprotocol/client"
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio"

const here = dirname(fileURLToPath(import.meta.url))
const cli = resolve(here, "../dist/index.js")

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "suhdo-cli-"))
  await mkdir(join(root, "src/app"), { recursive: true })
  await mkdir(join(root, "src/app/auth/callback"), { recursive: true })
  await writeFile(join(root, "package.json"), JSON.stringify({
    name: "fixture",
    dependencies: { next: "16.0.0", react: "19.2.0" },
    devDependencies: { tailwindcss: "^4.3.0", typescript: "^5.9.0" },
  }, null, 2))
  await writeFile(join(root, "tsconfig.json"), JSON.stringify({
    compilerOptions: { paths: { "@/*": ["./src/*"] } },
  }, null, 2))
  await writeFile(join(root, "src/app/globals.css"), '@import "tailwindcss";\n')
  await writeFile(join(root, "src/app/auth/callback/route.ts"), "// auth sentinel\n")
  return root
}

function run(root, ...args) {
  return spawnSync(process.execPath, [cli, ...args, "--cwd", root, "--yes", "--no-install"], {
    encoding: "utf8",
  })
}

test("reports the package version", async () => {
  const packageJson = JSON.parse(await readFile(resolve(here, "../package.json"), "utf8"))
  const result = spawnSync(process.execPath, [cli, "--version"], { encoding: "utf8" })

  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stdout.trim(), packageJson.version)
})

test("installs the UI blueprint idempotently", async () => {
  const root = await fixture()
  try {
    const first = run(root, "init")
    assert.equal(first.status, 0, first.stderr)
    assert.match(await readFile(join(root, "AGENTS.md"), "utf8"), /suhdo-ui-context/)
    assert.match(await readFile(join(root, "src/app/globals.css"), "utf8"), /styles\/suhdo\.css/)
    assert.match(await readFile(join(root, "src/components/ui/button.tsx"), "utf8"), /buttonVariants/)
    assert.match(await readFile(join(root, "src/components/files/file-picker-dialog.tsx"), "utf8"), /FilePickerDialog/)
    assert.match(await readFile(join(root, "src/components/app/analytics-chart.tsx"), "utf8"), /TimeSeriesChart/)
    assert.match(await readFile(join(root, "docs/suhdo-ui.md"), "utf8"), /Contrato de UI Suhdo/)
    assert.match(await readFile(join(root, "docs/suhdo-ui.md"), "utf8"), /Decisão para agentes e MCP/)
    assert.equal(await readFile(join(root, "src/app/auth/callback/route.ts"), "utf8"), "// auth sentinel\n")

    const agentsBefore = await readFile(join(root, "AGENTS.md"), "utf8")
    const second = run(root, "init")
    assert.equal(second.status, 0, second.stderr)
    assert.equal(await readFile(join(root, "AGENTS.md"), "utf8"), agentsBefore)
    assert.equal((await readFile(join(root, "src/app/globals.css"), "utf8")).match(/suhdo-ui/g)?.length, 1)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("preserves customized files unless force is explicit", async () => {
  const root = await fixture()
  try {
    assert.equal(run(root, "init").status, 0)
    const button = join(root, "src/components/ui/button.tsx")
    await writeFile(button, "// custom button\n")

    const safeRun = run(root, "init")
    assert.equal(safeRun.status, 0, safeRun.stderr)
    assert.equal(await readFile(button, "utf8"), "// custom button\n")
    assert.match(safeRun.stdout, /customizado/)

    const forced = run(root, "init", "--force")
    assert.equal(forced.status, 0, forced.stderr)
    assert.match(await readFile(button, "utf8"), /buttonVariants/)
    assert.equal(await readFile(`${button}.bak`, "utf8"), "// custom button\n")
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("context mode works without React", async () => {
  const root = await mkdtemp(join(tmpdir(), "suhdo-context-"))
  try {
    await writeFile(join(root, "package.json"), '{"name":"api"}\n')
    const result = run(root, "context")
    assert.equal(result.status, 0, result.stderr)
    assert.match(await readFile(join(root, "docs/suhdo-ui.md"), "utf8"), /Limites de arquitetura/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test("serves the bundled contract and catalog over MCP stdio", async () => {
  const root = await mkdtemp(join(tmpdir(), "suhdo-mcp-"))
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [cli, "mcp"],
    cwd: root,
    stderr: "pipe",
  })
  const client = new Client({ name: "suhdo-cli-test", version: "1.0.0" })

  try {
    await client.connect(transport)
    assert.deepEqual(Object.keys(client.getServerCapabilities() ?? {}).sort(), ["prompts", "resources"])

    const { resources } = await client.listResources()
    assert.deepEqual(resources.map((resource) => resource.uri).sort(), [
      "suhdo://ui/catalog.json",
      "suhdo://ui/docs/suhdo-ui.md",
    ])

    const contractResult = await client.readResource({ uri: "suhdo://ui/docs/suhdo-ui.md" })
    const contractContent = contractResult.contents[0]
    assert.ok(contractContent && "text" in contractContent)
    assert.equal(contractContent.text, await readFile(resolve(here, "../blueprint/docs/suhdo-ui.md"), "utf8"))

    const catalogResult = await client.readResource({ uri: "suhdo://ui/catalog.json" })
    const catalogContent = catalogResult.contents[0]
    assert.ok(catalogContent && "text" in catalogContent)
    const catalog = JSON.parse(catalogContent.text)
    assert.equal(catalog.name, "Suhdo UI Blueprint")
    for (const group of catalog.modules) {
      for (const module of group.modules) {
        await readFile(resolve(here, "../blueprint", module.path), "utf8")
      }
    }

    const { prompts } = await client.listPrompts()
    assert.deepEqual(prompts.map((prompt) => prompt.name).sort(), ["implement-suhdo-ui", "review-suhdo-ui"])
    const prompt = await client.getPrompt({ name: "implement-suhdo-ui" })
    assert.equal(prompt.messages.length, 3)
    assert.equal(prompt.messages[0].content.type, "resource")
  } finally {
    await client.close()
    await rm(root, { recursive: true, force: true })
  }
})
