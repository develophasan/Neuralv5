"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp, Minus, LucideIcon } from "lucide-react"

interface MetricCardProps {
    title: string
    value: string | number
    trend?: "up" | "down" | "neutral"
    trendValue?: string
    icon?: LucideIcon
    color?: "blue" | "green" | "purple" | "orange" | "pink" | "emerald" | "amber"
    data?: number[]
    delay?: number
}

const colorMap = {
    blue: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    green: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    purple: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    orange: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    amber: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    pink: "bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
}

export function MetricCard({
    title,
    value,
    trend,
    trendValue,
    icon: Icon,
    color = "blue",
    delay = 0
}: MetricCardProps) {
    return (
        <GlassCard delay={delay} hoverEffect className="flex flex-col justify-between">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                </div>
                {Icon && (
                    <div className={cn("rounded-2xl p-3", colorMap[color])}>
                        <Icon className="h-6 w-6" />
                    </div>
                )}
            </div>

            {trend && trendValue && (
                <div className="mt-4 flex items-center gap-2">
                    <div className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                        trend === "up"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : trend === "down"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                    )}>
                        {trend === "up" ? <ArrowUp className="h-3 w-3" /> : trend === "down" ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        {trendValue}
                    </div>
                </div>
            )}
        </GlassCard>
    )
}
