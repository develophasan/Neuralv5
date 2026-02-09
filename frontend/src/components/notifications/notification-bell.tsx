"use client"

import { Bell, X, Check, ExternalLink, CheckCheck, Trash2, RefreshCw } from 'lucide-react'
import { useNotifications } from '@/lib/realtime/notification-provider'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export function NotificationBell({ align = 'down', side = 'right' }: { align?: 'up' | 'down', side?: 'left' | 'right' }) {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch
  } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
      case 'warning':
        return 'text-orange-500'
      case 'success':
        return 'text-green-500'
      case 'ai_summary':
      case 'activity':
        return 'text-purple-500'
      default:
        return 'text-blue-500'
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Simdi'
    if (diffMins < 60) return `${diffMins} dk once`
    if (diffHours < 24) return `${diffHours} sa once`
    if (diffDays < 7) return `${diffDays} gun once`
    return date.toLocaleDateString('tr-TR')
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-muted transition-colors"
        data-testid="notification-bell"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: align === 'down' ? -10 : 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: align === 'down' ? -10 : 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`absolute ${side === 'right' ? 'right-0' : 'left-0'} ${align === 'down' ? 'top-full mt-2' : 'bottom-full mb-2'} w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border z-50 overflow-hidden`}
              style={{ maxHeight: 'calc(100vh - 120px)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Bildirimler</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                      {unreadCount} yeni
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => refetch()}
                    className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                    title="Yenile"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                      title="Tumunu okundu isaretle"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-[400px] overflow-y-auto">
                {isLoading && notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="h-6 w-6 mx-auto mb-2 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Yukleniyor...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Bildirim yok</p>
                    <p className="text-sm mt-1">Yeni bildirimleriniz burada gorunecek</p>
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 border-b hover:bg-muted/50 transition-colors ${!notification.isRead ? 'bg-primary/5' : ''
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Type indicator */}
                        <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${!notification.isRead ? getTypeIcon(notification.type).replace('text-', 'bg-') : 'bg-gray-300'
                          }`} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            {notification.actionUrl && (
                              <Link
                                href={notification.actionUrl}
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                onClick={() => {
                                  markAsRead(notification.id)
                                  setIsOpen(false)
                                }}
                              >
                                Detaylar <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}

                            <div className="flex-1" />

                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 hover:bg-muted rounded text-green-600"
                                title="Okundu isaretle"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 hover:bg-muted rounded text-red-500"
                              title="Sil"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t bg-muted/30">
                  <Link
                    href="/parent/notifications"
                    className="block text-center text-sm text-primary hover:underline font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Tum Bildirimleri Gor
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
