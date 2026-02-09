import * as React from "react"
import { cn } from "./utils"

interface AlertCardProps extends React.HTMLAttributes<HTMLDivElement> {
  severity?: "low" | "medium" | "high"
  title?: string
  message?: string
}

const AlertCard = React.forwardRef<HTMLDivElement, AlertCardProps>(
  ({ className, severity = "low", title, message, children, ...props }, ref) => {
    const severityStyles = {
      low: "alert-card-amber border-l-amber-500",
      medium: "alert-card-amber border-l-amber-500",
      high: "alert-card-red border-l-red-500",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl shadow-xl bg-card text-card-foreground p-6",
          "border-l-4",
          severity === "high" ? "border-l-red-500" : "border-l-amber-500",
          className
        )}
        {...props}
      >
        {title && (
          <h3 className="text-lg font-heading font-semibold mb-2">{title}</h3>
        )}
        {message && (
          <p className="text-sm text-muted-foreground">{message}</p>
        )}
        {children}
      </div>
    )
  }
)
AlertCard.displayName = "AlertCard"

export { AlertCard }

