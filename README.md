# Harmoni Anaokulu - Nörobilim Temelli Bütünleşik Eğitim Platformu

2-6 yaş arası çocukların bilişsel (zihin) ve duygusal (kalp) gelişimini bütünsel olarak takip eden, öğretmen, veli ve yönetici arayüzlerine sahip, web ve mobil uyumlu bir platform.

## Teknoloji Yığını

- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Styling:** Tailwind CSS + Shadcn/UI
- **Backend/Database:** Neon (Serverless PostgreSQL) + Prisma ORM
- **Deployment:** Netlify (Functions + Edge)
- **Mobile:** React Native (Expo)
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Monorepo:** Turborepo

## Proje Yapısı

```
harmoni-anaokulu/
├── apps/
│   ├── web/              # Next.js web uygulaması
│   │   ├── prisma/       # Prisma schema ve migrations
│   │   └── netlify/      # Netlify Functions
│   └── mobile/           # React Native (Expo) mobil uygulama
└── packages/
    └── ui/               # Ortak UI bileşenleri (Shadcn/UI)
```

## Hızlı Başlangıç

```bash
# Bağımlılıkları yükle
npm install

# Neon veritabanı bağlantısını ayarla (apps/web/.env.local)
DATABASE_URL="your-neon-connection-string"

# Prisma client'ı generate et
cd apps/web && npm run db:generate

# Veritabanı şemasını oluştur
npm run db:push

# Seed verilerini yükle
npm run db:seed

# Geliştirme sunucusunu başlat
npm run dev
```

## Veritabanı (Neon)

Bu proje [Neon](https://neon.tech) serverless PostgreSQL veritabanı kullanır. Detaylı kurulum için [SETUP-NEON.md](./SETUP-NEON.md) dosyasına bakın.

## Nörogelişimsel Alanlar

1. Executive Functions (Yürütücü İşlevler)
2. Language & Communication (Dil/İletişim)
3. Social & Emotional (Sosyal/Duygusal)
4. Gross Motor (Kaba Motor)
5. Fine Motor (İnce Motor)
6. Logical & Numerical (Mantıksal/Sayısal)
7. Creative Expression (Yaratıcı İfade)
8. Spatial Awareness (Mekansal Farkındalık)
9. Discovery of the World (Dünya Keşfi)
10. Self-Help (Öz-Bakım)

## Deployment

Proje Netlify'a deploy edilmek üzere yapılandırılmıştır. Detaylar için `netlify.toml` dosyasına bakın.
