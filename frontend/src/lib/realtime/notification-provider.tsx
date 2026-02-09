"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useToast } from '@/components/ui/toaster'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  studentId?: string
  actionUrl?: string
  createdAt: string
  isRead: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  refetch: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ 
  children, 
  userId 
}: { 
  children: ReactNode
  userId?: string 
}) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastFetchedIds, setLastFetchedIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId) return

    try {
      const res = await fetch(`/napi/notifications?recipientId=${userId}&limit=50`)
      if (!res.ok) throw new Error('Failed to fetch')
      
      const data = await res.json()
      const newNotifications = data.data || []
      
      // Check for new notifications to show toast
      const currentIds = new Set(notifications.map(n => n.id))
      newNotifications.forEach((n: Notification) => {
        if (!currentIds.has(n.id) && !lastFetchedIds.has(n.id) && !n.isRead) {
          // New notification - show toast
          toast({
            title: n.title,
            description: n.message,
            variant: n.type === 'alert' || n.type === 'warning' ? 'warning' : 'default',
          })
        }
      })
      
      setLastFetchedIds(new Set(newNotifications.map((n: Notification) => n.id)))
      setNotifications(newNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [userId, notifications, lastFetchedIds, toast])

  // Initial fetch
  useEffect(() => {
    if (userId) {
      setIsLoading(true)
      fetchNotifications().finally(() => setIsLoading(false))
    }
  }, [userId])

  // Polling every 30 seconds
  useEffect(() => {
    if (!userId) return
    
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [userId, fetchNotifications])

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      await fetch(`/napi/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      })
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter(n => !n.isRead)
          .map(n => fetch(`/napi/notifications/${n.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isRead: true }),
          }))
      )
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/napi/notifications/${id}`, {
        method: 'DELETE',
      })
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refetch: fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    return {
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      markAsRead: async () => {},
      markAllAsRead: async () => {},
      deleteNotification: async () => {},
      refetch: async () => {},
    }
  }
  return context
}
