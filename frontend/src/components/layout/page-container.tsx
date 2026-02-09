"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PageContainerProps {
    children: React.ReactNode
    className?: string
    title?: string
    description?: string
    actions?: React.ReactNode
}

export function PageContainer({
    children,
    className,
    title,
    description,
    actions
}: PageContainerProps) {
    return (
        <div className={cn("min-h-screen bg-stone-50/50 p-6 md:p-8", className)}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mx-auto max-w-7xl space-y-8"
            >
                {(title || actions) && (
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            {title && (
                                <h1 className="text-4xl font-heading font-bold tracking-tight text-foreground">
                                    {title}
                                </h1>
                            )}
                            {description && (
                                <p className="text-lg text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                        {actions && (
                            <div className="flex items-center gap-3">
                                {actions}
                            </div>
                        )}
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {children}
                </motion.div>
            </motion.div>
        </div>
    )
}
