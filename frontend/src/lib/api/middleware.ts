// API Middleware Utilities
import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema } from 'zod'

// Request validation middleware
export function validateRequest<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error: any) {
    return {
      success: false,
      error: error.errors?.[0]?.message || 'Validation failed',
    }
  }
}

// Query parameter validation
export function getQueryParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries())
  
  // Convert string numbers to numbers
  const processedParams: any = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === 'true' || value === 'false') {
      processedParams[key] = value === 'true'
    } else if (!isNaN(Number(value)) && value !== '') {
      processedParams[key] = Number(value)
    } else {
      processedParams[key] = value
    }
  }

  return validateRequest(schema, processedParams)
}

// Body validation
export async function getBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json()
    return validateRequest(schema, body)
  } catch (error) {
    return { success: false, error: 'Invalid JSON body' }
  }
}

