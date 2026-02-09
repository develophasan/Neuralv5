import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
    try {
        const { text, studentId } = await request.json()

        if (!text) {
            return NextResponse.json({ success: false, error: 'Text is required' }, { status: 400 })
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

        const prompt = `
      You are an expert child development psychologist and data analyst.
      Analyze the following observation note about a student and extract structured data.
      
      Observation: "${text}"
      
      Output JSON format:
      {
        "mood": "happy" | "sad" | "anxious" | "calm" | "neutral" | "energetic",
        "assessments": [
          {
            "domain": "social_emotional" | "language_communication" | "cognitive_flexibility" | "motor_skills",
            "score": 1 (Need Support) | 3 (Developing) | 5 (Good),
            "reason": "Short explanation"
          }
        ],
        "summary": "One sentence professional summary"
      }
      
      Only return valid JSON. No markdown.
    `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const textResponse = response.text()

        // Clean markdown if present
        const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim()
        const data = JSON.parse(cleanedText)

        return NextResponse.json({ success: true, data })

    } catch (error: any) {
        console.error('NLP Insight Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
