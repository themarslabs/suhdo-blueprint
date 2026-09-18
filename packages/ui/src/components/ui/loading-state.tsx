import * as React from "react"
import { CircleAlert, Loader2, type LucideIcon } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const TRACE_SIZES = { sm: 16, md: 24, lg: 36 } as const
const TRACE_PERIMETER = 112.5
const TRACE_CSS = `
.loader-trace-dash { animation: loader-trace 1.4s linear infinite; }
@keyframes loader-trace { to { stroke-dashoffset: -${TRACE_PERIMETER}; } }
@media (prefers-reduced-motion: reduce) {
  .loader-trace-dash { animation: loader-trace-fade 1.8s ease-in-out infinite; }
  @keyframes loader-trace-fade { 0%, 100% { opacity: .35 } 50% { opacity: 1 } }
}`

export type LoaderSize = keyof typeof TRACE_SIZES

export function LoaderTrace({ size = "md", className }: { size?: LoaderSize | number; className?: string }) {
  const pixels = typeof size === "number" ? size : TRACE_SIZES[size]
  const gradientId = React.useId()
  return (
    <>
      <style href="suhdo-loader-trace" precedence="default">{TRACE_CSS}</style>
      <svg width={pixels} height={pixels} viewBox="0 0 36 36" aria-hidden="true" className={cn("drop-shadow-[0_0_7px_color-mix(in_srgb,currentColor_24%,transparent)]", className)}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="0.72" stopColor="currentColor" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="32" height="32" rx="9" fill="none" stroke="currentColor" strokeWidth={pixels < 24 ? 3 : 2} strokeOpacity="0.12" />
        <rect x="2" y="2" width="32" height="32" rx="9" fill="none" stroke={`url(#${gradientId})`} strokeWidth={pixels < 24 ? 3 : 2} strokeLinecap="round" strokeDasharray="26 86.5" className="loader-trace-dash" />
      </svg>
    </>
  )
}

export function ButtonSpinner({ busy, icon: Icon, className }: { busy: boolean; icon?: LucideIcon; className?: string }) {
  if (busy) return <Loader2 className={cn("animate-spin", className)} />
  return Icon ? <Icon className={className} /> : null
}

export function LoadingState({
  message = "Carregando...",
  size = "md",
  className,
}: {
  message?: string
  size?: LoaderSize
  className?: string
}) {
  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col items-center justify-center gap-3 p-8 text-muted-foreground", className)}>
      <LoaderTrace size={size} />
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  )
}

export function PageLoading({ message = "Carregando pagina..." }: { message?: string }) {
  return (
    <div className="flex min-h-[60svh] items-center justify-center">
      <div className="relative grid min-w-52 place-items-center overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-8 py-10 shadow-xs backdrop-blur-sm">
        <div aria-hidden="true" className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent" />
        <LoadingState message={message} size="lg" className="p-0 text-primary [&_p]:text-muted-foreground" />
      </div>
    </div>
  )
}

export function InlineLoading({ className }: { className?: string }) {
  return <span role="status" aria-label="Carregando"><LoaderTrace size="sm" className={className} /></span>
}

export function LoadingOverlay({
  visible,
  message = "Atualizando...",
  children,
  className,
}: {
  visible: boolean
  message?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("relative", className)} aria-busy={visible}>
      {children}
      {visible ? (
        <div className="absolute inset-0 z-20 grid place-items-center rounded-[inherit] bg-background/72 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-lg" role="status" aria-live="polite">
            <LoaderTrace size="sm" className="text-primary" />
            {message}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function ListLoading({ rows = 5, message = "Carregando lista..." }: { rows?: number; message?: string }) {
  return (
    <div role="status" aria-live="polite" aria-label={message} className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-xs text-muted-foreground">
        <LoaderTrace size="sm" className="text-primary" />
        {message}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex h-16 items-center gap-3 px-4">
            <Skeleton className="size-9 shrink-0" />
            <div className="flex-1 space-y-2"><Skeleton className="h-3 w-[min(15rem,55%)]" /><Skeleton className="h-2.5 w-[min(10rem,38%)]" /></div>
            <Skeleton className="hidden h-5 w-16 sm:block" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardGridLoading({ cards = 4, message = "Preparando conteudo..." }: { cards?: number; message?: string }) {
  return (
    <div role="status" aria-live="polite" aria-label={message} className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><LoaderTrace size="sm" className="text-primary" />{message}</div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-3">
        {Array.from({ length: cards }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-xl border border-border bg-card">
            <Skeleton className="h-32 w-full rounded-none" />
            <div className="space-y-2 p-3"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-2.5 w-1/2" /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartLoading({ message = "Calculando serie..." }: { message?: string }) {
  return (
    <div role="status" aria-live="polite" className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-border bg-card">
      <div aria-hidden="true" className="absolute inset-x-6 bottom-6 flex h-28 items-end gap-2 opacity-45">
        {[35, 62, 48, 78, 56, 88, 68, 94, 72].map((height, index) => <Skeleton key={index} className="min-w-2 flex-1 rounded-t-sm rounded-b-none" style={{ height: `${height}%` }} />)}
      </div>
      <div className="relative z-10 flex items-center gap-3 rounded-xl border border-border bg-background/88 px-4 py-3 text-sm text-muted-foreground shadow-md backdrop-blur-sm">
        <LoaderTrace size="sm" className="text-primary" />{message}
      </div>
    </div>
  )
}

export function LoadingProgress({ value, label = "Processando" }: { value: number; label?: string }) {
  const percentage = Math.max(0, Math.min(100, value))
  return (
    <div className="grid gap-2" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
      <div className="flex items-center justify-between gap-3 text-xs"><span className="flex items-center gap-2 text-muted-foreground"><LoaderTrace size="sm" className="text-primary" />{label}</span><span className="font-mono text-foreground tabular-nums">{Math.round(percentage)}%</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${percentage}%` }} /></div>
    </div>
  )
}

export function AsyncState({
  status,
  loadingMessage,
  empty,
  error,
  children,
}: {
  status: "loading" | "empty" | "error" | "ready"
  loadingMessage?: string
  empty?: React.ReactNode
  error?: React.ReactNode
  children: React.ReactNode
}) {
  if (status === "loading") return <LoadingState message={loadingMessage} />
  if (status === "empty") return <div className="grid min-h-36 place-items-center p-6 text-center text-sm text-muted-foreground">{empty ?? "Nenhum dado disponivel."}</div>
  if (status === "error") return <div role="alert" className="flex min-h-36 items-center justify-center gap-2 p-6 text-sm text-destructive"><CircleAlert className="size-4" />{error ?? "Nao foi possivel carregar."}</div>
  return <>{children}</>
}
