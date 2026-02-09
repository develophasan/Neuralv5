import { Class, Student, ActivityRecommendation, DevelopmentDomain } from "@/types/database"

export interface ClassWithStudents extends Class {
  students: Student[]
  student_count: number
}

export interface NeuroActivityOfDay {
  activity: ActivityRecommendation & {
    activity_details?: {
      title: string
      description?: string
      domain: DevelopmentDomain
    }
  }
  student: Student
  priority: 'high' | 'medium' | 'low'
}

export interface DashboardStats {
  total_students: number
  total_classes: number
  pending_assessments: number
  pending_activities: number
}

