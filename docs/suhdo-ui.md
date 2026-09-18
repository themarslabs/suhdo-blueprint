# Contrato de UI Suhdo

Este documento é normativo para interfaces de produto Suhdo. Antes de criar ou alterar uma tela, reutilize os tokens e componentes instalados pelo blueprint. Não recrie a aparência com cores hexadecimais, sombras ou raios locais.

## Linguagem visual

- O produto usa Jost em interfaces e Geist Mono apenas para dados técnicos ou tabulares.
- O verde `primary` comunica ação principal e seleção. Não é decoração de fundo.
- Superfícies formam três níveis: `background`, `card` e `popover`.
- Bordas são discretas e sem gradientes. Elevação usa `shadow-xs` ou `shadow-md` somente quando a hierarquia exige.
- O raio efetivo do chrome é `0.5rem`; cards de produto usam `rounded-xl`.
- Espaçamento de página: `px-4 py-5`, passando a `lg:px-6 lg:py-6`.
- Estados usam tokens semânticos: `success`, `warning`, `info` e `destructive`.
- Séries de dados usam `chart-1` a `chart-5`; nunca use ramps Tailwind fixas em gráficos.

## Temas

- A classe `light` ou `dark` pertence ao elemento `html`, para alcançar portais.
- A preferência aceita `light`, `dark` e `system`.
- O cookie compartilhado é `3as_theme`, com `Path=/`, `SameSite=Lax` e duração de um ano.
- Em produção Suhdo, `THEME_COOKIE_DOMAIN=.suhdo.com` permite a preferência entre subdomínios. Em desenvolvimento, o cookie deve ser host-only.
- O HTML inicial deve sair com o tema resolvido para evitar flash. O cliente acompanha mudanças de `prefers-color-scheme` quando a preferência é `system`.

## Componentes

- Importe de `components/ui` antes de criar um primitivo.
- Use `Button` e suas variantes `default`, `secondary`, `outline`, `ghost`, `destructive` e `link`.
- Use `LoadingState` para regiões e `LoaderTrace` para espaços compactos. `Loader2` girando é reservado a progresso dentro de botão.
- Use `AppPage`, `AppPageIntro`, `AppPageStats` e `AppSectionHeader` para estrutura de páginas.
- Use `MetricCard` e os gráficos auxiliares para métricas.
- Use `DataList` para coleções pesquisáveis; a tabela precisa manter semântica nativa e virar cards em telas pequenas.
- Use `AppShell` para navegação de produto. A sidebar mede `16rem`, recolhe para `3.25rem` e vira sheet no mobile.

### Shell e identidade

- `AppShell` aceita `organizationSwitcher`, `workspaceSwitcher`, `languageSwitcher` e `userMenu`. A organização ativa deve continuar reconhecível mesmo com a sidebar recolhida ou fechada no mobile.
- `OrganizationSwitcher` recebe organizações, `activeId` e `onChange`. A UI pode mostrar iniciais e a cor estável calculada por `organizationTintStyle`, mas a aplicação é responsável por trocar tenant, redirecionar ou renovar contexto.
- `WorkspaceSwitcher` representa um escopo de produto dentro da organização ativa. Não trate workspace como sinônimo de tenant ou claim de autorização.
- `UserMenu` mostra nome, e-mail, avatar e role. Role e badge são informação visual; nunca substituem autorização no servidor.
- `LanguageSwitcher` recebe a lista de locales e delega a mudança a `onChange`. O callback pode trocar rota, catálogo ou tradução automática; o componente não depende de Next.js, `next-intl` ou um provedor específico.

### Listas

