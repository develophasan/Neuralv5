import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mock Norm Data Generator
// For a 48-month old (4 years), we assume a mean score of ~3.5 with stdDev ~0.8
// This is just a placeholder for real scientific data.
async function main() {
    console.log('🧠 Seeding NeuroNorms...')

    // Fetch all domains from DB
    const dbDomains = await prisma.developmentDomain.findMany()
    const domains = dbDomains.map(d => d.code)

    console.log(`Found ${domains.length} domains to seed norms for.`)

    const ageMonths = [30, 36, 42, 48, 54, 60, 66, 72] // Granular ages

    for (const age of ageMonths) {
        for (const domain of domains) {
            // Slightly increase expectation with age
            const baseMean = 3.0 + (age - 36) * 0.05
            const mean = Math.min(4.8, Math.max(2.0, baseMean)) // Cap at 4.8, min 2.0
            const stdDev = 0.8 // Uniform variation for now

            await prisma.neuroNorm.upsert({
                where: {
                    domainCode_ageMonth: {
                        domainCode: domain,
                        ageMonth: age
                    }
                },
                update: {
                    mean,
                    stdDev
                },
                create: {
                    domainCode: domain,
                    ageMonth: age,
                    mean,
                    stdDev
                }
            })
        }
    }

    console.log('✅ NeuroNorms seeded successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
