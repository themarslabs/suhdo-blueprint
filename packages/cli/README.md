# suhdo

Instala as bases visuais e o contexto normativo de UI da Suhdo em projetos React com Tailwind CSS 4.

```bash
npx suhdo
```

O pacote é independente de autenticação. Para integrar o 3AS, use `npx @suhdo/3as-init` separadamente.

## MCP

Use o mesmo pacote como servidor MCP stdio:

```bash
npx suhdo mcp
```

Recursos disponíveis:

- `suhdo://ui/docs/suhdo-ui.md`: contrato normativo completo.
- `suhdo://ui/catalog.json`: catálogo de módulos, exports e critérios de escolha.

Prompts disponíveis:

- `implement-suhdo-ui`: contexto para implementação.
- `review-suhdo-ui`: contexto para revisão orientada a riscos.

O servidor é somente leitura e pode ser configurado com comando `npx` e argumentos `-y`, `suhdo`, `mcp` em qualquer host MCP compatível.
