# Test Kılavuzu

## 🚀 Geliştirme Sunucusu

Sunucu başlatıldı! Şu adreslerde test edebilirsiniz:

### Ana Sayfa
- **URL**: http://localhost:3000
- **Açıklama**: Ana sayfa

### Öğretmen Dashboard
- **URL**: http://localhost:3000/teacher/dashboard
- **Açıklama**: Öğretmen paneli - sınıflar, aktiviteler, istatistikler

### Test API
- **URL**: http://localhost:3000/api/test
- **Açıklama**: Tüm veritabanı verilerini gösterir

### Öğretmen ID API
- **URL**: http://localhost:3000/api/test/teacher-id
- **Açıklama**: İlk öğretmenin ID'sini döndürür (test için)

## 📊 Test Verileri

### Öğretmenler
- **Email**: ogretmen1@harmoni.com
- **İsim**: Öğretmen Zeynep Demir
- **Sınıf**: Kelebekler Sınıfı (3-4 yaş)

- **Email**: ogretmen2@harmoni.com
- **İsim**: Öğretmen Mehmet Kaya
- **Sınıf**: Yıldızlar Sınıfı (4-5 yaş)

### Öğrenciler
1. **Elif Yıldız** (3 yaş) - Kelebekler Sınıfı
2. **Can Şahin** (4 yaş) - Yıldızlar Sınıfı
3. **Zeynep Kaya** (3 yaş) - Kelebekler Sınıfı
4. **Arda Demir** (4 yaş) - Yıldızlar Sınıfı

### Aktiviteler
- Boncuk Dizme Oyunu (İnce Motor)
- Hamur Atölyesi (İnce Motor)
- Paylaşım Oyunu (Sosyal/Duygusal)
- Denge Oyunu (Kaba Motor)

## 🧪 Test Senaryoları

### 1. Dashboard Yükleme
1. http://localhost:3000/teacher/dashboard adresine gidin
2. Sayfa yüklenmeli ve şunları göstermeli:
   - Toplam öğrenci sayısı
   - Aktif sınıf sayısı
   - Bekleyen değerlendirmeler
   - Önerilen aktiviteler
   - Sınıf listesi
   - Günün nöro-aktiviteleri

### 2. API Testleri
```bash
# Tüm verileri test et
curl http://localhost:3000/api/test

# Öğretmen ID al
curl http://localhost:3000/api/test/teacher-id

# Öğretmen sınıfları (teacherId parametresi gerekli)
curl http://localhost:3000/api/teacher/classes?teacherId={teacher_id}

# Öğretmen aktiviteleri
curl http://localhost:3000/api/teacher/activities?teacherId={teacher_id}

# İstatistikler
curl http://localhost:3000/api/teacher/stats?teacherId={teacher_id}
```

## 🔍 Beklenen Sonuçlar

### Dashboard
- ✅ 2 sınıf görünmeli (Kelebekler ve Yıldızlar)
- ✅ Toplam 4 öğrenci görünmeli
- ✅ 2 aktivite önerisi görünmeli
- ✅ İstatistik kartları dolu olmalı

### API Responses
- ✅ `/api/test` - Tüm veriler JSON formatında
- ✅ `/api/teacher/classes` - Öğretmenin sınıfları ve öğrencileri
- ✅ `/api/teacher/activities` - Bekleyen aktivite önerileri
- ✅ `/api/teacher/stats` - Dashboard istatistikleri

## 🐛 Sorun Giderme

### Veritabanı Bağlantı Hatası
```bash
# .env.local dosyasını kontrol edin
cd apps/web
cat .env.local
```

### API Hatası
- Browser console'u kontrol edin (F12)
- Network tab'ında API isteklerini kontrol edin
- Server logs'u kontrol edin

### Veri Görünmüyor
- Prisma Studio ile veritabanını kontrol edin:
```bash
cd apps/web
$env:DATABASE_URL="your-connection-string"; npm run db:studio
```

## 📝 Notlar

- Dashboard otomatik olarak ilk öğretmeni bulur ve verilerini gösterir
- Gerçek authentication henüz eklenmedi (test modu)
- Tüm veriler Neon PostgreSQL veritabanından geliyor

