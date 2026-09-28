"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  Bot,
  Boxes,
  Check,
  ChevronRight,
  Code2,
  Copy,
  FileCheck2,
  Github,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Terminal,
} from "lucide-react"

import { ThemeToggle } from "@suhdo/ui/components/theme-toggle"
import { Badge } from "@suhdo/ui/components/ui/badge"
import { Button } from "@suhdo/ui/components/ui/button"

const installCommand = "npx @suhdo/ui-blueprint@latest init"

const commands = [
  {
    command: "npx @suhdo/ui-blueprint@latest init",
    label: "Instalar ou atualizar",
    description: "Sincroniza tokens, componentes e o contrato de UI no seu projeto.",
    icon: RefreshCw,
  },
  {
    command: "npx @suhdo/ui-blueprint doctor",
    label: "Verificar o projeto",
    description: "Confere os requisitos e aponta o que precisa de atenção.",
    icon: Stethoscope,
  },
  {
    command: "npx @suhdo/ui-blueprint context",
    label: "Somente contexto",
    description: "Instala a documentação para agentes sem copiar componentes.",
    icon: FileCheck2,
  },
  {
    command: "npx @suhdo/ui-blueprint mcp",
    label: "Servidor MCP",
    description: "Expõe o contrato e o catálogo para clientes de IA compatíveis.",
    icon: Bot,
  },
]

const steps = [
  {
    number: "01",
    title: "Entre no seu aplicativo",
    description: "Abra o terminal na raiz de um projeto React com TypeScript e Tailwind CSS 4.",
  },
  {
    number: "02",
    title: "Confira antes de aplicar",
    description: "Use --dry-run para visualizar arquivos, dependências e possíveis conflitos sem escrever nada.",
    command: `${installCommand} --dry-run`,
  },
  {
    number: "03",
    title: "Sincronize o blueprint",
    description: "Execute o init. Arquivos customizados são detectados e preservados automaticamente.",
    command: installCommand,
  },
]

function CopyButton({ value, label = "Copiar comando" }: { value: string; label?: string }) {
  const [copied, setCopied] = React.useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={copy} aria-label={copied ? "Comando copiado" : label} className="shrink-0 text-muted-foreground hover:text-foreground">
      {copied ? <Check className="text-success" /> : <Copy />}
    </Button>
  )
}

