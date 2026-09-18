import * as React from "react"

import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AppHeaderActionButton({ className, size, ...props }: ButtonProps) {
  void size
  return <Button size="sm" className={cn("h-7 gap-1.5 px-2.5 text-[11px] font-medium [&_svg]:!size-3.5", className)} {...props} />
}