- `DataList` ocupa toda a largura do contêiner. Não envolva listas operacionais em cards estreitos apenas para obter borda ou título.
- No desktop, a visualização padrão é tabela semântica; em larguras abaixo de 768 px, a lista vira cards automaticamente. O toggle tabela/cards aparece somente no desktop.
- Declare `role` nas colunas: `primary` identifica o título do card, `media` a miniatura, `meta` os pares label/valor e `actions` as ações contextuais.
- Use `hideBelow` para reduzir densidade da tabela sem remover informação essencial do card. Use `hideInCard` somente quando o dado for redundante.
- Para dados locais, forneça `getSearchText`, filtros e `pageSize`. Filtros sem restrição usam `allValue` (por padrão, `"all"`). Para paginação remota, use `controlled.search`, `controlled.sort`, `controlled.footer`, `controlled.loading` e `controlled.totalLabel`.
- Loading, vazio e paginação pertencem à região da lista; não substitua toda a página durante atualização local.

### Loading

- Existe um único motivo visual: `LoaderTrace`. `LoadingState`, `PageLoading`, `LoadingOverlay`, `ListLoading`, `CardGridLoading` e `ChartLoading` adaptam o mesmo motivo ao espaço disponível.
- `AsyncState` normaliza os estados `loading`, `empty`, `error` e `ready` de uma região.
- Dentro de `Button`, use `ButtonSpinner`; ele é o único lugar onde `Loader2` girando é permitido.
- Não mostre skeleton e spinner simultaneamente para a mesma operação. Preserve a geometria com skeletons e use `LoaderTrace` apenas para comunicar atividade.
- Overlays de loading bloqueiam interação somente quando a operação realmente não admite concorrência. Mantenha `aria-live=polite` e uma mensagem objetiva.

### Diálogos e sheets

- `DialogContent` aceita `size="sm|default|lg|xl|full"`. Use `full` apenas para fluxos com navegação interna, biblioteca, preview ou edição extensa.
- Estruture conteúdo com `DialogHeader`, `DialogBody` e `DialogFooter`; header e footer ficam estáveis enquanto o body pode rolar.
- Use `DialogsProvider`, `useConfirm` e `usePrompt` para decisões globais simples. Não crie estado de modal duplicado em cada página.
- Confirmações destrutivas usam `danger: true`, verbo específico e descrição da consequência. Fechar por Escape ou overlay equivale a cancelar.
- Use `Sheet` para detalhes ou contexto auxiliar que não precisa interromper a tarefa. Sheets abertos sobre um modal usam camadas acima do modal, sem reduzir o `z-index` global.

### Arquivos e mídia

- `FileDropzone` só captura arquivos e chama `onFiles`. Upload, validação, R2/S3, progresso e persistência pertencem à aplicação.
- `FileTile` representa imagem, vídeo, SVG, documento ou arquivo genérico com nome e metadados. Não suponha que todo arquivo tenha preview, dimensões ou URL pública.
- `FilePickerDialog` usa modal `full` com abas `Enviar`, `Biblioteca` e, para múltiplos itens, `Seleção` ou `Coleção`.
- `selectionMode="single"` abre detalhes antes de confirmar; `multiple` alterna seleção; `collection` também expõe ordem explícita e operável por teclado.
- A aplicação fornece `assets`, `loading`, `uploading`, `onUpload` e `onConfirm`. O picker não busca APIs nem mantém uma biblioteca paralela.
- Detalhes usam `FileDetailsSheet`; a ação principal deve dizer `Usar arquivo`, `Adicionar à seleção` ou outro verbo de domínio.

### Gráficos

- `MetricCard`, `Sparkline`, `MiniBars` e `DonutChart` são resumos compactos; não substituem gráficos analíticos quando a dimensão temporal ou categórica importa.
- Para análise, use `ChartPanel` com `TimeSeriesChart`, `CategoryBarChart` ou `DonutBreakdownChart`.
- Todo gráfico declara título, período/contexto, `ariaLabel`, unidade via `valueFormatter` e séries com nomes legíveis. Use `chart-1` a `chart-5` ou tokens semânticos, nunca cores fixas.
- `ChartPanel` diferencia loading, vazio e erro. Zero é dado válido e deve continuar visível como zero.
- Forneça `table` ao `ChartPanel` para disponibilizar os mesmos dados em HTML. Tooltips e legenda complementam, mas não são a única forma de leitura.
- Séries temporais preservam labels do eixo X; categorias preservam o nome de cada grupo; donut sempre mostra legenda, valor e participação percentual.