function CommandLine({ value, compact = false }: { value: string; compact?: boolean }) {
  return (
    <div className={`flex min-w-0 items-center gap-2 rounded-lg border border-border bg-background/80 font-mono shadow-sm ${compact ? "px-2 py-1.5 text-[11px]" : "px-3 py-2.5 text-xs sm:text-sm"}`}>
      <span className="select-none text-primary">$</span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-foreground">{value}</code>
      <CopyButton value={value} />
    </div>
  )
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Suhdo UI Blueprint">
      <span className="grid size-8 place-items-center rounded-[9px] bg-primary font-mono text-sm font-bold text-primary-foreground">S</span>
      <span className="text-sm font-semibold tracking-tight">Suhdo <span className="text-muted-foreground">Blueprint</span></span>
    </Link>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-svh overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />
          <nav className="hidden items-center gap-6 text-xs font-medium text-muted-foreground md:flex" aria-label="Navegação principal">
            <a href="#como-usar" className="transition-colors hover:text-foreground">Como usar</a>
            <a href="#comandos" className="transition-colors hover:text-foreground">Comandos</a>
            <a href="#seguranca" className="transition-colors hover:text-foreground">Atualizações</a>
            <Link href="/showcase" className="transition-colors hover:text-foreground">Componentes</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <a href="#comecar">Começar <ArrowRight /></a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate border-b border-border/70">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_15%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_35%),linear-gradient(to_right,color-mix(in_oklab,var(--border)_35%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_35%,transparent)_1px,transparent_1px)] bg-[size:auto,48px_48px,48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
          <div className="mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-32">
            <div className="max-w-2xl animate-suhdo-slide-up">
              <Badge variant="outline" className="mb-6 gap-2 bg-background/70 px-2.5 py-1 text-primary">
                <Sparkles className="size-3.5" /> Design system instalável
              </Badge>
              <h1 className="text-[2.55rem] leading-[1.04] font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-[4.15rem]">
                Uma base de UI consistente, direto no seu código.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Instale os componentes, tokens e padrões da Suhdo em qualquer aplicação React. Seu time ganha velocidade sem abrir mão da propriedade do código.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild><a href="#comecar"><Terminal />Instalar agora</a></Button>
                <Button size="lg" variant="outline" asChild><Link href="/showcase"><Boxes />Explorar componentes</Link></Button>
              </div>
              <div className="mt-9 max-w-xl">
                <CommandLine value={installCommand} />
                <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-3.5 text-success" />Não altera autenticação, sessões ou variáveis do seu app.</p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:mx-0">
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary/8 blur-2xl" />
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5">
                <div className="flex h-11 items-center gap-1.5 border-b border-border bg-muted/50 px-4">
                  <span className="size-2.5 rounded-full bg-destructive/60" />
                  <span className="size-2.5 rounded-full bg-warning/60" />
                  <span className="size-2.5 rounded-full bg-success/60" />
                  <span className="ml-3 font-mono text-[10px] text-muted-foreground">terminal — seu-app</span>
                </div>
                <div className="space-y-5 p-5 font-mono text-xs sm:p-7 sm:text-[13px]">
                  <p><span className="text-primary">$</span> {installCommand}</p>
                  <div className="space-y-2 text-muted-foreground">
                    <p className="text-foreground">Suhdo UI Blueprint <span className="text-primary">v0.1.2</span></p>
                    <p><span className="text-success">+</span> styles/suhdo.css</p>
                    <p><span className="text-success">+</span> components/ui/button.tsx</p>
                    <p><span className="text-success">+</span> components/app/app-shell.tsx</p>
                    <p><span className="text-success">+</span> docs/suhdo-ui.md</p>
                    <p><span className="text-info">i</span> Dependências visuais verificadas</p>
                  </div>
                  <div className="rounded-lg border border-success/20 bg-success/8 p-3 text-success">
                    ✓ Blueprint instalado. Seu código continua sendo seu.
                  </div>
                </div>
              </div>
              <div className="absolute -right-3 -bottom-5 hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 shadow-lg sm:flex">
                <PackageCheck className="size-4 text-primary" />
                <div><p className="text-xs font-semibold">React + Tailwind 4</p><p className="text-[10px] text-muted-foreground">Pronto para produção</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border/70 bg-card/45">
          <div className="mx-auto grid max-w-7xl divide-y divide-border/70 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
            {[
              ["Copy-in", "Componentes dentro do repositório, fáceis de adaptar."],
              ["Idempotente", "Rode novamente para atualizar sem duplicar configuração."],
              ["AI-ready", "Contrato e catálogo legíveis por pessoas e agentes."],
            ].map(([title, description]) => (
              <div key={title} className="px-3 py-7 sm:px-7">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="como-usar" className="scroll-mt-20 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-label-caps text-primary">Fluxo recomendado</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Do zero ao blueprint em três passos.</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">Sem configuração extensa e sem depender de uma biblioteca fechada em tempo de execução.</p>
            </div>
            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {steps.map((step) => (
                <article key={step.number} className="flex min-h-64 flex-col rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between"><span className="font-mono text-xs text-primary">{step.number}</span><ChevronRight className="size-4 text-muted-foreground/50" /></div>
                  <h3 className="mt-10 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                  {step.command ? <div className="mt-auto pt-6"><CommandLine value={step.command} compact /></div> : <div className="mt-auto flex items-center gap-2 pt-6 text-xs text-muted-foreground"><Code2 className="size-4 text-primary" />package.json na raiz</div>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="comandos" className="scroll-mt-20 border-y border-border/70 bg-card/45 py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[.72fr_1.28fr] lg:px-8">
            <div>
              <p className="text-label-caps text-primary">CLI completo</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Um comando para cada momento.</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">Instale a fundação completa, faça uma atualização segura ou ofereça o mesmo contrato de UI ao seu agente.</p>
              <Button variant="outline" className="mt-7" asChild><Link href="/showcase">Ver o resultado <ArrowRight /></Link></Button>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-background">
              {commands.map((item, index) => (
                <div key={item.command} className={`grid gap-4 p-5 sm:grid-cols-[1fr_1.15fr] sm:items-center sm:p-6 ${index ? "border-t border-border" : ""}`}>
                  <div className="flex gap-3.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><item.icon className="size-4" /></span>
                    <div><h3 className="text-sm font-semibold">{item.label}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p></div>
                  </div>
                  <CommandLine value={item.command} compact />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="seguranca" className="scroll-mt-20 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-2">
              <div className="p-7 sm:p-10 lg:p-12">
                <Badge variant="success"><ShieldCheck />Atualização segura</Badge>
                <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">Adapte sem perder seu trabalho.</h2>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">O CLI registra hashes dos arquivos instalados. Em uma nova execução, arquivos intactos são atualizados e customizações locais são preservadas.</p>
                <ul className="mt-7 space-y-3 text-sm">
                  {["Detecta alterações feitas pela sua equipe", "Mostra o plano completo com --dry-run", "Cria cópias .bak quando você escolhe --force"].map((item) => <li key={item} className="flex items-start gap-2.5"><Check className="mt-0.5 size-4 shrink-0 text-success" />{item}</li>)}
                </ul>
              </div>
              <div className="border-t border-border bg-muted/35 p-7 sm:p-10 lg:border-t-0 lg:border-l lg:p-12">
                <p className="font-mono text-xs font-medium text-muted-foreground">Antes de atualizar</p>
                <div className="mt-4"><CommandLine value={`${installCommand} --dry-run`} /></div>
                <p className="mt-7 font-mono text-xs font-medium text-muted-foreground">Sobrescrever conscientemente</p>
                <div className="mt-4"><CommandLine value={`${installCommand} --force`} /></div>
                <div className="mt-6 rounded-xl border border-warning/20 bg-warning/8 p-4 text-xs leading-5 text-muted-foreground">
                  <strong className="text-foreground">Use --force com intenção.</strong> Os arquivos customizados serão substituídos, mas cada versão anterior será salva com a extensão <code className="font-mono text-warning">.bak</code>.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="comecar" className="scroll-mt-20 px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#072b22] px-6 py-14 text-white sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_25%,rgba(52,211,153,.25),transparent_32%)]" />
            <div className="relative max-w-2xl">
              <p className="text-xs font-semibold tracking-[.12em] text-emerald-300 uppercase">Pronto para começar?</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Leve o padrão Suhdo para o próximo produto.</h2>
              <p className="mt-4 text-sm leading-6 text-emerald-50/65">Uma instalação, uma linguagem visual e um contrato compartilhado por toda a equipe.</p>
            </div>
            <div className="relative mt-8 flex flex-wrap gap-3 lg:mt-0 lg:pl-10">
              <Button size="lg" className="bg-white text-[#073c2e] hover:bg-white/90" onClick={() => void navigator.clipboard.writeText(installCommand)}><Copy />Copiar instalação</Button>
              <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" asChild><Link href="/showcase">Abrir showcase</Link></Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Brand />
          <p>Componentes, tokens e contexto para produtos Suhdo.</p>
          <a href="https://github.com/themarslabs/suhdo-blueprint" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-foreground"><Github className="size-4" />GitHub</a>
        </div>
      </footer>
    </div>
  )
}
