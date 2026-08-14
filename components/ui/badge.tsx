import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-none border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        info: "border-transparent bg-nsw-info-bg text-nsw-info shadow-sm hover:bg-nsw-info-bg/80 dark:bg-nsw-info-bg dark:text-nsw-blue",
        warning: "border-transparent bg-amber-100 text-amber-900 shadow-sm hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200",
        success: "border-transparent bg-green-500 text-white shadow hover:bg-green-600 dark:bg-green-600",
        danger: "border-transparent bg-red-500 text-white shadow hover:bg-red-600 dark:bg-red-600",
        grade4: "border-transparent bg-status-grade4 text-white hover:bg-status-grade4/90",
        grade3: "border-transparent bg-status-grade3 text-white hover:bg-status-grade3/90",
        grade2: "border-transparent bg-status-grade2 text-slate-950 hover:bg-status-grade2/90",
        grade1: "border-transparent bg-status-grade1 text-white hover:bg-status-grade1/90",
        ungraded: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
