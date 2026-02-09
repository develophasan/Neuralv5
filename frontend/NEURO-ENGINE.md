# 🧠 NEURO ENGINE - Harmoni OS V2

## Genel Bakış

Harmoni OS V2'nin **gerçek teknoloji katmanı** artık hazır. Schema'dan sonra şimdi **çalışan business logic** var.

## 📁 Yapı

```
apps/web/
├── src/services/
│   ├── neuro-engine.ts    # Trend hesaplama, risk detection, profile update
│   └── ai-worker.ts        # Gemini AI integration, summary generation
└── app/api/cron/
    ├── neuro-engine/       # Background job: Daily profile processing
    └── ai-summaries/       # Background job: Daily AI summary generation
```

## 🚀 Servisler

### 1. Neuro Engine (`src/services/neuro-engine.ts`)

**Fonksiyonlar:**

- `calculateWeeklyTrends(studentId, weeks)` - Haftalık trend hesaplama
- `detectRisks(studentId)` - Risk tespiti ve alert üretimi
- `updateNeuroProfile(studentId)` - Profile güncelleme (assessments'tan)
- `mergeQuickAssessment(studentId, domainCode, score)` - Quick assessment'i profile'a merge et
- `processAllStudents()` - Tüm öğrencileri işle (background job için)

**Kullanım:**

```typescript
import { updateNeuroProfile, detectRisks, calculateWeeklyTrends } from '@/services/neuro-engine'

// Profile güncelle
await updateNeuroProfile(studentId)

// Risk tespit et
const risks = await detectRisks(studentId)

// Trend hesapla
const trends = await calculateWeeklyTrends(studentId, 4)
```

### 2. AI Worker (`src/services/ai-worker.ts`)

**Fonksiyonlar:**

- `generateChildSummary(studentId, date)` - Tek öğrenci için AI summary
- `generateAllSummaries(date)` - Tüm öğrenciler için summary generation

**Kullanım:**

```typescript
import { generateChildSummary } from '@/services/ai-worker'

// Summary oluştur
const summary = await generateChildSummary(studentId, new Date())
// Returns: { progressText: string, homeRecommendation: string | null }
```

## 🔄 Background Jobs

### 1. Neuro Engine Processing

**Endpoint:** `POST /api/cron/neuro-engine`

**Ne yapar:**
- Tüm aktif öğrenciler için profile günceller
- Haftalık trendleri hesaplar
- Risk tespiti yapar ve alert oluşturur

**Schedule:** Günlük saat 02:00

**Manuel tetikleme (development):**
```bash
curl http://localhost:3000/api/cron/neuro-engine
```

### 2. AI Summary Generation

**Endpoint:** `POST /api/cron/ai-summaries`

**Ne yapar:**
- Tüm aktif öğrenciler için günlük AI summary oluşturur
- Gemini AI kullanarak progress text ve home recommendation üretir

**Schedule:** Günlük saat 18:00 (okul günü sonrası)

**Manuel tetikleme (development):**
```bash
curl http://localhost:3000/api/cron/ai-summaries
```

## 🔐 Güvenlik

Background job endpoint'leri `CRON_SECRET` environment variable ile korunur:

```env
CRON_SECRET=harmoni-cron-secret-2024
```

**Production'da:**
- Vercel Cron veya Netlify Scheduled Functions kullan
- Authorization header ile secret gönder:
  ```
  Authorization: Bearer harmoni-cron-secret-2024
  ```

## 📊 Güncellenen API Endpoints

### 1. Neuro Profile API

**GET `/api/neuro/profile/[studentId]`**
- Artık Neuro Engine kullanıyor
- Profile yoksa otomatik oluşturuyor

**POST `/api/neuro/profile/[studentId]`**
- Profile'ı yeniden hesaplıyor
- Trends ve risks döndürüyor

### 2. Quick Assessment API

**POST `/api/quick-assessment`**
- Artık `mergeQuickAssessment()` kullanıyor
- Profile'a weighted average ile merge ediyor (70% existing, 30% new)

### 3. AI Summary API

**GET `/api/ai/summary/[studentId]`**
- AI Worker servisini kullanıyor
- Summary yoksa otomatik generate ediyor

**POST `/api/ai/summary/[studentId]`**
- Yeni summary generate ediyor

## 🧪 Test Etme

### 1. Neuro Engine'i Test Et

```bash
# Development'ta manuel tetikle
curl http://localhost:3000/api/cron/neuro-engine

# Response:
{
  "success": true,
  "message": "Neuro Engine processing completed",
  "result": {
    "profilesUpdated": 20,
    "alertsCreated": 3,
    "trendsCalculated": 200
  }
}
```

### 2. AI Summary'yi Test Et

```bash
# Development'ta manuel tetikle
curl http://localhost:3000/api/cron/ai-summaries

# Response:
{
  "success": true,
  "message": "AI summary generation completed",
  "result": {
    "generated": 20,
    "errors": 0
  }
}
```

### 3. Tek Öğrenci İçin Test

```typescript
import { updateNeuroProfile, detectRisks } from '@/services/neuro-engine'

// Profile güncelle
await updateNeuroProfile('student-id')

// Risk kontrol et
const risks = await detectRisks('student-id')
console.log(risks)
```

## 📈 Production Deployment

### Vercel Cron

`vercel.json` dosyasına ekle:

```json
{
  "crons": [
    {
      "path": "/api/cron/neuro-engine",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/ai-summaries",
      "schedule": "0 18 * * *"
    }
  ]
}
```

### Netlify Scheduled Functions

`netlify/functions/cron-neuro-engine.ts`:

```typescript
import { handler } from '@netlify/functions'
import { processAllStudents } from '../../src/services/neuro-engine'

export const scheduled = handler(async (event, context) => {
  const result = await processAllStudents()
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  }
})
```

## 🎯 Sonraki Adımlar

1. ✅ Neuro Engine - TAMAMLANDI
2. ✅ AI Worker - TAMAMLANDI
3. ✅ Background Jobs - TAMAMLANDI
4. ⏳ UI Components (Radar Chart, Trend Arrows)
5. ⏳ Real-time notifications
6. ⏳ Advanced analytics

## 📝 Notlar

- **Neuro Engine** her gün çalışmalı (tüm öğrenciler için)
- **AI Summary** her gün okul sonrası çalışmalı
- **Quick Assessment** anında profile'ı günceller
- **Risk Detection** otomatik alert oluşturur

---

**Hasan, artık gerçek teknoloji var! 🚀**

