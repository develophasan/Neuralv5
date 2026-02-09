# 🧠 Harmoni OS V3 - Statistical Intelligence Upgrade

## Overview

V3 upgrade introduces statistical intelligence layer with Z-score normalization, risk modeling, and explainable AI.

## New Features

### 1. Z-Score Engine (`/services/z-score-engine.ts`)
- Age-based score normalization
- Percentile ranking
- Weekly Z-profile generation
- Population norm tables

### 2. Risk Engine (`/services/risk-engine.ts`)
- Multi-factor risk calculation:
  - 40% Z-score
  - 30% Trend slope
  - 20% Domain imbalance
  - 10% Emotional instability
- Severity classification (LOW/MEDIUM/HIGH)

### 3. Explainability Engine (`/services/explainability-engine.ts`)
- Human-readable explanations
- Weakest/strongest domain identification
- Declining trend analysis
- Emotional pattern recognition
- Age norm comparison

### 4. AI Worker V3 (`/services/ai-worker.ts`)
- Enhanced prompts with statistical data
- Risk-aware recommendations
- Domain-specific activities
- Structured JSON output

## Database Schema Changes

### New Tables
- `NeuroNormTable` - Age-based population norms
- `ChildNeuroZProfile` - Weekly Z-score profiles
- `NeuroRiskProfile` - Risk scores and severity

### Updated Tables
- `NeuroAlert` - Added `explanation` field
- `AIChildSummary` - V3 structure:
  - `summary` (replaces `progressText`)
  - `riskExplanation`
  - `homeActivity` (replaces `homeRecommendation`)
  - `positiveNote`

## API Endpoints

### Cron Jobs
- `POST /api/cron/z-score` - Calculate Z-profiles (weekly)
- `POST /api/cron/risk-calculation` - Calculate risk profiles (daily)

### Manual Testing (GET)
- `GET /api/cron/z-score` - Manual Z-score calculation
- `GET /api/cron/risk-calculation` - Manual risk calculation

## Setup Instructions

1. **Generate Prisma Client**
   ```bash
   cd apps/web
   npx prisma generate
   ```

2. **Push Schema to Database**
   ```bash
   npx prisma db push
   ```

3. **Initialize Age Norms**
   ```bash
   # Via API endpoint (development)
   curl http://localhost:3000/api/cron/z-score
   ```

4. **Calculate Initial Z-Profiles**
   ```bash
   curl http://localhost:3000/api/cron/z-score
   ```

5. **Calculate Risk Profiles**
   ```bash
   curl http://localhost:3000/api/cron/risk-calculation
   ```

## Usage Examples

### Calculate Z-Profile for Student
```typescript
import { calculateZProfile } from '@/services/z-score-engine'

await calculateZProfile(studentId)
```

### Get Risk Score
```typescript
import { calculateRiskScore } from '@/services/risk-engine'

const risk = await calculateRiskScore(studentId)
console.log(risk.severity) // 'low' | 'medium' | 'high'
```

### Generate Explanation
```typescript
import { generateExplanationText } from '@/services/explainability-engine'

const explanation = await generateExplanationText(studentId)
```

### Generate AI Summary (V3)
```typescript
import { generateChildSummary } from '@/services/ai-worker'

const summary = await generateChildSummary(studentId)
// Returns: { summary, riskExplanation, homeActivity, positiveNote }
```

## Roadmap

See `/src/roadmap.ts` for product development phases.

## Notes

- Age norms are currently placeholder values. Replace with real population data.
- Z-scores are calculated weekly (Monday of each week).
- Risk scores are recalculated daily.
- AI summaries use V3 format with statistical context.

