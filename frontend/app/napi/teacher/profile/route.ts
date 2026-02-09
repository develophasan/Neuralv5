import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { handleApiError } from '@/lib/api/errors'
import { successResponse } from '@/lib/api/utils'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const teacherId = searchParams.get('teacherId')

        if (!teacherId) {
            return NextResponse.json({ success: false, error: 'Teacher ID required' }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id: teacherId },
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true,
                role: true,
            }
        })

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
        }

        return successResponse(user)
    } catch (error) {
        return handleApiError(error)
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { teacherId, fullName, email, phone, password } = await request.json()

        if (!teacherId) {
            return NextResponse.json({ success: false, error: 'Teacher ID required' }, { status: 400 })
        }

        const updateData: any = {
            fullName,
            email,
            phone,
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10)
        }

        const updatedUser = await prisma.user.update({
            where: { id: teacherId },
            data: updateData,
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true,
            }
        })

        return successResponse(updatedUser)
    } catch (error) {
        return handleApiError(error)
    }
}
