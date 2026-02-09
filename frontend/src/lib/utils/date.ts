// Date formatting utilities for Turkish locale
// Safe date formatting that works in both server and client

export function formatDate(date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '-'
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return '-'
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    
    // Use 'tr' instead of 'tr-TR' for better compatibility
    return d.toLocaleDateString('tr', options || defaultOptions)
  } catch {
    return '-'
  }
}

export function formatDateShort(date: Date | string | null | undefined): string {
  return formatDate(date, { month: 'short', day: 'numeric' })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return '-'
    
    return d.toLocaleDateString('tr', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return '-'
    
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 1) return 'Simdi'
    if (diffMins < 60) return `${diffMins} dk once`
    if (diffHours < 24) return `${diffHours} sa once`
    if (diffDays < 7) return `${diffDays} gun once`
    
    return formatDateShort(d)
  } catch {
    return '-'
  }
}

// Age calculator
export function calculateAge(birthDate: Date | string | null | undefined): number {
  if (!birthDate) return 0
  
  try {
    const d = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
    if (isNaN(d.getTime())) return 0
    
    const today = new Date()
    let age = today.getFullYear() - d.getFullYear()
    const monthDiff = today.getMonth() - d.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
      age--
    }
    
    return age
  } catch {
    return 0
  }
}
