# Harmoni Anaokulu - Platform Özellikleri ve İşlevleri

## 📋 Genel Bakış

Harmoni Anaokulu, 2-6 yaş arası çocukların bilişsel (zihin) ve duygusal (kalp) gelişimini bütünsel olarak takip eden, nörobilim temelli bir eğitim platformudur. Platform, MindChamps ve Harvard Center on the Developing Child metodolojilerinden esinlenilerek geliştirilmiştir.

## 🎯 Platform Vizyonu

Platform, standart anaokulu uygulamalarından farklı olarak "Nörobilim temelli premium eğitim" algısını yansıtır. Hem güvenilir ve bilimsel (Zihin/Brain) hem de sıcak ve kucaklayıcı (Kalp/Heart) bir deneyim sunar.

## 👥 Kullanıcı Rolleri

### 1. Admin (İdare/Okul Yönetimi)
Sistemin tam kontrolüne sahip yönetici rolü.

### 2. Teacher (Öğretmen)
Sınıf ve öğrenci yönetimi, değerlendirme ve günlük log takibi yapan eğitimci rolü.

### 3. Parent (Veli)
Çocuğunun gelişimini takip eden ve aktivite önerilerini gören veli rolü.

## 🧠 10 Nörogelişimsel Alan

Platform, çocukların gelişimini aşağıdaki 10 alanda takip eder:

1. **Yürütücü İşlevler (Executive Functions)**: Hafıza, odaklanma, dürtü kontrolü
2. **Dil ve İletişim (Language & Communication)**: Kelime dağarcığı, hikaye anlatma, fonetik farkındalık
3. **Sosyal ve Duygusal Zeka (Social & Emotional)**: Empati, iş birliği, duygu regülasyonu ("Kalbin Uyumu")
4. **Kaba Motor Beceriler (Gross Motor)**: Denge, koordinasyon, fiziksel güç
5. **İnce Motor Beceriler (Fine Motor)**: El-göz koordinasyonu, kalem tutma, küçük nesneleri manipüle etme
6. **Mantıksal ve Sayısal Muhakeme (Logical & Numerical)**: Sıralama, örüntü, sayı algısı
7. **Yaratıcı ve Estetik İfade (Creative Expression)**: Müzik, sanat, hayal gücü kullanımı
8. **Mekansal Farkındalık (Spatial Awareness)**: Yön bulma, nesnelerin uzaydaki konumu
9. **Dünya Keşfi ve Bilimsel Merak (Discovery of the World)**: Doğa olaylarını anlama, neden-sonuç ilişkisi
10. **Öz-Bakım ve Bağımsızlık (Self-Help & Independence)**: Kendi işini yapabilme, hijyen, giyinme

## 🎨 Tasarım Sistemi

