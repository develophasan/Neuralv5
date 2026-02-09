# Harmoni Anaokulu - Kurulum Kılavuzu

## Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Neon hesabı (ücretsiz tier yeterli)

## Kurulum Adımları

### 1. Bağımlılıkları Yükle

```bash
# Root dizinde
npm install

# Tüm workspace'lerde bağımlılıkları yükle
npm install --workspaces
```

### 2. Neon Veritabanı Kurulumu

1. [Neon.tech](https://neon.tech) hesabı oluşturun
2. Yeni bir proje oluşturun
3. Connection string'i kopyalayın (pooled connection önerilir)
4. `apps/web/.env.local` dosyası oluşturun:

```bash
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

Detaylı Neon kurulumu için [SETUP-NEON.md](./SETUP-NEON.md) dosyasına bakın.

### 3. Veritabanı Şemasını Oluştur

```bash
cd apps/web

# Prisma client'ı generate et
npm run db:generate

# Schema'yı Neon'a push et
npm run db:push

# Seed verilerini yükle (10 nörogelişimsel alan)
npm run db:seed
```

### 4. Geliştirme Sunucusunu Başlat

```bash
# Tüm uygulamaları başlat (web + mobile)
npm run dev

# Sadece web uygulaması
cd apps/web && npm run dev

# Sadece mobil uygulama
cd apps/mobile && npm run dev
```

Web uygulaması: http://localhost:3000
Öğretmen Dashboard: http://localhost:3000/teacher/dashboard

## Proje Yapısı

```
harmoni-anaokulu/
├── apps/
│   ├── web/              # Next.js web uygulaması
│   │   ├── app/          # App Router sayfaları
│   │   ├── prisma/       # Prisma schema ve seed
│   │   ├── netlify/      # Netlify Functions
│   │   └── src/          # Kaynak kodlar
│   └── mobile/           # React Native (Expo) mobil uygulama
├── packages/
│   └── ui/               # Ortak UI bileşenleri
└── netlify.toml          # Netlify yapılandırması
```

## Veritabanı Şeması

Veritabanı şeması 5 ana modülden oluşur:

1. **Kullanıcı Yönetimi**: users, students, classes, parent_students, class_teachers
2. **Nörogelişimsel Takip**: development_domains, assessments, assessment_scores, development_reports
3. **Eğitim ve Oyun Havuzu**: activities, activity_recommendations
4. **Günlük Akış**: daily_logs, mood_tracker, media
5. **Sağlık ve Psikoloji**: health_records, psychologist_notes

## Prisma Komutları

- `npm run db:generate` - Prisma client'ı generate et
- `npm run db:push` - Schema'yı veritabanına push et
- `npm run db:migrate` - Migration oluştur ve uygula
- `npm run db:seed` - Seed verilerini yükle (10 nörogelişimsel alan)
- `npm run db:studio` - Prisma Studio'yu aç (veritabanı GUI)

## Sonraki Adımlar

1. ✅ Proje yapısı kuruldu
2. ✅ Neon veritabanı şeması hazırlandı
3. ✅ Öğretmen Dashboard temel yapısı oluşturuldu
4. ⏳ Veli paneli
5. ⏳ Yönetici paneli
6. ⏳ Nöro-gözlem ekranı
7. ⏳ Gelişim raporları
8. ⏳ Aktivite öneri algoritması

## Notlar

- Tüm kod TypeScript ile yazılmıştır
- Tailwind CSS + Shadcn/UI kullanılmaktadır
- Neon serverless PostgreSQL veritabanı kullanılmaktadır
- Monorepo yapısı Turborepo ile yönetilmektedir
- Netlify Functions ile serverless API endpoints
