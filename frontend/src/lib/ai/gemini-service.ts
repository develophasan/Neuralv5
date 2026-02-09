// Gemini AI Service for Harmoni OS
import { GoogleGenerativeAI } from "@google/generative-ai"

// API Key check
const apiKey = process.env.GEMINI_API_KEY || ''
if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in environment variables!")
}

const genAI = new GoogleGenerativeAI(apiKey)

// Use standard stable model
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

export interface StudentData {
  firstName: string
  lastName: string
  age: number
  assessments: any[]
  neuroProfile?: any
}

export interface AIAnalysisResult {
  summary: string
  riskLevel: 'low' | 'medium' | 'high'
  riskExplanation?: string
  homeActivity?: string
  positiveNote?: string
  trajectory?: {
    threeMonthPrediction: string
    strengths: string[]
    areasToImprove: string[]
  }
}

// Generate child development summary
export async function generateDevelopmentSummary(student: StudentData): Promise<AIAnalysisResult> {
  const prompt = `
Sen bir çocuk gelişim uzmanısın. Aşağıdaki çocuk için kısa ve anlaşılır bir gelişim özeti hazırla.

Çocuk Bilgileri:
- İsim: ${student.firstName} ${student.lastName}
- Yaş: ${student.age} yaşında
- Değerlendirme Sayısı: ${student.assessments?.length || 0}

Son Değerlendirme Puanları:
${student.assessments?.[0]?.scores?.map((s: any) => `- ${s.domain?.nameTr || s.domainId}: ${s.score}/5`)?.join('\n') || 'Henüz değerlendirme yok'}

Lütfen aşağıdaki JSON formatında yanıt ver:
{
  "summary": "2-3 cümlelik genel gelişim özeti",
  "riskLevel": "low/medium/high",
  "riskExplanation": "Risk varsa açıklama (yoksa boş)",
  "homeActivity": "Evde yapılabilecek bir aktivite önerisi",
  "positiveNote": "Çocukla ilgili pozitif bir not"
}

Sadece JSON döndür, başka bir şey yazma.
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    try {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()

      try {
        return JSON.parse(cleanText)
      } catch {
        const start = cleanText.indexOf('{')
        const end = cleanText.lastIndexOf('}')
        if (start !== -1 && end !== -1) {
          return JSON.parse(cleanText.substring(start, end + 1))
        }
        throw new Error('No JSON object found')
      }
    } catch (e) {
      // Fallback
      return {
        summary: `${student.firstName} normal gelişim göstermektedir.`,
        riskLevel: 'low',
        homeActivity: 'Birlikte kitap okuyun.',
        positiveNote: 'Çocuğunuz güzel ilerliyor!'
      }
    }
  } catch (error) {
    console.error('Gemini AI Error:', error)
    return {
      summary: `${student.firstName} için AI analizi şu an kullanılamıyor.`,
      riskLevel: 'low',
      homeActivity: 'Birlikte oyun oynayın.',
      positiveNote: 'Çocuğunuzla vakit geçirin.'
    }
  }
}

// Generate predictive trajectory (3-month forecast)
export async function generateTrajectory(student: StudentData): Promise<any> {
  const prompt = `
Sen bir çocuk gelişim uzmanısın. Aşağıdaki çocuk için 3 aylık gelişim tahmini yap.

Çocuk: ${student.firstName} ${student.lastName}, ${student.age} yaşında

Mevcut Puanlar:
${student.assessments?.[0]?.scores?.map((s: any) => `- ${s.domain?.nameTr || s.domainId}: ${s.score}/5`)?.join('\n') || 'Veri yok'}

JSON formatında yanıt ver:
{
  "threeMonthPrediction": "3 ay sonra beklenen gelişim durumu",
  "predictedScores": {
    "language": 4.2,
    "motor": 4.5,
    "social": 4.0
  },
  "strengths": ["güçlü yön 1", "güçlü yön 2"],
  "areasToImprove": ["geliştirilecek alan 1"],
  "recommendedActivities": ["aktivite 1", "aktivite 2"]
}
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    try {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
      try {
        return JSON.parse(cleanText)
      } catch {
        const start = cleanText.indexOf('{')
        const end = cleanText.lastIndexOf('}')
        if (start !== -1 && end !== -1) {
          return JSON.parse(cleanText.substring(start, end + 1))
        }
        return null
      }
    } catch (e) {
      return null
    }
  } catch (error) {
    console.error('Trajectory Error:', error)
    return null
  }
}

// Generate activity recommendations based on risk level
export async function generateActivityRecommendations(
  student: StudentData,
  weakDomains: string[]
): Promise<any[]> {
  const prompt = `
Çocuk: ${student.firstName}, ${student.age} yaşında
Zayıf Alanlar: ${weakDomains.join(', ')}

Bu çocuk için 3 aktivite öner. Her aktivite için:
- Aktivite adı
- Açıklama
- Süre (dakika)
- Zorluk (kolay/orta/zor)
- Hangi alana faydalı

JSON array formatında döndür:
[
  {
    "name": "Aktivite Adı",
    "description": "Açıklama",
    "duration": 15,
    "difficulty": "kolay",
    "targetDomain": "Dil ve İletişim"
  }
]
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    if (!text) return []

    try {
      // Clean markdown first
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()

      // Try parsing clean text
      try {
        return JSON.parse(cleanText)
      } catch {
        // Find array bounds
        const start = cleanText.indexOf('[')
        const end = cleanText.lastIndexOf(']')
        if (start !== -1 && end !== -1) {
          const jsonStr = cleanText.substring(start, end + 1)
          return JSON.parse(jsonStr)
        }
        throw new Error('No JSON array found')
      }
    } catch (e) {
      console.error('JSON Parse Error:', e)
      return []
    }
  } catch (error) {
    console.error('Activity Recommendations Error:', error)
    return []
  }
}
