#!/usr/bin/env node

import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import { cp, mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises"
import { dirname, extname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { spawnSync } from "node:child_process"
import { createInterface } from "node:readline/promises"
import { stdin, stdout } from "node:process"

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const VERSION = JSON.parse(readFileSync(join(PACKAGE_ROOT, "package.json"), "utf8")).version as string
const CONFIG_FILE = "suhdo.config.json"
const CONTEXT_MARKER = "<!-- suhdo-ui-context -->"
const CSS_MARKER = "/* suhdo-ui */"
const DEPENDENCIES: Record<string, string> = {
  "class-variance-authority": "^0.7.1",
  clsx: "^2.1.1",
  "lucide-react": "^0.562.0",
  "radix-ui": "^1.6.7",
  recharts: "^3.10.1",
  "tailwind-merge": "^3.4.0",
}

type Command = "init" | "context" | "doctor" | "mcp"
type Options = {
  command: Command
  cwd: string
  dryRun: boolean
  force: boolean
  install: boolean
  yes: boolean
}
type PackageJson = {
  name?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}
type Project = {
  root: string
  packageJson: PackageJson
  packageJsonPath: string
  sourceRoot: string
  cssFile: string | null
  hasAlias: boolean
  react: boolean
  tailwind4: boolean
  typescript: boolean
  framework: string
  packageManager: "npm" | "pnpm" | "yarn" | "bun"
}
type BlueprintConfig = {
  $schema: string
  version: string
  source: string
  files: Record<string, string>
}
type PlannedFile = {
  path: string
  content: string
  status: "create" | "update" | "unchanged" | "conflict"
}

const color = process.stdout.isTTY && !process.env.NO_COLOR
const green = (value: string) => color ? `\x1b[32m${value}\x1b[0m` : value
const yellow = (value: string) => color ? `\x1b[33m${value}\x1b[0m` : value
const cyan = (value: string) => color ? `\x1b[36m${value}\x1b[0m` : value
const bold = (value: string) => color ? `\x1b[1m${value}\x1b[0m` : value
const dim = (value: string) => color ? `\x1b[2m${value}\x1b[0m` : value

function help() {
  console.log(`
${bold("suhdo")} - instala as bases e o contexto da UI Suhdo

${bold("Uso")}
  npx @suhdo/ui-blueprint [init] [opcoes]
  npx @suhdo/ui-blueprint context [opcoes]
  npx @suhdo/ui-blueprint doctor [opcoes]
  npx @suhdo/ui-blueprint mcp

${bold("Comandos")}
  init       Copia tema, componentes e contexto (padrao)
  context    Instala somente docs e instrucoes para agentes
  doctor     Verifica se o projeto esta pronto para o blueprint
  mcp        Serve o contrato e o catalogo Suhdo UI via MCP stdio

${bold("Opcoes")}
  --cwd <dir>      Executa em outro diretorio
  --dry-run        Exibe o plano sem escrever ou instalar
  --force, -f      Sobrescreve customizacoes e salva <arquivo>.bak
  --no-install     Nao instala dependencias ausentes
  --yes, -y        Confirma sem interacao
  --version, -v    Exibe a versao
  --help, -h       Exibe esta ajuda

O CLI nunca altera auth, middleware, sessao ou arquivos .env do 3AS.
`)
}

function parseArgs(args: string[]): Options | null {
  if (args.includes("--help") || args.includes("-h")) {
    help()
    return null
  }
  if (args.includes("--version") || args.includes("-v")) {
    console.log(VERSION)
    return null
  }

  let command: Command = "init"
  let cwd = process.cwd()
  let dryRun = false
  let force = false
  let install = true
  let yes = false

  for (let index = 0; index < args.length; index++) {
    const argument = args[index]
    if (argument === "init" || argument === "context" || argument === "doctor" || argument === "mcp") command = argument
    else if (argument === "--dry-run") dryRun = true
    else if (argument === "--force" || argument === "-f") force = true
    else if (argument === "--no-install") install = false
    else if (argument === "--yes" || argument === "-y") yes = true
    else if (argument === "--cwd") {
      const value = args[++index]
      if (!value) throw new Error("--cwd exige um diretorio")
      cwd = resolve(value)
    } else if (argument.startsWith("--cwd=")) cwd = resolve(argument.slice(6))
    else throw new Error(`Argumento desconhecido: ${argument}`)
  }

  return { command, cwd, dryRun, force, install, yes }
}

function major(version: string | undefined): number | null {
  const match = version?.match(/(\d+)/)
  return match ? Number(match[1]) : null
}

function aliasTargetsSource(tsconfig: string, sourceRoot: string) {
  const match = tsconfig.match(/["']@\/\*["']\s*:\s*\[([\s\S]*?)\]/)
  if (!match) return false
  const expected = sourceRoot ? `${sourceRoot}/\\*` : "\\*"
  return new RegExp(`["'](?:\\./)?${expected}["']`).test(match[1])
}

function detectProject(root: string): Project {
  const packageJsonPath = join(root, "package.json")
  if (!existsSync(packageJsonPath)) throw new Error(`package.json nao encontrado em ${root}`)

  let packageJson: PackageJson
  try {
    packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as PackageJson
  } catch {
    throw new Error("package.json nao pode ser lido")
  }

  const dependencies = { ...packageJson.devDependencies, ...packageJson.dependencies }
  const sourceRoot = existsSync(join(root, "src")) ? "src" : ""
  const cssCandidates = [
    join(sourceRoot, "app/globals.css"),
    join(sourceRoot, "styles/globals.css"),
    join(sourceRoot, "index.css"),
    join(sourceRoot, "main.css"),
  ]
  const tsconfigPath = existsSync(join(root, "tsconfig.json")) ? join(root, "tsconfig.json") : null
  const tsconfig = tsconfigPath ? readFileSync(tsconfigPath, "utf8") : ""
  const framework = dependencies.next ? "Next.js" : dependencies.vite ? "React + Vite" : dependencies.react ? "React" : "desconhecido"
  const packageManager = existsSync(join(root, "pnpm-lock.yaml"))
    ? "pnpm"
    : existsSync(join(root, "yarn.lock"))
      ? "yarn"
      : existsSync(join(root, "bun.lockb")) || existsSync(join(root, "bun.lock"))
        ? "bun"
        : "npm"

  return {
    root,
    packageJson,
    packageJsonPath,
    sourceRoot,
    cssFile: cssCandidates.find((candidate) => existsSync(join(root, candidate))) ?? null,
    hasAlias: aliasTargetsSource(tsconfig, sourceRoot),
    react: Boolean(dependencies.react),
    tailwind4: major(dependencies.tailwindcss) === 4,
    typescript: Boolean(tsconfigPath || dependencies.typescript),
    framework,
    packageManager,
  }
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

async function walk(root: string, current = ""): Promise<string[]> {
  const entries = await readdir(join(root, current), { withFileTypes: true })
  const paths: string[] = []
  for (const entry of entries) {
    const next = join(current, entry.name)
    if (entry.isDirectory()) paths.push(...await walk(root, next))
    else paths.push(next)
  }
  return paths
}

function toPosix(value: string) {
  return value.split(sep).join("/")
}

function sourceDestination(project: Project, templatePath: string) {
  if (templatePath === "docs/suhdo-ui.md") return templatePath
  return toPosix(join(project.sourceRoot, templatePath))
}

function rewriteAliases(content: string, destination: string, project: Project) {
  if (project.hasAlias) return content
  return content.replace(/from (["'])@\/([^"']+)\1/g, (_match, quote: string, importedPath: string) => {
    const absoluteTarget = join(project.sourceRoot, importedPath)
    let path = toPosix(relative(dirname(destination), absoluteTarget))
    if (!path.startsWith(".")) path = `./${path}`
    return `from ${quote}${path}${quote}`
  })
}

function readConfig(root: string): BlueprintConfig | null {
  try {
    return JSON.parse(readFileSync(join(root, CONFIG_FILE), "utf8")) as BlueprintConfig
  } catch {
    return null
  }
}

function planFile(root: string, path: string, content: string, previousHash: string | undefined, force: boolean): PlannedFile {
  const absolutePath = join(root, path)
  if (!existsSync(absolutePath)) return { path, content, status: "create" }
  const current = readFileSync(absolutePath, "utf8")
  if (current === content) return { path, content, status: "unchanged" }
  if (force || (previousHash && sha256(current) === previousHash)) return { path, content, status: "update" }
  return { path, content, status: "conflict" }
}

function planAdditiveFile(root: string, path: string, content: string): PlannedFile {
  return {
    path,
    content,
    status: existsSync(join(root, path)) ? "update" : "create",
  }
}

function agentContextPath(root: string) {
  const candidates = ["AGENTS.md", "CLAUDE.md", ".cursorrules", ".github/copilot-instructions.md"]
  return candidates.find((candidate) => existsSync(join(root, candidate))) ?? "AGENTS.md"
}

function agentContextContent(existing: string) {
  if (existing.includes(CONTEXT_MARKER)) return existing
  const block = `${CONTEXT_MARKER}
## Suhdo UI

Antes de implementar ou revisar interfaces, leia \`docs/suhdo-ui.md\`, incluindo a seção "Decisão para agentes e MCP". Esse contrato define tokens, componentes, temas, responsividade e acessibilidade dos produtos Suhdo. Reutilize os arquivos em \`components/ui\`, \`components/app\` e \`components/files\`; nao crie uma linguagem visual paralela. O contexto de UI nao autoriza alterar auth, middleware, sessao ou cookies do 3AS.
`
  return `${existing.trimEnd()}${existing.trim() ? "\n\n" : ""}${block}`
}

function cssWithImport(existing: string, cssFile: string, styleFile: string) {
  if (existing.includes(CSS_MARKER) || existing.includes("styles/suhdo.css")) return existing
  let importPath = toPosix(relative(dirname(cssFile), styleFile))
  if (!importPath.startsWith(".")) importPath = `./${importPath}`
  const statement = `\n${CSS_MARKER}\n@import "${importPath}";`
  const imports = [...existing.matchAll(/@import\s+[^;]+;/g)]
  if (!imports.length) return `${statement.trimStart()}\n${existing}`
  const last = imports.at(-1)!
  const index = last.index! + last[0].length
  return `${existing.slice(0, index)}${statement}${existing.slice(index)}`
}

function missingDependencies(project: Project) {
  const installed = { ...project.packageJson.devDependencies, ...project.packageJson.dependencies }
  return Object.entries(DEPENDENCIES).filter(([name]) => !installed[name])
}

function printDoctor(project: Project) {
  const checks = [
    ["React", project.react, project.framework],
    ["TypeScript", project.typescript, project.typescript ? "detectado" : "necessario para os componentes"],
    ["Tailwind CSS 4", project.tailwind4, project.tailwind4 ? "detectado" : "necessario para os tokens"],
    ["CSS global", Boolean(project.cssFile), project.cssFile ?? "nao encontrado"],
  ] as const

  console.log(`\n${bold("Suhdo UI doctor")}\n`)
  for (const [label, ok, detail] of checks) console.log(`  ${ok ? green("OK") : yellow("!!")}  ${label}: ${detail}`)
  const missing = missingDependencies(project)
  console.log(`  ${missing.length ? yellow("!!") : green("OK")}  Dependencias: ${missing.length ? `${missing.length} ausentes` : "completas"}`)
  console.log("")
  if (!project.react || !project.typescript || !project.tailwind4) process.exitCode = 1
}

async function confirm(message: string, yes: boolean) {
  if (yes) return true
  if (!stdin.isTTY || !stdout.isTTY) throw new Error("Use --yes para execucao nao interativa")
  const readline = createInterface({ input: stdin, output: stdout })
  const answer = await readline.question(`${message} (Y/n): `)
  readline.close()
  return answer.trim().toLocaleLowerCase() !== "n"
}

async function installDependencies(project: Project, dependencies: [string, string][]) {
  if (!dependencies.length) return
  const specs = dependencies.map(([name, version]) => `${name}@${version}`)
  const command = project.packageManager
  const args = command === "npm" ? ["install", ...specs] : ["add", ...specs]
  console.log(`\n${dim(`Executando ${command} ${args.join(" ")}...`)}`)
  const result = spawnSync(command, args, { cwd: project.root, stdio: "inherit" })
  if (result.error || result.status !== 0) {
    throw new Error(`Falha ao instalar dependencias. Execute manualmente: ${command} ${args.join(" ")}`)
  }
}

async function backupAndWrite(root: string, file: PlannedFile, force: boolean) {
  const absolutePath = join(root, file.path)
  await mkdir(dirname(absolutePath), { recursive: true })
  if (file.status === "update" && force && existsSync(absolutePath)) await cp(absolutePath, `${absolutePath}.bak`)
  await writeFile(absolutePath, file.content)
}

async function run(options: Options) {
  if (options.command === "mcp") {
    const { runMcpServer } = await import("./mcp.js")
    await runMcpServer(VERSION)
    return
  }

  const project = detectProject(options.cwd)
  if (options.command === "doctor") {
    printDoctor(project)
    return
  }

  if (options.command === "init" && (!project.react || !project.typescript || !project.tailwind4)) {
    printDoctor(project)
    throw new Error("O init requer React, TypeScript e Tailwind CSS 4. Use `suhdo context` para instalar somente o contrato.")
  }

  const blueprintRoot = join(PACKAGE_ROOT, "blueprint")
  const config = readConfig(project.root)
  const templatePaths = await walk(blueprintRoot)
  const selectedPaths = templatePaths.filter((path) => options.command === "init" || path === "docs/suhdo-ui.md")
  const planned: PlannedFile[] = []

  for (const templatePath of selectedPaths) {
    const destination = sourceDestination(project, templatePath)
    const raw = await readFile(join(blueprintRoot, templatePath), "utf8")
    const content = rewriteAliases(raw, destination, project)
    planned.push(planFile(project.root, destination, content, config?.files[destination], options.force))
  }

  const agentPath = agentContextPath(project.root)
  const agentExisting = existsSync(join(project.root, agentPath)) ? readFileSync(join(project.root, agentPath), "utf8") : ""
  const agentContent = agentContextContent(agentExisting)
  if (agentContent !== agentExisting) planned.push(planAdditiveFile(project.root, agentPath, agentContent))

  if (options.command === "init" && project.cssFile) {
    const existing = readFileSync(join(project.root, project.cssFile), "utf8")
    const styleFile = sourceDestination(project, "styles/suhdo.css")
    const content = cssWithImport(existing, project.cssFile, styleFile)
    if (content !== existing) planned.push(planAdditiveFile(project.root, project.cssFile, content))
  }

  const dependencies = options.command === "init" ? missingDependencies(project) : []
  const actionable = planned.filter((file) => file.status === "create" || file.status === "update")
  const conflicts = planned.filter((file) => file.status === "conflict")

  console.log(`\n${bold("Suhdo UI Blueprint")} ${dim(`v${VERSION}`)}`)
  console.log(`${dim(`${project.framework} | ${project.sourceRoot || "."} | ${project.packageManager}`)}\n`)
  for (const file of planned) {
    const symbol = file.status === "create" ? green("+") : file.status === "update" ? cyan("~") : file.status === "conflict" ? yellow("!") : dim("=")
    console.log(`  ${symbol} ${file.path} ${dim(file.status)}`)
  }
  if (dependencies.length) console.log(`\n  ${green("+")} ${dependencies.map(([name]) => name).join(", ")} ${dim("dependencias")}`)
  if (conflicts.length) console.log(`\n${yellow(`${conflicts.length} arquivo(s) customizado(s) foram preservados. Use --force para substituir com backup.`)}`)

  if (options.dryRun) {
    console.log(`\n${dim("Dry-run: nenhuma alteracao foi feita.")}\n`)
    return
  }

  if (!(await confirm(`\nAplicar ${actionable.length} alteracao(oes)?`, options.yes))) {
    console.log("\nCancelado.\n")
    return
  }

  for (const file of actionable) await backupAndWrite(project.root, file, options.force)

  const nextHashes = { ...(config?.files ?? {}) }
  for (const file of planned) {
    if (file.status !== "conflict") nextHashes[file.path] = sha256(file.content)
  }
  const nextConfig: BlueprintConfig = {
    $schema: "https://suhdo.com/schemas/blueprint.json",
    version: VERSION,
    source: "suhdo",
    files: Object.fromEntries(Object.entries(nextHashes).sort(([a], [b]) => a.localeCompare(b))),
  }
  const tempConfig = join(project.root, `${CONFIG_FILE}.tmp`)
  await writeFile(tempConfig, `${JSON.stringify(nextConfig, null, 2)}\n`)
  await rename(tempConfig, join(project.root, CONFIG_FILE))

  if (options.install) await installDependencies(project, dependencies)

  console.log(`\n${green("UI Suhdo instalada.")}`)
  console.log(`  Contexto: ${cyan("docs/suhdo-ui.md")}`)
  if (!project.cssFile && options.command === "init") console.log(`  ${yellow("Importe styles/suhdo.css no CSS global do aplicativo.")}`)
  if (!options.install && dependencies.length) console.log(`  ${yellow("Dependencias nao instaladas por --no-install.")}`)
  console.log(`  Auth/3AS: ${dim("inalterado")}\n`)
}

try {
  const options = parseArgs(process.argv.slice(2))
  if (options) await run(options)
} catch (error) {
  console.error(`\n${yellow("Erro:")} ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
}
