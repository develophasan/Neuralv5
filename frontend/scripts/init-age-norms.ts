/**
 * Initialize Age Norms - Run this once to populate neuro_norm_table
 * Usage: npx tsx scripts/init-age-norms.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Initializing age norms...')

  const ages = [24, 30, 36, 42, 48, 54, 60, 66, 72] // 2-6 years in 6-month intervals
  const domains = [
    'executive_functions',
    'language_communication',
    'social_emotional',
    'gross_motor',
    'fine_motor',
    'logical_numerical',
    'creative_expression',
    'spatial_awareness',
    'discovery_world',
    'self_help',
  ]

  let created = 0
  let skipped = 0

  for (const age of ages) {
    for (const domain of domains) {
      // Check if exists
      const exists = await prisma.neuroNormTable.findUnique({
        where: {
          ageInMonths_domain: {
            ageInMonths: age,
            domain,
          },
        },
      })

      if (exists) {
        skipped++
        continue
      }

      // Placeholder values - should be replaced with real research data
      // Mean increases with age, stdDev stays relatively constant
      const mean = 50 + (age - 24) * 0.5 // 50% at 24 months, 74% at 72 months
      const stdDev = 15.0

      await prisma.neuroNormTable.create({
        data: {
          ageInMonths: age,
          domain,
          mean,
          stdDev,
          sampleSize: 1000,
        },
      })

      created++
    }
  }

  console.log(`✅ Created ${created} age norms`)
  console.log(`⏭️  Skipped ${skipped} existing norms`)
  console.log('✨ Age norms initialization complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

