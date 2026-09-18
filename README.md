# Suhdo Blueprint

Fonte canônica das bases visuais dos aplicativos Suhdo.

## Uso no aplicativo

```bash
npx @suhdo/ui-blueprint
```

O comando detecta um projeto React com Tailwind CSS 4, copia os tokens e os componentes para o código-fonte, instala somente as dependências visuais ausentes e adiciona o contrato de UI em `docs/suhdo-ui.md`. O contexto é referenciado de forma idempotente em `AGENTS.md`, `CLAUDE.md`, `.cursorrules` ou nas instruções do Copilot já existentes.

O CLI não altera autenticação, callbacks, middleware, sessão nem variáveis do 3AS.

### Comandos

```bash
npx @suhdo/ui-blueprint init
npx @suhdo/ui-blueprint context
npx @suhdo/ui-blueprint doctor
npx @suhdo/ui-blueprint mcp
```

Use `--dry-run` para ver o plano, `--yes` para execução não interativa, `--no-install` para não chamar o gerenciador de pacotes e `--force` apenas para substituir arquivos customizados, preservando uma cópia `.bak`.

### MCP

`npx @suhdo/ui-blueprint mcp` inicia um servidor MCP local em modo stdio. Ele expõe o contrato normativo e o catálogo de componentes como recursos somente leitura, além dos prompts `implement-suhdo-ui` e `review-suhdo-ui`.

Configuração genérica para hosts compatíveis:

```json
{
  "mcpServers": {
    "suhdo-ui": {
      "command": "npx",
      "args": ["-y", "@suhdo/ui-blueprint", "mcp"]
    }
  }
}
```

O nome da chave raiz pode variar entre hosts. O processo não acessa arquivos do projeto, não oferece ferramentas mutáveis e não altera autenticação ou sessão.

## Showcase local

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. A tela demonstra tokens, temas, loaders, modais, biblioteca de arquivos, gráficos analíticos, DataList responsiva e shell com contexto de organização usando diretamente os pacotes deste workspace.

Os testes E2E usam o build de produção e cobrem full-width em 2560 px, cards em 375 px, ausência de overflow, menus de contexto e fluxos de modal:

```bash
npm run test:e2e:install
npm run test:e2e
```

## Publicação

O workflow `Publish npm package` valida o workspace e publica o CLI com provenance por trusted publishing. O pacote autoriza o repositório `themarslabs/suhdo-blueprint`, o workflow `publish.yml` e o environment `npm`, sem armazenar token de publicação no GitHub.

## Estrutura

- `packages/theme`: tokens CSS claros/escuros e chrome de aplicativo.
- `packages/ui`: fonte React dos componentes distribuídos pelo CLI.
- `packages/cli`: pacote npm `@suhdo/ui-blueprint` e blueprint copy-in.
- `apps/showcase`: referência visual executável.
- `docs/suhdo-ui.md`: contrato normativo consumido por pessoas e agentes.
