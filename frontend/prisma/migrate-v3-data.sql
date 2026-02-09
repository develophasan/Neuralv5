-- Migrate existing ai_child_summaries data to V3 format
-- Run this after schema push

-- Update summary from progress_text if summary is still default
UPDATE "ai_child_summaries" 
SET "summary" = COALESCE("progress_text", 'Gelişim takibi devam ediyor.')
WHERE "summary" = 'Gelişim takibi devam ediyor.' 
   OR ("summary" IS NULL AND "progress_text" IS NOT NULL);

-- Update home_activity from home_recommendation if home_activity is null
UPDATE "ai_child_summaries" 
SET "home_activity" = "home_recommendation"
WHERE "home_activity" IS NULL 
  AND "home_recommendation" IS NOT NULL;

