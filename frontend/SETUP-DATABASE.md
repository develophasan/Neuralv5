# 🗄️ Veritabanı Kurulum Kılavuzu - Neon PostgreSQL

## 1. Neon Veritabanı Connection String Alma

### Neon Dashboard'dan:
1. [Neon Console](https://console.neon.tech) → Projenize gidin
2. **harmoniv2** projesini seçin
3. **Connection Details** veya **Connection String** bölümüne gidin
4. **Pooled connection** (önerilen) veya **Direct connection** string'i kopyalayın

### Connection String Formatı:
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/harmoniv2?sslmode=require
```

## 2. .env Dosyasını Düzenle

`apps/web/.env` dosyasını açın ve `DATABASE_URL`'i güncelleyin:

```env
# Neon PostgreSQL Database Connection
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/harmoniv2?sslmode=require"

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
```

**ÖNEMLİ:** 
- Connection string'i tırnak işaretleri içine alın (`"..."`)
- `harmoniv2` veritabanı adını kontrol edin
- `sslmode=require` parametresini ekleyin

## 3. Veritabanı Şemasını Oluştur

```bash
cd apps/web

# Prisma client'ı generate et
npm run db:generate

# Schema'yı Neon'a push et
npm run db:push

# Seed verilerini yükle (10 nörogelişimsel alan + örnek veriler)
npm run db:seed
```

## 4. Test Et

```bash
# Prisma Studio ile veritabanını görselleştir
npm run db:studio
```

Prisma Studio açılacak ve veritabanınızı görsel olarak yönetebilirsiniz.

## 5. Sorun Giderme

### DATABASE_URL bulunamıyor hatası:
- `.env` dosyasının `apps/web/` klasöründe olduğundan emin olun
- Connection string'in tırnak işaretleri içinde olduğundan emin olun
- Terminal'i yeniden başlatın

### Bağlantı hatası:
- Neon dashboard'dan connection string'i tekrar kopyalayın
- `sslmode=require` parametresinin olduğundan emin olun
- Neon projenizin aktif olduğundan emin olun

### Prisma client hatası:
```bash
npm run db:generate
```

## 📝 Notlar

- **Pooled Connection**: Production için önerilir (connection pooling ile)
- **Direct Connection**: Migration'lar için kullanılabilir
- `.env` dosyası `.gitignore`'da olduğu için Git'e commit edilmez
- Production'da environment variables'ı hosting platform'unuzda (Netlify, Vercel, vb.) ayarlayın

