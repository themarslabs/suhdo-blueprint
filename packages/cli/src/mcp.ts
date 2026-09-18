import { readFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { McpServer } from "@modelcontextprotocol/server"
import { serveStdio } from "@modelcontextprotocol/server/stdio"

const CONTRACT_URI = "suhdo://ui/docs/suhdo-ui.md"
const CATALOG_URI = "suhdo://ui/catalog.json"

const MODULE_GROUPS = [
  {
    id: "shell",
    useWhen: "Building authenticated product navigation and context controls.",
    modules: [
      { path: "components/app/app-shell.tsx", exports: ["AppShell"] },
      { path: "components/app/organization-switcher.tsx", exports: ["OrganizationSwitcher"] },
      { path: "components/app/workspace-switcher.tsx", exports: ["WorkspaceSwitcher"] },
      { path: "components/app/language-switcher.tsx", exports: ["LanguageSwitcher"] },
      { path: "components/app/user-menu.tsx", exports: ["UserMenu"] },
    ],
  },
  {
    id: "page-structure",
    useWhen: "Composing page headings, metrics, sections and empty states.",
    modules: [
      { path: "components/app/app-page.tsx", exports: ["AppPage", "AppPageIntro", "AppPageStats", "AppStatCard", "AppSectionHeader", "AppEmptyState"] },
    ],
  },
  {
    id: "collections",
    useWhen: "Displaying searchable operational collections as desktop tables and mobile cards.",
    modules: [
      { path: "components/app/data-list.tsx", exports: ["DataList", "DataListColumn", "DataListFilter", "DataListControlled"] },
    ],
  },
  {
    id: "async-states",
    useWhen: "Representing page, list, card, chart, overlay or button progress.",
    modules: [
      { path: "components/ui/loading-state.tsx", exports: ["LoaderTrace", "ButtonSpinner", "LoadingState", "PageLoading", "InlineLoading", "LoadingOverlay", "ListLoading", "CardGridLoading", "ChartLoading", "LoadingProgress", "AsyncState"] },
    ],
  },
  {
    id: "analytics",
    useWhen: "Showing compact metrics or analytical temporal and categorical data.",
    modules: [
      { path: "components/app/metric-card.tsx", exports: ["MetricCard", "DeltaBadge", "Sparkline", "MiniBars", "DonutChart", "ProgressBar"] },
      { path: "components/app/analytics-chart.tsx", exports: ["ChartPanel", "TimeSeriesChart", "CategoryBarChart", "DonutBreakdownChart"] },
      { path: "components/ui/chart.tsx", exports: ["ChartContainer", "ChartTooltip", "ChartTooltipContent"] },
    ],
  },
  {
    id: "files",
    useWhen: "Uploading, browsing, selecting, ordering or inspecting files and media.",
    modules: [
      { path: "components/files/file-dropzone.tsx", exports: ["FileDropzone"] },
      { path: "components/files/file-tile.tsx", exports: ["FileTile", "FileAsset", "FileAssetKind", "formatFileSize"] },
      { path: "components/files/file-picker-dialog.tsx", exports: ["FilePickerDialog", "FileDetailsSheet"] },
    ],
  },
  {
    id: "overlays-and-input",
    useWhen: "Collecting input or presenting decisions and contextual details.",
    modules: [
      { path: "components/ui/dialog.tsx", exports: ["Dialog", "DialogContent", "DialogHeader", "DialogBody", "DialogFooter"] },
      { path: "components/ui/dialogs-provider.tsx", exports: ["DialogsProvider", "useConfirm", "usePrompt"] },
      { path: "components/ui/sheet.tsx", exports: ["Sheet", "SheetContent"] },
      { path: "components/ui/button.tsx", exports: ["Button"] },
      { path: "components/ui/input.tsx", exports: ["Input"] },
      { path: "components/ui/textarea.tsx", exports: ["Textarea"] },
      { path: "components/ui/select.tsx", exports: ["Select"] },
      { path: "components/ui/tabs.tsx", exports: ["Tabs"] },
    ],
  },
  {
    id: "theme",
    useWhen: "Installing or switching the shared light, dark and system theme.",
    modules: [
      { path: "components/theme-provider.tsx", exports: ["ThemeProvider"] },
      { path: "components/theme-script.tsx", exports: ["ThemeScript"] },
      { path: "components/theme-toggle.tsx", exports: ["ThemeToggle"] },
      { path: "lib/theme.ts", exports: ["useTheme"] },
      { path: "styles/suhdo.css", exports: [] },
    ],
  },
] as const

function createCatalog(version: string) {
  return {
    name: "Suhdo UI Blueprint",
    version,
    source: "npx @suhdo/ui-blueprint",
    contract: CONTRACT_URI,
    principles: [
      "Treat docs/suhdo-ui.md as normative.",
      "Prefer installed components over parallel visual primitives.",
      "Keep operational lists full-width within the page gutter.",
      "Provide loading, empty, error and ready states.",
      "Validate 375, 768 and 1440 pixel layouts and keyboard operation.",
      "Keep auth, sessions, tenant changes, storage and routing behind application callbacks.",
    ],
    modules: MODULE_GROUPS,
  }
}

function contextMessages(contract: string, catalog: string, instruction: string) {
  return [
    {
      role: "user" as const,
      content: {
        type: "resource" as const,
        resource: { uri: CONTRACT_URI, mimeType: "text/markdown", text: contract },
      },
    },
    {
      role: "user" as const,
      content: {
        type: "resource" as const,
        resource: { uri: CATALOG_URI, mimeType: "application/json", text: catalog },
      },
    },
    { role: "user" as const, content: { type: "text" as const, text: instruction } },
  ]
}

export async function runMcpServer(version: string) {
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
  const contract = await readFile(join(packageRoot, "blueprint", "docs", "suhdo-ui.md"), "utf8")
  const catalog = JSON.stringify(createCatalog(version), null, 2)

  const handle = serveStdio(() => {
    const server = new McpServer(
      { name: "suhdo-ui", version },
      {
        instructions: "Treat the Suhdo UI contract as normative. Read the catalog before creating or reviewing product UI. This server is read-only and does not authorize changes to auth, sessions, middleware, cookies or environment files.",
        capabilities: {
          resources: { listChanged: false },
          prompts: { listChanged: false },
        },
      },
    )

    server.registerResource(
      "suhdo-ui-contract",
      CONTRACT_URI,
      { title: "Suhdo UI Contract", description: "Normative Suhdo product UI contract.", mimeType: "text/markdown" },
      async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: contract }] }),
    )
    server.registerResource(
      "suhdo-ui-catalog",
      CATALOG_URI,
      { title: "Suhdo UI Catalog", description: "Installed modules, exports and component selection guidance.", mimeType: "application/json" },
      async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: catalog }] }),
    )

    server.registerPrompt(
      "implement-suhdo-ui",
      { title: "Implement with Suhdo UI", description: "Create or change product UI using the normative contract and bundled catalog." },
      () => ({
        description: "Suhdo UI implementation context.",
        messages: contextMessages(contract, catalog, "Identify the screen type, reuse the closest installed modules, preserve the full-width operational work area, and validate theme, responsive states, async states, accessibility and architecture boundaries."),
      }),
    )
    server.registerPrompt(
      "review-suhdo-ui",
      { title: "Review against Suhdo UI", description: "Review a product UI against the normative contract and bundled catalog." },
      () => ({
        description: "Suhdo UI review context.",
        messages: contextMessages(contract, catalog, "Review findings first. Prioritize authorization boundaries, data loss, accessibility, mobile overflow, theme, async states and divergence from installed Suhdo modules."),
      }),
    )

    return server
  }, { onerror: (error) => console.error(`[suhdo mcp] ${error.message}`) })

  let closing = false
  const close = () => {
    if (closing) return
    closing = true
    void handle.close()
  }
  process.once("SIGINT", close)
  process.once("SIGTERM", close)
}
