import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const cardVariants = cva(
  "rounded-none border bg-card text-card-foreground",
  {
    variants: {
      elevation: {
        flat: "",
        raised: "shadow-sm",
      },
    },
    defaultVariants: {
      elevation: "flat",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ className, elevation, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ elevation, className }))}
    {...props}
  />
))
Card.displayName = "Card"

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean
}

const CardHeader = React.forwardRef<
  HTMLDivElement,
  CardHeaderProps
>(({ className, bordered = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-4 sm:p-5 lg:p-6",
      bordered && "pb-3 border-b border-border",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

type CardTitleProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType
}

const CardTitle = React.forwardRef<
  HTMLElement,
  CardTitleProps
>(({ className, as: Component = "div", ...props }, ref) => (
  <Component
    ref={ref}
    className={cn("text-base font-semibold leading-none tracking-tight text-primary dark:text-foreground", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 sm:p-5 lg:p-6", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-4 sm:p-5 lg:p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants }

