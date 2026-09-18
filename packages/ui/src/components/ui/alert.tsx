import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative grid w-full gap-0.5 rounded-lg border px-4 py-3 text-left text-sm has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        success: "border-success/30 bg-success/6 text-success",
        warning: "border-warning/30 bg-warning/6 text-warning",
        info: "border-info/30 bg-info/6 text-info",
        destructive: "border-destructive/30 bg-destructive/6 text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

function Alert({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("font-medium", className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm text-current/80 has-[a]:underline has-[a]:underline-offset-3", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
