# 🧪 API Test Kılavuzu

## 1. Öğrenci Listesini Al

```bash
# PowerShell'de:
Invoke-WebRequest -Uri "http://localhost:3000/api/test/students" -Method GET | Select-Object -ExpandProperty Content

# Veya tarayıcıda:
http://localhost:3000/api/test/students
```

Bu size mevcut öğrenci ID'lerini verecek.

## 2. Öğrenci Detayını Test Et

Listeden bir ID alıp test et:

```bash
# PowerShell'de (ID'yi değiştir):
Invoke-WebRequest -Uri "http://localhost:3000/api/test/student/[GERÇEK_ID]" -Method GET | Select-Object -ExpandProperty Content
```

## 3. AI Summary Test Et

```bash
Invoke-WebRequest -Uri "http://localhost:3000/api/ai/summary/[GERÇEK_ID]" -Method GET | Select-Object -ExpandProperty Content
```

## 4. Prisma Studio'dan ID Al

```bash
npm run db:studio
```

Prisma Studio'da `students` tablosuna git ve bir ID kopyala.

## Hata Ayıklama

Eğer 404 alıyorsan:
1. Öğrenci ID'si yanlış olabilir
2. Öğrenci `isActive: false` olabilir
3. Seed çalıştırılmamış olabilir: `npm run db:seed`

