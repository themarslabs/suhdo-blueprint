# Proveniencia

O blueprint foi consolidado em 13 de setembro de 2026 a partir de padroes em producao nos aplicativos Suhdo.

## Fontes internas

- Hydrogen, fonte principal de tokens e componentes de produto: commit `f50df873706ac723bde26be364bab5b60370a358`.
- Console 3AS/OIDC, fonte das correcoes de estado Radix e do contrato de tema por cookie: commit `712f0ba85fad0df65652fcc4cd57b547bb02e83b`.
- Krona, referencia de adaptacao responsiva e validacao da paleta: commit `888e96f0c33a2f8aff1ad23b2decf030d097e101`, mais alteracoes locais ainda nao versionadas na data da consolidacao.

O pacote Bootstrap historico em `suhdo.app` foi inventariado, mas nao e fonte deste blueprint React/Tailwind.

## Decisoes de consolidacao

- A paleta atual e os estados `success`, `warning`, `info` e `destructive` vieram do Hydrogen.
- O raio de chrome e a separacao de superficies foram validados no Krona.
- Seletores de estado usam os atributos reais `data-state` e `data-orientation` emitidos pelo Radix, conforme correcoes do OIDC.
- O tema usa `3as_theme`, sem acoplar componentes a tokens ou rotas de autenticacao.
- `DataList` usa tabela semantica no desktop e cards sem largura minima rigida no mobile.
- `AppShell` possui um unico landmark `main`.

## Terceiros

Os componentes seguem a abordagem copy-in popularizada por shadcn/ui e usam Radix, Lucide e Recharts. Consulte `packages/cli/THIRD_PARTY_NOTICES`.
