import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-card border-foreground h-12 w-full min-w-0 border-[3px] bg-transparent px-4 py-2 text-base transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-none",
        "focus-visible:shadow-[4px_4px_0_0_var(--color-primary)] focus-visible:-translate-y-1 focus-visible:-translate-x-1 focus-visible:border-primary",
        "aria-invalid:border-destructive aria-invalid:shadow-[4px_4px_0_0_var(--color-destructive)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
