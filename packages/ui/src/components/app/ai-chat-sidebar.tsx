"use client"

import * as React from "react"
import { Bot, Clock3, FileText, Gauge, History, MessageSquarePlus, Paperclip, Send, Sparkles, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type AiChatModel = {
  id: string
  label: string
  description?: string
}

export type AiChatSpeed = "fast" | "balanced" | "deep"

export type AiChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

export type AiChatConversation = {
  id: string
  title: string
  updatedAt?: string
}

export type AiChatSidebarProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  models?: AiChatModel[]
  conversations?: AiChatConversation[]
  initialMessages?: AiChatMessage[]
  onSend?: (message: string, options: { model: string; speed: AiChatSpeed; files: File[] }) => void
  className?: string
}

const defaultModels: AiChatModel[] = [
  { id: "suhdo-fast", label: "Suhdo Fast", description: "Respostas rápidas" },
  { id: "suhdo-pro", label: "Suhdo Pro", description: "Melhor equilíbrio" },
  { id: "suhdo-reasoning", label: "Suhdo Reasoning", description: "Tarefas complexas" },
]

const defaultConversations: AiChatConversation[] = [
  { id: "1", title: "Revisar conteúdo da página", updatedAt: "Agora" },
  { id: "2", title: "Sugestões para SEO", updatedAt: "Ontem" },
  { id: "3", title: "Resumo das métricas", updatedAt: "12 set." },
]

const defaultMessages: AiChatMessage[] = [
  { id: "welcome", role: "assistant", content: "Olá! Posso ajudar a criar, revisar ou transformar o conteúdo desta página. O que você quer fazer?" },
]

const speedLabels: Record<AiChatSpeed, string> = {
  fast: "Rápida",
  balanced: "Equilibrada",
  deep: "Profunda",
}

export function AiChatSidebar({
  open,
  onOpenChange,
  title = "Assistente de IA",
  models = defaultModels,
  conversations = defaultConversations,
  initialMessages = defaultMessages,
  onSend,
  className,
}: AiChatSidebarProps) {
  const [model, setModel] = React.useState(models[0]?.id ?? "")
  const [speed, setSpeed] = React.useState<AiChatSpeed>("balanced")
  const [prompt, setPrompt] = React.useState("")
  const [messages, setMessages] = React.useState(initialMessages)
  const [files, setFiles] = React.useState<File[]>([])
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "nearest" })
  }, [messages])

  function submit() {
    const value = prompt.trim()
    if (!value) return
    setMessages((current) => [...current, { id: `${Date.now()}`, role: "user", content: value }])
    onSend?.(value, { model, speed, files })
    setPrompt("")
    setFiles([])
  }

  function startConversation() {
    setMessages(defaultMessages)
    setPrompt("")
    setFiles([])
    setHistoryOpen(false)
  }

  return (
    <>
      <button
        type="button"
        aria-label="Fechar assistente"
        className={cn("fixed inset-0 top-14.5 z-40 bg-black/30 backdrop-blur-[1px] transition-opacity sm:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={() => onOpenChange(false)}
      />
      <aside
        aria-label={title}
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed top-14.5 right-0 bottom-0 z-50 flex w-full flex-col border-l border-border bg-background shadow-2xl transition-transform duration-200 sm:w-105",
          open ? "translate-x-0" : "pointer-events-none translate-x-full",
          className,
        )}
      >
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><Sparkles className="size-4" /></span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold">{title}</h2>
            <p className="text-[10px] text-muted-foreground">Contexto desta página ativado</p>
          </div>
          <Button type="button" variant={historyOpen ? "secondary" : "ghost"} size="icon-sm" aria-label="Histórico de conversas" aria-pressed={historyOpen} onClick={() => setHistoryOpen((value) => !value)}><History /></Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Fechar assistente" onClick={() => onOpenChange(false)}><X /></Button>
        </header>

        {historyOpen ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div><h3 className="text-sm font-medium">Histórico</h3><p className="text-xs text-muted-foreground">Conversas recentes</p></div>
              <Button type="button" size="sm" onClick={startConversation}><MessageSquarePlus />Nova conversa</Button>
            </div>
            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-1 p-2">
                {conversations.map((conversation) => (
                  <button key={conversation.id} type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted" onClick={() => setHistoryOpen(false)}>
                    <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-muted/30"><Clock3 className="size-3.5 text-muted-foreground" /></span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{conversation.title}</span>{conversation.updatedAt ? <span className="block text-[10px] text-muted-foreground">{conversation.updatedAt}</span> : null}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <>
            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-5 px-4 py-5">
                {messages.map((message) => (
                  <div key={message.id} className={cn("flex gap-2.5", message.role === "user" && "justify-end")}>
                    {message.role === "assistant" ? <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Bot className="size-3.5" /></span> : null}
                    <div className={cn("max-w-[82%] rounded-xl px-3 py-2.5 text-sm leading-5", message.role === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground")}>{message.content}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t border-border bg-background p-3">
              {files.length ? (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {files.map((file, index) => (
                    <span key={`${file.name}-${index}`} className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-1 text-[11px]">
                      <FileText className="size-3 shrink-0 text-muted-foreground" /><span className="max-w-40 truncate">{file.name}</span>
                      <button type="button" aria-label={`Remover ${file.name}`} className="text-muted-foreground hover:text-foreground" onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}><X className="size-3" /></button>
                    </span>
                  ))}
                  <button type="button" className="inline-flex items-center gap-1 px-1.5 text-[11px] text-muted-foreground hover:text-destructive" onClick={() => setFiles([])}><Trash2 className="size-3" />Limpar</button>
                </div>
              ) : null}

              <div className="rounded-xl border border-input bg-muted/20 p-2 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
                <Textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit() } }}
                  placeholder="Peça para criar, revisar ou analisar..."
                  aria-label="Mensagem para o assistente"
                  className="min-h-22 resize-none border-0 bg-transparent p-1.5 shadow-none focus-visible:ring-0 dark:bg-transparent"
                />
                <div className="mt-2 flex items-center gap-1.5">
                  <input ref={fileInputRef} type="file" multiple className="sr-only" onChange={(event) => setFiles((current) => [...current, ...Array.from(event.target.files ?? [])])} />
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Anexar arquivos" onClick={() => fileInputRef.current?.click()}><Paperclip /></Button>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger size="sm" className="min-w-0 max-w-38 border-0 bg-transparent px-2 shadow-none"><Sparkles className="size-3.5" /><SelectValue placeholder="Modelo" /></SelectTrigger>
                    <SelectContent align="start">{models.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={speed} onValueChange={(value) => setSpeed(value as AiChatSpeed)}>
                    <SelectTrigger size="sm" className="border-0 bg-transparent px-2 shadow-none"><Gauge className="size-3.5" /><SelectValue /></SelectTrigger>
                    <SelectContent align="end">{(Object.keys(speedLabels) as AiChatSpeed[]).map((value) => <SelectItem key={value} value={value}>{speedLabels[value]}</SelectItem>)}</SelectContent>
                  </Select>
                  <Button type="button" size="icon-sm" className="ml-auto" disabled={!prompt.trim()} aria-label="Enviar mensagem" onClick={submit}><Send /></Button>
                </div>
              </div>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">Enter para enviar · Shift + Enter para nova linha</p>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
