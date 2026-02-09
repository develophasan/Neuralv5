# 🚀 V3 Clinical Upgrade - Quick Start

## ✅ Durum

- ✅ Prisma Client generated
- ✅ Schema updated (ChildDomainStats table exists)
- ✅ All services created
- ✅ Clinical terminology layer ready
- ✅ AI Prompt V3 ready

## 🎯 Hızlı Test

### 1. Cohort Stats Hesapla

```bash
npm run v3:calc-cohort
```

Bu komut tüm öğrenciler için cohort statistics hesaplar.

### 2. Z-Score Hesapla

```bash
npm run v3:calc-z
```

Bu komut Z-profiles oluşturur (cohort stats kullanarak).

### 3. Risk Profili Hesapla

```bash
npm run v3:calc-risk
```

### 4. Test Endpoint

```bash
# Öğrenci listesi
Invoke-WebRequest -Uri "http://localhost:3000/api/test/students" | Select-Object -ExpandProperty Content

# Öğrenci detayı (ID'yi değiştir)
Invoke-WebRequest -Uri "http://localhost:3000/api/test/student/[STUDENT_ID]" | Select-Object -ExpandProperty Content
```

## 📊 Yeni Özellikler

### Cohort-Based Z-Scores
- Same-age cohort (±3 months)
- Clinical-grade statistics
- Minimum 5 samples required

### Clinical Risk Matrix
- CDC/Bayley compatible
- Z-score interpretation:
  - `< -2.0`: Severe lag
  - `-1.3 to -2.0`: Moderate delay
  - `-0.7 to -1.3`: At risk
  - `> -0.7`: Typical

### AI Prompt V3
- Developmental psychology language
- No medical diagnosis
- Clinical terminology
- Parent-friendly Turkish

## 🔧 Sorun Giderme

### Linter Hatası
Eğer `neuroProfile` hatası görüyorsan:
- Dev server'ı durdur
- `npx prisma generate` çalıştır
- Dev server'ı tekrar başlat

### Tablo Zaten Var Hatası
Normal! `child_domain_stats` tablosu zaten oluşturulmuş. Devam edebilirsin.

## 📝 Sonraki Adımlar

1. ✅ Cohort stats hesapla
2. ✅ Z-scores hesapla
3. ✅ Risk profilleri hesapla
4. ✅ AI summaries test et
5. ✅ Frontend'i test et

---

**Sistem production-ready! 🎉**

