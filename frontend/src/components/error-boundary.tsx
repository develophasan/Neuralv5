"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui"
import { AlertTriangle, RefreshCcw, Home } from "lucide-react"

interface Props {
    children?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
                        <AlertTriangle className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900 mb-2">Bir şeyler yanlış gitti</h2>
                    <p className="text-stone-500 mb-8 max-w-md mx-auto">
                        Beklenmedik bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin veya ana sayfaya dönün.
                    </p>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            className="rounded-xl px-6"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Sayfayı Yenile
                        </Button>
                        <Button
                            onClick={() => window.location.href = '/admin'}
                            className="rounded-xl px-8 shadow-lg shadow-primary/20"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Ana Sayfaya Dön
                        </Button>
                    </div>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-12 p-4 bg-stone-100 rounded-xl text-left max-w-2xl overflow-auto">
                            <p className="text-xs font-mono text-red-600 font-bold mb-2">Hata Detayı:</p>
                            <pre className="text-[10px] font-mono whitespace-pre-wrap">
                                {this.state.error?.toString()}
                            </pre>
                        </div>
                    )}
                </div>
            )
        }

        return this.props.children
    }
}
