// Centralized Validation Schemas
import { z } from 'zod'

// User Validations
export const UserRoleSchema = z.enum(['admin', 'teacher', 'parent'])

export const CreateUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(100),
  role: UserRoleSchema,
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

export const UpdateUserSchema = CreateUserSchema.partial()

// Student Validations
export const CreateStudentSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  dateOfBirth: z.string().or(z.date()),
  gender: z.enum(['male', 'female', 'other']).optional(),
  photoUrl: z.string().url().optional(),
  enrollmentDate: z.string().or(z.date()).optional(),
})

export const UpdateStudentSchema = CreateStudentSchema.partial()

// Class Validations
export const CreateClassSchema = z.object({
  name: z.string().min(1).max(100),
  ageGroup: z.string().regex(/^\d+-\d+$/), // Format: "3-4"
  capacity: z.number().int().positive().max(30),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/), // Format: "2024-2025"
})

export const UpdateClassSchema = CreateClassSchema.partial()

// Assessment Validations
export const CreateAssessmentSchema = z.object({
  studentId: z.string().uuid(),
  assessedBy: z.string().uuid(),
  assessmentDate: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
})

export const AssessmentScoreSchema = z.object({
  domainId: z.string().uuid(),
  score: z.number().int().min(1).max(5).optional(),
  percentage: z.number().int().min(0).max(100).optional(),
  observationNotes: z.string().optional(),
})

export const CreateAssessmentWithScoresSchema = CreateAssessmentSchema.extend({
  scores: z.array(AssessmentScoreSchema).min(1),
})

// Activity Validations
export const CreateActivitySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  domainId: z.string().uuid(),
  ageMin: z.number().int().min(2).max(6),
  ageMax: z.number().int().min(2).max(6),
  durationMinutes: z.number().int().positive().optional(),
  materialsNeeded: z.array(z.string()).optional(),
  instructions: z.string().optional(),
  difficultyLevel: z.number().int().min(1).max(5),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
})

export const UpdateActivitySchema = CreateActivitySchema.partial()

// Daily Log Validations
export const CreateDailyLogSchema = z.object({
  studentId: z.string().uuid(),
  classId: z.string().uuid(),
  logDate: z.string().or(z.date()),
  breakfastEaten: z.boolean().optional(),
  lunchEaten: z.boolean().optional(),
  snackEaten: z.boolean().optional(),
  mealNotes: z.string().optional(),
  napStartTime: z.string().optional(),
  napEndTime: z.string().optional(),
  napDurationMinutes: z.number().int().optional(),
  sleepQuality: z.enum(['good', 'restless', 'difficult']).optional(),
  toiletVisits: z.number().int().min(0).default(0),
  accidents: z.number().int().min(0).default(0),
  toiletNotes: z.string().optional(),
  generalNotes: z.string().optional(),
})

// ID Parameter Validation
export const IdParamSchema = z.object({
  id: z.string().uuid(),
})

