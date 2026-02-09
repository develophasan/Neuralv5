// API Request/Response Types
import { z } from 'zod'

// Common Pagination
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

export type PaginationParams = z.infer<typeof PaginationSchema>

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Common API Response
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Common Error Response
export interface ApiError {
  success: false
  error: string
  code?: string
  details?: Record<string, any>
}

