"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type ConfirmOptions = {
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

export type PromptOptions = {
  title: string
  description?: React.ReactNode
  label?: string
  placeholder?: string
  defaultValue?: string
  confirmLabel?: string
  cancelLabel?: string
  allowEmpty?: boolean
}

type PendingDialog =
  | { kind: "confirm"; options: ConfirmOptions; resolve: (result: boolean) => void }
  | { kind: "prompt"; options: PromptOptions; resolve: (result: string | null) => void }

type DialogsApi = {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  prompt: (options: PromptOptions) => Promise<string | null>
}

const DialogsContext = React.createContext<DialogsApi | null>(null)

export function DialogsProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = React.useState<PendingDialog | null>(null)
  const [value, setValue] = React.useState("")

  function confirm(options: ConfirmOptions) {
    return new Promise<boolean>((resolve) => setPending({ kind: "confirm", options, resolve }))
  }

  function prompt(options: PromptOptions) {
    setValue(options.defaultValue ?? "")
    return new Promise<string | null>((resolve) => setPending({ kind: "prompt", options, resolve }))
  }

  function settle(result: boolean | string | null) {
    if (!pending) return
    if (pending.kind === "confirm") pending.resolve(result === true)
    else pending.resolve(typeof result === "string" ? result : null)
    setPending(null)
  }

  const options = pending?.options
  const canSubmit = pending?.kind !== "prompt" || pending.options.allowEmpty || value.trim().length > 0

  return (
    <DialogsContext.Provider value={{ confirm, prompt }}>
      {children}
      <Dialog open={pending !== null} onOpenChange={(open) => !open && settle(pending?.kind === "confirm" ? false : null)}>
        <DialogContent
          size="default"
          showCloseButton={false}
          className="z-[10051]"
          overlayClassName="z-[10050]"
          {...(options?.description ? {} : { "aria-describedby": undefined })}
        >
          <DialogHeader>
            <DialogTitle>{options?.title ?? ""}</DialogTitle>
            {options?.description ? <DialogDescription>{options.description}</DialogDescription> : null}
          </DialogHeader>
          {pending?.kind === "prompt" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (canSubmit) settle(value)
              }}
            >
              <DialogBody className="grid gap-2">
                {pending.options.label ? <Label htmlFor="suhdo-prompt-value">{pending.options.label}</Label> : null}
                <Input
                  id="suhdo-prompt-value"
                  autoFocus
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder={pending.options.placeholder}
                />
              </DialogBody>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => settle(null)}>{pending.options.cancelLabel ?? "Cancelar"}</Button>
                <Button type="submit" disabled={!canSubmit}>{pending.options.confirmLabel ?? "Confirmar"}</Button>
              </DialogFooter>
            </form>
          ) : (
            <DialogFooter>
              <Button variant="ghost" onClick={() => settle(false)}>{pending?.options.cancelLabel ?? "Cancelar"}</Button>
              <Button variant={pending?.options.danger ? "destructive" : "default"} onClick={() => settle(true)}>{pending?.options.confirmLabel ?? "Confirmar"}</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </DialogsContext.Provider>
  )
}

function useDialogs() {
  const context = React.useContext(DialogsContext)
  if (!context) throw new Error("useConfirm/usePrompt require DialogsProvider")
  return context
}

export function useConfirm() {
  return useDialogs().confirm
}

export function usePrompt() {
  return useDialogs().prompt
}
