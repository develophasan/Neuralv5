# Harmoni Anaokulu - Web Uygulaması

## Veritabanı Kurulumu (Neon)

### 1. Neon Hesabı Oluşturma

1. [Neon.tech](https://neon.tech) hesabı oluşturun ve proje oluşturun
2. Connection string'i kopyalayın (pooled connection önerilir)

### 2. Environment Variables

`.env.local` dosyası oluşturun:

```bash
# Neon Connection String (Pooled - önerilen)
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Direct Connection (Migrations için - opsiyonel)
DIRECT_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

### 3. Veritabanı Şemasını Oluştur

```bash
# Prisma client'ı generate et
npm run db:generate

# Schema'yı Neon'a push et
npm run db:push

# Seed verilerini yükle (10 nörogelişimsel alan)
npm run db:seed
```

### 4. Prisma Studio ile Test

```bash
npm run db:studio
```

Prisma Studio açılacak ve veritabanınızı görsel olarak yönetebilirsiniz.

## Geliştirme

```bash
# Bağımlılıkları yükle
npm install

# Veritabanını hazırla
npm run db:generate
npm run db:push
npm run db:seed

# Geliştirme sunucusunu başlat
npm run dev
```

## Prisma Komutları

- `npm run db:generate` - Prisma client'ı generate et
- `npm run db:push` - Schema'yı veritabanına push et
- `npm run db:migrate` - Migration oluştur ve uygula
- `npm run db:seed` - Seed verilerini yükle
- `npm run db:studio` - Prisma Studio'yu aç (veritabanı GUI)

## Netlify Deployment

1. GitHub'a push edin
2. Netlify'da yeni site oluşturun
3. Environment variables'ı ayarlayın:
   - `DATABASE_URL`: Neon connection string (pooled)
   - `DIRECT_URL`: Neon direct connection string (opsiyonel)
   - `NODE_ENV`: `production`
4. Build settings:
   - Build command: `cd apps/web && npm run db:generate && npm run build`
   - Publish directory: `apps/web/.next`

## Neon Özellikleri

- ✅ Serverless PostgreSQL
- ✅ Otomatik scaling
- ✅ Connection pooling
- ✅ Edge functions desteği
- ✅ Prisma ile tam uyumlu
- ✅ Ücretsiz tier mevcut (0.5 GB storage)

## API Routes

- `/api/teacher/classes` - Öğretmen sınıfları
- `/api/teacher/activities` - Önerilen aktiviteler
- `/api/teacher/stats` - Dashboard istatistikleri

Netlify Functions olarak da deploy edilir: `apps/web/netlify/functions/api/`
