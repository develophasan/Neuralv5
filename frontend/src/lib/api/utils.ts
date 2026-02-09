// API Utility Functions
import { NextResponse } from 'next/server'
import { PaginationParams, PaginatedResponse } from './types'

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / params.limit)

  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
    },
  }
}

export function successResponse<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message,
  })
}

export function errorResponse(
  error: string,
  statusCode: number = 400,
  code?: string
) {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
    },
    { status: statusCode }
  )
}

