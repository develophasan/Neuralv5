import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

// Initialize AI client - API key must be in .env file
if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set in environment variables')
}

const ai = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })
  : null

// AI Assistant for Teachers and Parents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { role, message, context } = body

    if (!role || !message) {
      return NextResponse.json(
        { error: 'role and message are required' },
        { status: 400 }
      )
    }

    let systemPrompt = ''

    if (role === 'teacher') {
      systemPrompt = `Sen Harmoni Anaokulu için öğretmen asistanısın. Öğretmenlere nörogelişimsel aktivite önerileri, çocuk gelişimi hakkında bilgi ve eğitim desteği sağlıyorsun. Türkçe, samimi ve profesyonel bir dille konuşuyorsun.`
    } else if (role === 'parent') {
      systemPrompt = `Sen Harmoni Anaokulu için veli koçusun. Velilere çocuk gelişimi, davranış yönetimi ve evde yapılabilecek aktiviteler hakkında nörobilim temelli öneriler sunuyorsun. Türkçe, sıcak ve destekleyici bir dille konuşuyorsun.`
    } else {
      return NextResponse.json(
        { error: 'Invalid role. Must be "teacher" or "parent"' },
        { status: 400 }
      )
    }

    // Gemini API doesn't support system messages, so we prepend it to the user message
    const userMessage = context
      ? `${systemPrompt}\n\nBağlam: ${context}\n\nSoru: ${message}`
      : `${systemPrompt}\n\nSoru: ${message}`

    if (!ai) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured. Please set it in your .env file.' },
        { status: 500 }
      )
    }

    const config = {
      thinkingConfig: {
        thinkingBudget: 0,
      },
    }

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      config,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: userMessage,
            },
          ],
        },
      ],
    })

    // Extract text from response
    let aiResponse = ''
    if (response.text) {
      aiResponse = response.text
    } else if (response.candidates && response.candidates[0]?.content?.parts) {
      aiResponse = response.candidates[0].content.parts
        .map((part: any) => part.text || '')
        .join('')
    }

    return NextResponse.json({
      response: aiResponse,
      role,
    })
  } catch (error) {
    console.error('Error in AI assistant:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}

