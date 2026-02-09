import { z } from 'zod'

// Common schemas
export const emailSchema = z.string().email('Gecerli bir email adresi girin')
export const passwordSchema = z.string().min(6, 'Sifre en az 6 karakter olmali')
export const phoneSchema = z.string().regex(/^[0-9+\-\s()]*$/, 'Gecerli bir telefon numarasi girin').optional().or(z.literal(''))

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})
export type LoginInput = z.infer<typeof loginSchema>

// User schemas
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: z.string().min(2, 'Ad soyad en az 2 karakter olmali'),
  role: z.enum(['admin', 'teacher', 'parent']),
  phone: phoneSchema,
})
export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = createUserSchema.partial().omit({ password: true })
export type UpdateUserInput = z.infer<typeof updateUserSchema>

// Student schemas
export const createStudentSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmali'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmali'),
  dateOfBirth: z.string().min(1, 'Dogum tarihi zorunlu'),
  gender: z.enum(['male', 'female', 'other']),
  enrollmentDate: z.string().optional(),
  photoUrl: z.string().url('Gecerli bir URL girin').optional().or(z.literal('')),
})
export type CreateStudentInput = z.infer<typeof createStudentSchema>

export const updateStudentSchema = createStudentSchema.partial()
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>

// Class schemas
export const createClassSchema = z.object({
  name: z.string().min(2, 'Sinif adi en az 2 karakter olmali'),
  ageGroup: z.string().min(1, 'Yas grubu zorunlu'),
  capacity: z.number().min(1, 'Kapasite en az 1 olmali').max(50, 'Kapasite en fazla 50 olabilir'),
  academicYear: z.string().optional(),
})
export type CreateClassInput = z.infer<typeof createClassSchema>

export const updateClassSchema = createClassSchema.partial()
export type UpdateClassInput = z.infer<typeof updateClassSchema>

// Assessment schemas
export const assessmentScoreSchema = z.object({
  domainId: z.string().min(1, 'Alan secimi zorunlu'),
  score: z.number().min(1, 'Puan en az 1').max(5, 'Puan en fazla 5').nullable(),
  notes: z.string().optional(),
})

export const createAssessmentSchema = z.object({
  studentId: z.string().min(1, 'Ogrenci secimi zorunlu'),
  assessmentDate: z.string().min(1, 'Tarih zorunlu'),
  notes: z.string().optional(),
  scores: z.array(assessmentScoreSchema).min(1, 'En az bir alan degerlendirmesi yapin'),
})
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>

// Daily log schemas
export const dailyLogSchema = z.object({
  studentId: z.string().min(1, 'Ogrenci secimi zorunlu'),
  logDate: z.string().min(1, 'Tarih zorunlu'),
  mealType: z.enum(['breakfast', 'lunch', 'snack']).optional(),
  mealAmount: z.enum(['none', 'little', 'half', 'most', 'all']).optional(),
  sleepDuration: z.number().min(0).max(180).optional(),
  sleepQuality: z.enum(['poor', 'fair', 'good', 'excellent']).optional(),
  notes: z.string().optional(),
})
export type DailyLogInput = z.infer<typeof dailyLogSchema>

// Mood tracker schema
export const moodTrackerSchema = z.object({
  studentId: z.string().min(1, 'Ogrenci secimi zorunlu'),
  date: z.string().min(1, 'Tarih zorunlu'),
  mood: z.enum(['very_sad', 'sad', 'neutral', 'happy', 'very_happy']),
  energyLevel: z.number().min(1).max(5).optional(),
  socialInteraction: z.enum(['isolated', 'minimal', 'moderate', 'active', 'very_active']).optional(),
  notes: z.string().optional(),
})
export type MoodTrackerInput = z.infer<typeof moodTrackerSchema>

// Notification schema
export const createNotificationSchema = z.object({
  recipientId: z.string().min(1, 'Alici secimi zorunlu'),
  type: z.enum(['info', 'success', 'warning', 'alert', 'ai_summary', 'activity']),
  title: z.string().min(2, 'Baslik en az 2 karakter olmali'),
  message: z.string().min(5, 'Mesaj en az 5 karakter olmali'),
  studentId: z.string().optional(),
  actionUrl: z.string().optional(),
})
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>

// Helper function to validate and get errors
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  const errors: Record<string, string> = {}
  result.error.issues.forEach((err) => {
    const path = err.path.join('.')
    if (!errors[path]) {
      errors[path] = err.message
    }
  })
  
  return { success: false, errors }
}
