/**
 * Calculate Z-Profiles for all students
 * Usage: npx tsx scripts/calculate-z-profiles.ts
 */

import { processAllZProfiles, initializeAgeNorms } from '../src/services/z-score-engine'

async function main() {
  console.log('📊 Starting Z-profile calculation...')
  
  // Initialize age norms if needed
  console.log('1️⃣ Initializing age norms...')
  await initializeAgeNorms()
  console.log('✅ Age norms ready')
  
  // Check students first
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  
  const totalStudents = await prisma.student.count({ where: { isActive: true } })
  const studentsWithProfile = await prisma.student.count({
    where: { 
      isActive: true,
      neuroProfile: { isNot: null }
    }
  })
  
  console.log(`📊 Found ${totalStudents} active students`)
  console.log(`📊 ${studentsWithProfile} students have neuro profiles`)
  
  if (totalStudents === 0) {
    console.log('⚠️  No active students found. Run seed first: npm run db:seed')
    await prisma.$disconnect()
    return
  }
  
  if (studentsWithProfile === 0) {
    console.log('⚠️  No students with neuro profiles. Creating profiles first...')
    // Create basic profiles for students without them
    const students = await prisma.student.findMany({
      where: { isActive: true, neuroProfile: null },
      take: 10,
    })
    
    for (const student of students) {
      await prisma.childNeuroProfile.create({
        data: {
          studentId: student.id,
          executiveScore: 50,
          languageScore: 50,
          emotionalScore: 50,
          grossMotorScore: 50,
          fineMotorScore: 50,
          logicScore: 50,
          creativeScore: 50,
          spatialScore: 50,
          discoveryScore: 50,
          independenceScore: 50,
        },
      })
    }
    console.log(`✅ Created ${students.length} basic neuro profiles`)
  }
  
  await prisma.$disconnect()
  
  // Calculate Z-profiles
  console.log('2️⃣ Calculating Z-profiles for all students...')
  const result = await processAllZProfiles()
  
  console.log(`✅ Processed ${result.processed} students`)
  if (result.errors > 0) {
    console.log(`⚠️  ${result.errors} errors occurred`)
  }
  console.log('✨ Z-profile calculation complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })

