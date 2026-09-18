"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn("fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px] data-[state=open]:animate-suhdo-fade-in", className)}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  size = "default",
  overlayClassName,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  size?: "sm" | "default" | "lg" | "xl" | "full"
  overlayClassName?: string
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-size={size}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100svh-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-0 overflow-hidden rounded-xl bg-background text-sm shadow-xl ring-1 ring-foreground/10 outline-none sm:data-[size=default]:max-w-md sm:data-[size=sm]:max-w-sm sm:data-[size=lg]:max-w-2xl sm:data-[size=xl]:max-w-5xl data-[size=full]:h-[calc(100svh-1rem)] data-[size=full]:max-h-none data-[size=full]:max-w-[calc(100%-1rem)] sm:data-[size=full]:h-[min(92svh,56rem)] sm:data-[size=full]:max-w-[min(96vw,76rem)] data-[state=open]:animate-suhdo-fade-in",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon-sm" className="absolute top-3 right-3 z-10">
              <XIcon />
              <span className="sr-only">Fechar</span>
            </Button>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn("flex shrink-0 flex-col gap-1.5 border-b border-border px-5 py-4 pr-12", className)} {...props} />
}

function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-body" className={cn("min-h-0 overflow-y-auto px-5 py-4", className)} {...props} />
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dialog-footer" className={cn("flex shrink-0 flex-col-reverse gap-2 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:justify-end", className)} {...props} />
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-lg font-semibold tracking-tight", className)} {...props} />
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-sm leading-6 text-muted-foreground", className)} {...props} />
}

export { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger }
