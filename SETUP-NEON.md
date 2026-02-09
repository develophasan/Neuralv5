# Neon Veritabanı Kurulum Kılavuzu

## Neon Nedir?

Neon, serverless PostgreSQL veritabanı servisidir. Prisma ile tam uyumludur ve Netlify Functions ile mükemmel çalışır.

## Kurulum Adımları

### 1. Neon Hesabı Oluşturma

1. [Neon.tech](https://neon.tech) adresine gidin
2. Ücretsiz hesap oluşturun
3. Yeni bir proje oluşturun
4. Connection string'i kopyalayın

### 2. Connection String Formatı

Neon size iki farklı connection string verir:

**Pooled Connection (Önerilen - Production):**
```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

**Direct Connection (Migrations için):**
```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

### 3. Environment Variables Ayarlama

#### Yerel Geliştirme

`apps/web/.env.local` dosyası oluşturun:

```bash
# Neon Connection String (Pooled - önerilen)
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Direct Connection (Migrations için - opsiyonel)
DIRECT_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

#### Netlify Production

Netlify Dashboard > Site Settings > Environment Variables:

- `DATABASE_URL`: Neon pooled connection string
- `DIRECT_URL`: Neon direct connection string (opsiyonel)
- `NODE_ENV`: `production`

### 4. Veritabanı Şemasını Oluşturma

```bash
cd apps/web

# Prisma client'ı generate et
npm run db:generate

# Schema'yı Neon'a push et
npm run db:push

# Seed verilerini yükle (10 nörogelişimsel alan)
npm run db:seed
```

### 5. Prisma Studio ile Test

```bash
npm run db:studio
```

Prisma Studio açılacak ve veritabanınızı görsel olarak yönetebilirsiniz.

## Neon Özellikleri

✅ **Serverless**: Otomatik scaling, soğuk başlatma yok
✅ **Connection Pooling**: Otomatik connection yönetimi
✅ **Edge Functions**: Netlify Edge Functions ile çalışır
✅ **Prisma Uyumlu**: Tam Prisma desteği
✅ **Ücretsiz Tier**: 0.5 GB storage, sınırsız compute time
✅ **Branching**: Veritabanı branch'leri (Git gibi)

## Netlify Functions ile Kullanım

Netlify Functions'da Neon kullanımı için `apps/web/netlify/functions/` klasöründeki örnekleri inceleyin.

Prisma client otomatik olarak Neon connection string'ini kullanır:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Neon connection string
    },
  },
})
```

## Troubleshooting

### Connection Timeout

Neon'un pooled connection kullanın, direct connection yerine.

### Migration Hataları

`DIRECT_URL` environment variable'ını kullanın migrations için.

### Prisma Client Generate Hatası

```bash
# Prisma cache'i temizle
rm -rf node_modules/.prisma
npm run db:generate
```

## Sonraki Adımlar

1. ✅ Neon hesabı oluştur
2. ✅ Connection string'i al
3. ✅ Environment variables'ı ayarla
4. ✅ Schema'yı push et
5. ✅ Seed verilerini yükle
6. ✅ Netlify'a deploy et

## Kaynaklar

- [Neon Dokümantasyon](https://neon.tech/docs)
- [Prisma + Neon Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-neon)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