## Decisão para agentes e MCP

- Primeiro identifique o tipo da tela: navegação, formulário, coleção, detalhe, mídia ou análise. Escolha os componentes deste contrato antes de propor novos nomes.
- Prefira composição por props, dados e callbacks. Não embuta `fetch`, hooks de auth, cliente de storage, roteador ou variáveis de ambiente em componentes visuais.
- Se uma capacidade não existir, componha primitivos já instalados e mantenha tokens, estados, responsividade e acessibilidade deste documento.
- Não copie componentes de outro produto Suhdo diretamente. A referência comportamental deve ser convertida em API genérica neste blueprint.
- Ao revisar código, reporte primeiro violações que afetam autorização, acessibilidade, perda de dados, mobile ou tema; depois inconsistências visuais.
- Antes de concluir uma tela, valide loading, vazio, erro, dados longos, teclado e larguras de 375, 768 e 1440 px.

### Servidor MCP

- `npx suhdo mcp` serve este contrato em `suhdo://ui/docs/suhdo-ui.md` e o catálogo instalado em `suhdo://ui/catalog.json` usando transporte stdio.
- O prompt `implement-suhdo-ui` orienta implementação; `review-suhdo-ui` orienta revisão com findings primeiro.
- O servidor não expõe tools, não lê o projeto consumidor e não executa mutações. Recursos e prompts são contexto, não permissão para alterar auth, sessão, middleware ou infraestrutura.

## Conteúdo e densidade

- Títulos descrevem a tarefa ou domínio; evite slogans dentro do produto.
- Labels curtos podem usar caixa alta, `text-[11px]` e tracking entre `0.12em` e `0.14em`.
- Texto de apoio usa `text-muted-foreground`; não reduza opacidade arbitrariamente.
- Números de métricas usam `tabular-nums`.
- Estados vazios devem dizer o que falta e oferecer a próxima ação quando houver uma.

## Responsividade e acessibilidade

- A referência mínima é 375 px; conteúdo nunca depende de largura mínima de 320 px depois do padding.
- Controles essenciais precisam de nome acessível, foco visível e alvo confortável no mobile.
- Diálogos, menus, selects e sheets usam Radix para foco, Escape e leitura por tecnologia assistiva.
- Tabelas usam `table`, `thead`, `th`, `tbody` e `td`; ordenação expõe `aria-sort`.
- Loading usa `role=status` e `aria-live=polite`.
- Gráficos acompanham resumo textual ou `aria-label`; cor nunca é o único significado.
- Animações respeitam `prefers-reduced-motion`.

## Limites de arquitetura

- UI não lê access token ou refresh token.
- UI pode consumir usuário, organização ativa, permissões e ações de login/logout por uma interface de aplicação, mas não implementa autorização server-side.
- O blueprint nunca altera `app/auth`, `middleware`, cookies de sessão, callbacks OIDC ou arquivos `.env`.
- Componentes são copy-in para que Tailwind encontre as classes e para permitir adaptação por produto. Uma customização local deve preservar tokens, estados, semântica e comportamento responsivo.

## Checklist de tela

1. Reutiliza shell, página e primitivos existentes.
2. Funciona em claro, escuro e `system`.
3. Não possui cor, raio ou sombra arbitrária sem justificativa de domínio.
4. Possui estados loading, vazio, erro e conteúdo longo.
5. Funciona a 375, 768 e 1440 px.
6. É operável por teclado e mantém foco visível.
7. Toda mutação sensível continua autorizada no servidor.
8. Listas, arquivos e gráficos recebem dados e callbacks sem acoplamento de infraestrutura.
9. Organização ativa permanece reconhecível e a troca de tenant é controlada pela aplicação.
10. Gráficos distinguem zero de ausência e oferecem alternativa tabular.
