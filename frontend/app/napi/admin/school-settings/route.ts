import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { successResponse, errorResponse } from '@/lib/api/utils'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { logAudit } from '@/lib/api/audit'

export async function GET() {
    try {
        const settings = await (prisma as any).schoolSettings.findUnique({
            where: { id: 'singleton' }
        })

        if (!settings) {
            // Create default settings if not exists
            const defaultSettings = await (prisma as any).schoolSettings.create({
                data: {
                    id: 'singleton',
                    name: 'Harmoni OS',
                    primaryColor: '#3b82f6',
                    secondaryColor: '#64748b',
                    sidebarBg: '#0f172a',
                    sidebarBorder: '#1e293b',
                    pageBg: '#f1f5f9',
                    textPrimary: '#0f172a',
                    textSidebar: '#94a3b8',
                    themePalette: 'default'
                }
            })
            return successResponse(defaultSettings)
        }

        return successResponse(settings)
    } catch (error) {
        console.error('School settings fetch error:', error)
        return errorResponse('Okul ayarları yüklenirken hata oluştu', 500)
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'admin') {
            return errorResponse('Yetkisiz işlem', 403)
        }

        const body = await request.json()
        const {
            name,
            logoUrl,
            primaryColor,
            secondaryColor,
            sidebarBg,
            sidebarBorder,
            pageBg,
            textPrimary,
            textSidebar,
            themePalette,
            address,
            phone,
            email
        } = body

        const settings = await (prisma as any).schoolSettings.upsert({
            where: { id: 'singleton' },
            update: {
                name,
                logoUrl,
                primaryColor: primaryColor || '#3b82f6',
                secondaryColor: secondaryColor || '#64748b',
                sidebarBg: sidebarBg || '#0f172a',
                sidebarBorder: sidebarBorder || '#1e293b',
                pageBg: pageBg || '#f1f5f9',
                textPrimary: textPrimary || '#0f172a',
                textSidebar: textSidebar || '#94a3b8',
                themePalette: themePalette || 'default',
                address,
                phone,
                email
            },
            create: {
                id: 'singleton',
                name: name || 'Harmoni OS',
                logoUrl,
                primaryColor: primaryColor || '#3b82f6',
                secondaryColor: secondaryColor || '#64748b',
                sidebarBg: sidebarBg || '#0f172a',
                sidebarBorder: sidebarBorder || '#1e293b',
                pageBg: pageBg || '#f1f5f9',
                textPrimary: textPrimary || '#0f172a',
                textSidebar: textSidebar || '#94a3b8',
                themePalette: themePalette || 'default',
                address,
                phone,
                email
            }
        })

        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const userAgent = request.headers.get('user-agent') || 'unknown'

        // Log the action
        await logAudit({
            userId: session.user.id,
            action: 'update',
            entity: 'SchoolSettings',
            entityId: 'singleton',
            details: { name, primaryColor },
            ipAddress: ip,
            userAgent: userAgent
        })

        return successResponse(settings)
    } catch (error) {
        console.error('School settings update error:', error)
        return errorResponse('Okul ayarları güncellenirken hata oluştu', 500)
    }
}
