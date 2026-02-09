import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { successResponse, errorResponse } from '@/lib/api/utils'

export async function GET(request: NextRequest) {
    try {
        // AuditLog has 'timestamp' instead of 'createdAt' in this schema version
        const logs = await (prisma.auditLog.findMany as any)({
            orderBy: { timestamp: 'desc' },
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true
                    }
                }
            }
        })

        const exportData = logs.map((log: any) => ({
            ...log,
            userName: log.user?.fullName,
            userEmail: log.user?.email
        }))

        return new NextResponse(JSON.stringify(exportData, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': 'attachment; filename=audit-logs.json'
            }
        })
    } catch (error) {
        console.error('Audit export error:', error)
        return errorResponse('Loglar dışa aktarılırken hata oluştu', 500)
    }
}
