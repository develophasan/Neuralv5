// Veritabanı tipleri (Prisma schema'dan generate edilebilir)

export type UserRole = 'admin' | 'teacher' | 'parent'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender?: 'male' | 'female' | 'other'
  photo_url?: string
  enrollment_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Class {
  id: string
  name: string
  age_group: string
  capacity: number
  current_enrollment: number
  academic_year: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DevelopmentDomain {
  id: string
  code: string
  name_tr: string
  name_en: string
  description?: string
  icon_name: string
  color: string
}

export interface Assessment {
  id: string
  student_id: string
  assessed_by: string
  assessment_date: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface AssessmentScore {
  id: string
  assessment_id: string
  domain_id: string
  score?: number // 1-5
  percentage?: number // 0-100
  observation_notes?: string
  created_at: string
}

export interface Activity {
  id: string
  title: string
  description?: string
  domain_id: string
  age_min: number
  age_max: number
  duration_minutes?: number
  materials_needed?: string[]
  instructions?: string
  difficulty_level: number
  image_url?: string
  video_url?: string
  is_active: boolean
}

export interface ActivityRecommendation {
  id: string
  student_id: string
  activity_id: string
  domain_id: string
  reason?: string
  threshold_score?: number
  current_score?: number
  recommended_to: 'teacher' | 'parent' | 'both'
  status: 'pending' | 'accepted' | 'completed' | 'dismissed'
  recommended_at: string
  completed_at?: string
}

