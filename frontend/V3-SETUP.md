# 🧠 V3 Setup Guide

## İki Yöntem Var:

### Yöntem 1: NPM Scripts (Önerilen - Sunucu Gerektirmez)

```bash
# 1. Yaş normlarını başlat
npm run v3:init-norms

# 2. Z-profil hesapla
npm run v3:calc-z

# 3. Risk profili hesapla
npm run v3:calc-risk
```

### Yöntem 2: API Endpoints (Sunucu Gerekir)

Önce sunucuyu başlat:
```bash
npm run dev
```

Sonra başka bir terminal'de:
```bash
# 1. Yaş normlarını başlat + Z-profil hesapla
curl http://localhost:3000/api/cron/z-score

# 2. Risk profili hesapla
curl http://localhost:3000/api/cron/risk-calculation
```

## Hangi Yöntemi Kullanmalıyım?

- **NPM Scripts**: Hızlı, sunucu gerektirmez, tek seferlik işlemler için ideal
- **API Endpoints**: Cron job'lar için, otomatik çalıştırma için ideal

## İlk Kurulum Adımları

1. **Schema'yı push et** (zaten yaptık ✅)
   ```bash
   npx prisma db push
   ```

2. **Yaş normlarını başlat**
   ```bash
   npm run v3:init-norms
   ```

3. **Z-profil hesapla** (öğrenciler için)
   ```bash
   npm run v3:calc-z
   ```

4. **Risk profili hesapla**
   ```bash
   npm run v3:calc-risk
   ```

## Test Etmek İçin

AI özeti oluştur (sunucu çalışıyor olmalı):
```bash
npm run dev
# Başka terminal'de:
curl http://localhost:3000/api/ai/summary/[STUDENT_ID]
```

## Notlar

- Yaş normları placeholder değerler. Gerçek veriyle değiştirilmeli.
- Z-profil hesaplamaları haftalık yapılmalı (cron job ile).
- Risk profilleri günlük güncellenmeli.

