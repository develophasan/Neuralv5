/**
 * Calculate Risk Profiles for all students
 * Usage: npx tsx scripts/calculate-risk-profiles.ts
 */

import { processAllRiskProfiles } from '../src/services/risk-engine'

async function main() {
  console.log('⚠️  Starting risk profile calculation...')
  
  // Check students first
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  
  const totalStudents = await prisma.student.count({ where: { isActive: true } })
  console.log(`📊 Found ${totalStudents} active students`)
  
  if (totalStudents === 0) {
    console.log('⚠️  No active students found. Run seed first: npm run db:seed')
    await prisma.$disconnect()
    return
  }
  
  await prisma.$disconnect()
  
  const result = await processAllRiskProfiles()
  
  console.log(`✅ Processed ${result.processed} students`)
  if (result.errors > 0) {
    console.log(`⚠️  ${result.errors} errors occurred`)
  }
  console.log('✨ Risk profile calculation complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })

