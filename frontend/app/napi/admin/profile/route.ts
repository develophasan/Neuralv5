import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { successResponse } from '@/lib/api/utils'
import bcrypt from 'bcryptjs'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            phone: true,
            avatarUrl: true,
        },
    })

    return successResponse(user)
}

export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { fullName, phone, avatarUrl, currentPassword, newPassword } = body

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const updateData: any = {}
        if (fullName) updateData.fullName = fullName
        if (phone !== undefined) updateData.phone = phone
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl

        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Mevcut şifre gerekli' }, { status: 400 })
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password || '')
            if (!isPasswordValid) {
                return NextResponse.json({ error: 'Mevcut şifre hatalı' }, { status: 400 })
            }

            updateData.password = await bcrypt.hash(newPassword, 10)
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                phone: true,
                avatarUrl: true,
            },
        })

        return successResponse(updatedUser)
    } catch (error) {
        console.error('Update profile error:', error)
        return NextResponse.json({ error: 'Güncelleme başarısız oldu' }, { status: 500 })
    }
}
