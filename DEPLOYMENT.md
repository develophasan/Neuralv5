# Netlify Deployment Kılavuzu

## Ön Hazırlık

1. **Neon Veritabanı**: [Neon.tech](https://neon.tech) hesabı oluşturun ve connection string'i alın
2. **GitHub Repository**: Projeyi GitHub'a push edin

## Netlify'da Site Oluşturma

### 1. Yeni Site Oluştur

1. [Netlify Dashboard](https://app.netlify.com) → "Add new site" → "Import an existing project"
2. GitHub repository'nizi seçin
3. Build settings:
   - **Build command**: `cd apps/web && npm run db:generate && npm run build`
   - **Publish directory**: `apps/web/.next`

### 2. Environment Variables Ayarla

Netlify Dashboard → Site Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
NODE_ENV=production
```

**Önemli**: `DATABASE_URL` için Neon'un **pooled connection** string'ini kullanın.

### 3. İlk Deploy

1. "Deploy site" butonuna tıklayın
2. Build loglarını kontrol edin
3. Deploy tamamlandığında site URL'iniz hazır olacak

## Veritabanı Migrations

### İlk Kurulum

Deploy'dan önce veya sonra, Neon veritabanına schema'yı push edin:

```bash
# Yerel makinenizde
cd apps/web
DATABASE_URL="your-neon-connection-string" npm run db:push
DATABASE_URL="your-neon-connection-string" npm run db:seed
```

### Migration Çalıştırma

```bash
DATABASE_URL="your-neon-connection-string" npm run db:migrate
```

## Netlify Functions

API routes otomatik olarak Netlify Functions olarak deploy edilir:
- `apps/web/netlify/functions/api/` klasöründeki dosyalar
- Next.js API routes (`apps/web/src/app/api/`) da çalışır

## Build Optimizasyonları

`netlify.toml` dosyasında:
- Prisma client otomatik generate edilir
- Prisma client Netlify Functions'a dahil edilir
- Node.js 18 kullanılır

## Troubleshooting

### Build Hatası: Prisma Client Bulunamadı

```bash
# Build command'da db:generate çalıştığından emin olun
cd apps/web && npm run db:generate && npm run build
```

### Database Connection Hatası

- `DATABASE_URL` environment variable'ının doğru olduğundan emin olun
- Neon'un pooled connection string'ini kullanın
- SSL mode'un `require` olduğundan emin olun

### Function Timeout

Netlify Functions varsayılan timeout: 10 saniye
- Pro plan: 26 saniye
- Business plan: 60 saniye

Uzun süren işlemler için background jobs kullanın.

## Monitoring

- Netlify Dashboard → Functions → Logs
- Neon Dashboard → Metrics
- Prisma Studio: Yerel makinede `npm run db:studio`

## Sonraki Adımlar

1. ✅ Site deploy edildi
2. ✅ Environment variables ayarlandı
3. ✅ Veritabanı schema push edildi
4. ⏳ Custom domain ekle
5. ⏳ SSL sertifikası (otomatik)
6. ⏳ Analytics kurulumu

