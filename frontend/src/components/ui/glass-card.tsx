"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

import { HTMLMotionProps } from "framer-motion"

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode
    className?: string
    hoverEffect?: boolean
    delay?: number
}

export function GlassCard({
    children,
    className,
    hoverEffect = false,
    delay = 0,
    ...props
}: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay * 0.1 }}
            className={cn(
                "relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:bg-black/40",
                hoverEffect && "transition-transform hover:-translate-y-1 hover:shadow-2xl",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 dark:from-white/10" />
            <div className="relative z-10">{children}</div>
        </motion.div>
    )
}
