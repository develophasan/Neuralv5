# Harmoni - Nörogelişimsel Anaokulu Yönetim Sistemi

## Proje Özeti
Harmoni, anaokullarında çocukların nörogelişimsel takibini yapan, AI destekli bir yönetim platformudur.

## Teknik Mimari
- **Framework:** Next.js 14 (App Router)
- **Veritabanı:** PostgreSQL (Neon) + Prisma ORM
- **Auth:** NextAuth.js (basePath: /auth)
- **API Route'ları:** /napi/* (Emergent ingress uyumluluğu için)
- **Styling:** Tailwind CSS, Framer Motion, shadcn/ui

## Kullanıcı Rolleri
1. **Admin** - Sistem yönetimi, kullanıcı/sınıf/öğrenci CRUD
2. **Öğretmen** - Değerlendirme, günlük kayıt, duygu takibi, sınıf yönetimi
3. **Veli** - Çocuk gelişim raporları, aktivite kütüphanesi, bildirimler

## Tamamlanan Özellikler

### Admin Paneli ✅
- Dashboard (istatistikler, grafikler)
- Kullanıcı CRUD (modal)
- Öğrenci CRUD (modal)
- Sınıf CRUD (modal)
- Değerlendirmeler (renk kodlamalı)
- Audit Log
- Bildirim Gönderme
- Excel Export (users, students)

### Öğretmen Paneli ✅
- Dashboard (hızlı erişim butonları)
- Sınıf Yönetimi (oluştur, düzenle, sil)
- Öğrenci Yönetimi (ekle, düzenle, sınıftan çıkar, sil)
- Değerlendirmeler (renk kodlamalı, 10 gelişim alanı)
- Günlük Kayıt
- Duygu Durumu Takibi
- Raporlar (PDF indirme)
- Bildirim Gönderme

### Veli Paneli ✅
- Dashboard
- Gelişim Raporları (radar/trend grafikleri)
- Aktivite Kütüphanesi
- Takvim Görünümü
- Bildirimler

### Genel ✅
- PWA Desteği
- Gerçek Zamanlı Bildirimler (polling)
- Türkçe Karakter Desteği (PDF)
- Rol bazlı UI/UX tasarımı

## Devam Eden Görevler (P1)
- [ ] Skeleton Loading States
- [ ] TrajectoryChart AI tahmin grafiği
- [ ] Zod form validation

## Gelecek Görevler (P2)
- [ ] V3 Klinik PDF Export
- [ ] Test API rotalarını temizleme

## Test Hesapları
| Rol | Email | Şifre |
|-----|-------|-------|
| Admin | admin@harmoni.com | harmoni123 |
| Öğretmen | ogretmen1@harmoni.com | harmoni123 |
| Veli | veli1@harmoni.com | harmoni123 |

## API Endpoint'leri
- `/auth/*` - NextAuth authentication
- `/napi/admin/*` - Admin API'leri
- `/napi/teacher/*` - Öğretmen API'leri
- `/napi/parent/*` - Veli API'leri
- `/napi/reports/*` - Rapor API'leri
- `/napi/notifications` - Bildirim API'leri

## Son Güncelleme
- Tarih: 2025-02-07
- Öğretmen paneli öğrenci/sınıf yönetimi eklendi
- Duygu durumu takibi sayfası oluşturuldu
- Değerlendirmeler renk kodlaması eklendi
- Bildirim paneli taşma sorunu düzeltildi
