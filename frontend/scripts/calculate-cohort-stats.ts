/**
 * Calculate Cohort Domain Stats for all students
 * Usage: npx tsx scripts/calculate-cohort-stats.ts
 */

import { processAllCohortZScores } from '../src/services/cohort-z-score-engine'

async function main() {
  console.log('📊 Starting cohort domain stats calculation...')
  
  const result = await processAllCohortZScores()
  
  console.log(`✅ Processed ${result.processed} students`)
  if (result.errors > 0) {
    console.log(`⚠️  ${result.errors} errors occurred`)
  }
  console.log('✨ Cohort stats calculation complete!')
  console.log('')
  console.log('💡 Next step: Calculate Z-scores using cohort stats')
  console.log('   npm run v3:calc-z')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })

