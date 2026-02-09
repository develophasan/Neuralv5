// Neon Serverless Database Client
// Netlify Functions ve Edge Functions için optimize edilmiş

import { neon, neonConfig } from '@neondatabase/serverless'

// Neon config - Edge runtime için optimize
neonConfig.fetchConnectionCache = true

// Neon client oluştur (raw SQL queries için)
// Not: Prisma kullanıyoruz, bu dosya sadece özel durumlar için
const sql = neon(process.env.DATABASE_URL!)

export { sql }

// Prisma ile birlikte kullanım:
// Prisma client otomatik olarak Neon connection string'ini kullanır
// Sadece DATABASE_URL'i Neon connection string'i olarak ayarlayın
