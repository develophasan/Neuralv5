import { prisma } from '@/lib/db/prisma'
import { AuditAction } from '@prisma/client'

export async function logAudit(params: {
    userId: string
    action: AuditAction
    entity: string
    entityId?: string
    details?: any
    ipAddress?: string
    userAgent?: string
}) {
    try {
        const { userId, action, entity, entityId, details, ipAddress, userAgent } = params

        await prisma.auditLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                details: details ? JSON.stringify(details) : null,
                ipAddress,
                userAgent,
            },
        })
    } catch (error) {
        console.error('Failed to log audit:', error)
    }
}