### Renk Paleti
- **Ana Zemin**: Hafif kırık beyaz/krem (#F8F9FA) - Göz yorgunluğunu azaltır
- **Birincil Renk (Zihin)**: Okyanus Mavisi/Teal (#0F766E) - Güven verici, sofistike
- **İkincil Renk (Kalp)**: Mercan/Şeftali (#E76F51, #F4A261) - Sıcaklık ve enerji
- **Semantic Colors**: Yumuşatılmış başarı, uyarı ve hata renkleri

### Tipografi
- **Başlıklar**: Outfit font ailesi - Arkadaş canlısı, modern, yuvarlak hatlı
- **Gövde Metni**: Inter font ailesi - Yüksek okunabilirlik
- **Tracking**: Başlıklarda `tracking-tight` ile modern görünüm

### UI Elemanları
- **Kartlar**: Yumuşak gölgeler, cömert yuvarlatma (rounded-2xl), hover efektleri
- **Butonlar**: Yuvarlatılmış köşeler (rounded-xl), yumuşak gölgeler
- **İkonlar**: İnce çizgili, yuvarlak hatlı (Lucide Icons)

## 📊 Admin Paneli Özellikleri

### Dashboard
- **Genel İstatistikler**: Toplam kullanıcı, öğrenci, sınıf ve aktivite sayıları
- **Hızlı Erişim**: Tüm yönetim sayfalarına kolay navigasyon
- **Gerçek Zamanlı Veriler**: Anlık sistem durumu

### Kullanıcı Yönetimi (`/admin/users`)
- ✅ **Listeleme**: Tüm kullanıcıları sayfalama, arama ve rol filtreleme ile görüntüleme
- ✅ **Ekleme**: Yeni kullanıcı ekleme (Admin, Öğretmen, Veli)
- ✅ **Düzenleme**: Kullanıcı bilgilerini güncelleme
- ✅ **Silme**: Kullanıcı silme işlemi
- **Özellikler**: Email, ad soyad, rol, telefon, avatar URL yönetimi

### Öğrenci Yönetimi (`/admin/students`)
- ✅ **Listeleme**: Tüm öğrencileri sayfalama, arama ve sınıf filtreleme ile görüntüleme
- ✅ **Ekleme**: Yeni öğrenci ekleme
- ✅ **Düzenleme**: Öğrenci bilgilerini güncelleme
- ✅ **Silme**: Öğrenci silme işlemi
- **Özellikler**: Ad, soyad, doğum tarihi, cinsiyet, fotoğraf, kayıt tarihi yönetimi
- **Filtreleme**: Sınıfa göre filtreleme (veritabanındaki gerçek sınıflardan)

### Sınıf Yönetimi (`/admin/classes`)
- ✅ **Listeleme**: Tüm sınıfları sayfalama ve arama ile görüntüleme
- ✅ **Ekleme**: Yeni sınıf oluşturma
- ✅ **Düzenleme**: Sınıf bilgilerini güncelleme
- ✅ **Silme**: Sınıf silme işlemi
- **Özellikler**: Sınıf adı, yaş grubu, kapasite, akademik yıl yönetimi
- **Görselleştirme**: Öğrenci doluluk oranı, aktif/pasif durumu

### Aktivite Yönetimi (`/admin/activities`)
- ✅ **Listeleme**: Tüm aktiviteleri sayfalama ve arama ile görüntüleme
- ✅ **Ekleme**: Yeni aktivite oluşturma
- ✅ **Düzenleme**: Aktivite bilgilerini güncelleme
- ✅ **Silme**: Aktivite silme işlemi
- **Özellikler**: 
  - Başlık, açıklama, gelişim alanı seçimi
  - Yaş aralığı (min-max)
  - Zorluk seviyesi (1-5)
  - Süre, gerekli malzemeler, talimatlar
  - Görsel ve video URL'leri
- **Filtreleme**: Gelişim alanına göre aktiviteler

### Değerlendirme Yönetimi (`/admin/assessments`)
- ✅ **Listeleme**: Tüm değerlendirmeleri sayfalama ile görüntüleme
- ✅ **Silme**: Değerlendirme silme işlemi
- **Özellikler**: 
  - Öğrenci ve değerlendiren bilgileri
  - Değerlendirme tarihi ve notlar
  - 10 gelişim alanı için skorlar (1-5 veya yüzdelik)
  - Gözlem notları

## 👨‍🏫 Öğretmen Paneli Özellikleri

### Dashboard (`/teacher/dashboard`)
- **İstatistikler**: 
  - Toplam sınıf sayısı
  - Toplam öğrenci sayısı
  - Bugünkü aktivite önerileri
  - Son değerlendirmeler
- **Sınıf Listesi**: Öğretmenin sorumlu olduğu sınıflar
- **Günün Nöro-Aktivitesi**: Öğrenciler için önerilen aktiviteler

### Sınıf Yönetimi (`/teacher/classes`)
- ✅ **Sınıf Listesi**: Öğretmenin tüm sınıflarını görüntüleme
- ✅ **Sınıf Detayı**: 
  - Sınıf bilgileri (ad, yaş grubu, akademik yıl)
  - Öğrenci listesi (aktif/pasif durumu)
  - Öğrenci yaşları
  - Sınıf kapasitesi ve doluluk oranı

### Öğrenci Yönetimi (`/teacher/students`)
- ✅ **Öğrenci Listesi**: Tüm sınıflardaki öğrencileri görüntüleme
- ✅ **Arama**: Öğrenci ismi ile arama
- ✅ **Öğrenci Detayı**:
  - Öğrenci bilgileri (ad, soyad, yaş, cinsiyet)
  - Sınıf bilgisi
  - Değerlendirme geçmişi
  - Günlük loglar
  - Gelişim skorları

### Değerlendirmeler (`/teacher/assessments`)
- ✅ **Değerlendirme Listesi**: Öğretmenin yaptığı tüm değerlendirmeler
- ✅ **Değerlendirme Detayları**: 
  - Öğrenci bilgileri
  - Değerlendirme tarihi
  - 10 gelişim alanı için skorlar
  - Gözlem notları

### Aktiviteler (`/teacher/activities`)
- ✅ **Aktivite Listesi**: Öğrenciler için önerilen aktiviteler
- ✅ **Aktivite Detayları**: 
  - Aktivite açıklaması
  - Gelişim alanı
  - Yaş aralığı ve zorluk seviyesi
  - Gerekli malzemeler ve talimatlar

### Günlük Loglar (`/teacher/daily-logs`)
- ✅ **Log Listesi**: Öğrencilerin günlük aktiviteleri
- ✅ **Log Detayları**: 
  - Yemek takibi (kahvaltı, öğle yemeği, atıştırmalık)
  - Uyku takibi (başlangıç, bitiş, süre, kalite)
  - Tuvalet takibi (ziyaret sayısı, kazalar)
  - Genel notlar

## 👨‍👩‍👧 Veli Paneli Özellikleri

### Dashboard (`/parent/dashboard`)
- **Çocuk Listesi**: Velinin tüm çocuklarını görüntüleme
- **Gelişim Özeti**: 
  - Her çocuk için gelişim alanları özeti
  - Son değerlendirme tarihleri
  - Aktif aktivite önerileri sayısı

### Çocuklarım (`/parent/children`)
- ✅ **Çocuk Listesi**: Tüm çocukların listesi
- ✅ **Çocuk Detayı** (`/parent/children/[id]`):
  - Çocuk bilgileri (ad, soyad, yaş, sınıf)
  - Gelişim skorları (10 alan)
  - Aktivite önerileri
  - Günlük loglar
  - Değerlendirme geçmişi

### Gelişim Raporları (`/parent/reports`)
- ✅ **Rapor Listesi**: Çocukların gelişim raporları
- ✅ **Rapor Detayları**: 
  - Haftalık, aylık, üç aylık raporlar
  - Gelişim alanları grafikleri
  - Değerlendirme özetleri
  - Trend analizleri

### Önerilen Aktiviteler (`/parent/activities`)
- ✅ **Aktivite Listesi**: Çocuklar için önerilen aktiviteler
- ✅ **Aktivite Detayları**: 
  - Aktivite açıklaması
  - Gelişim alanı
  - Evde uygulama talimatları
  - Gerekli malzemeler

### Takvim (`/parent/calendar`)
- 📅 **Takvim Görünümü**: Çocuğun aktiviteleri ve etkinlikleri (geliştirilecek)

## 🔧 Teknik Özellikler

### Backend
- **Veritabanı**: Neon PostgreSQL (production), Prisma ORM
- **API Yapısı**: Next.js API Routes
- **Validasyon**: Zod schema validation
- **Hata Yönetimi**: Merkezi error handling
- **Pagination**: Tüm listeleme sayfalarında sayfalama desteği
- **Arama ve Filtreleme**: Gelişmiş arama ve filtreleme özellikleri

### Frontend
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **State Management**: TanStack Query (React Query)
- **UI Kütüphanesi**: Shadcn/UI + Tailwind CSS
- **Optimizasyon**: 
  - API isteklerini cache'leme
  - Stale time ve garbage collection ayarları
  - Window focus'ta otomatik refetch yapılmaz
  - Mount'ta refetch yapılır

### Veri Yönetimi
- **CRUD İşlemleri**: Tüm modüller için Create, Read, Update, Delete
- **İlişkisel Veriler**: 
  - Öğrenci-Sınıf ilişkileri
  - Öğrenci-Veli ilişkileri
  - Öğretmen-Sınıf ilişkileri
  - Değerlendirme-Skor ilişkileri
- **Seed Data**: 20 öğretmen, 20 öğrenci, 20 veli, 6 sınıf, 15 aktivite, 20 değerlendirme

## 📱 Responsive Tasarım

Tüm sayfalar mobil, tablet ve masaüstü cihazlarda optimize edilmiştir:
- **Mobil**: Tek sütun düzeni, dokunmatik dostu butonlar
- **Tablet**: İki sütun grid düzeni
- **Masaüstü**: Çok sütunlu, geniş ekran optimizasyonu

## 🚀 Gelecek Özellikler

### Planlanan Geliştirmeler
- [ ] Değerlendirme oluşturma formu (öğretmen paneli)
- [ ] Günlük log oluşturma formu (öğretmen paneli)
- [ ] Gelişim raporu otomatik oluşturma
- [ ] Grafik ve görselleştirmeler (Recharts)
- [ ] PDF/Excel export
- [ ] Toast notification sistemi
- [ ] Medya yönetimi (fotoğraf/video yükleme)
- [ ] Mood tracker (duygu durumu takibi)
- [ ] Sağlık kayıtları (boy/kilo takibi)
- [ ] Psikolog notları (gizli alan)
- [ ] Aktivite öneri algoritması iyileştirme
- [ ] AI entegrasyonu (otomatik rapor oluşturma)

## 📊 Veritabanı Yapısı

### Modüller
1. **Kullanıcı Yönetimi (RBAC)**: Admin, Teacher, Parent rolleri
2. **Nörogelişimsel Takip Sistemi**: 10 gelişim alanı, değerlendirmeler, skorlar
3. **Eğitim ve Oyun Havuzu**: Aktiviteler, aktivite önerileri
4. **Günlük Akış ve İletişim**: Günlük loglar, medya
5. **Sağlık ve Psikoloji**: Sağlık kayıtları, psikolog notları (planlanan)

## 🎓 Eğitim Metodolojisi

Platform, aşağıdaki metodolojilerden esinlenilmiştir:
- **MindChamps**: Erken çocukluk eğitimi yaklaşımı
- **Harvard Center on the Developing Child**: Nörobilimsel gelişim araştırmaları

## 💡 Öne Çıkan Özellikler

1. **Bütünsel Gelişim Takibi**: Sadece akademik değil, duygusal ve sosyal gelişim de takip edilir
2. **Bilimsel Temel**: Nörobilimsel araştırmalara dayalı 10 gelişim alanı
3. **Kişiselleştirilmiş Öneriler**: Her çocuk için gelişim alanına göre aktivite önerileri
4. **Şeffaf İletişim**: Veliler çocuklarının günlük aktivitelerini ve gelişimini takip edebilir
5. **Kapsamlı Yönetim**: Admin paneli ile tüm sistem tek yerden yönetilebilir
6. **Modern Tasarım**: Premium, organik ve sıcak bir kullanıcı deneyimi

## 🔐 Güvenlik ve Gizlilik

- **Rol Tabanlı Erişim**: Her kullanıcı rolüne göre sınırlı erişim
- **Veri Güvenliği**: PostgreSQL veritabanı ile güvenli veri saklama
- **API Güvenliği**: Zod validation ile input doğrulama
- **Hata Yönetimi**: Merkezi error handling ile güvenli hata mesajları

---

**Harmoni Anaokulu** - Nörobilim Temelli Bütünleşik Eğitim Platformu
*Zihin ve Kalbin Uyumu*

