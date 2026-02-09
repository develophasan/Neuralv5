# 🔐 Login Sistemi Geliştirme Planı

## Mevcut Durum
- Şu anda sistemde authentication yok
- Kullanıcılar direkt olarak `/admin`, `/teacher`, `/parent` sayfalarına erişebiliyor
- Role-based routing var ama login kontrolü yok

## Hedef
Her role için ayrı login sayfası:
- `/login/admin` - Admin girişi
- `/login/teacher` - Öğretmen girişi  
- `/login/parent` - Veli girişi

## Teknoloji Seçenekleri

### Seçenek 1: NextAuth.js (Önerilen)
- ✅ Next.js ile native entegrasyon
- ✅ Session yönetimi
- ✅ Middleware ile route koruma
- ✅ JWT veya database session
- ✅ OAuth desteği (Google, GitHub vb.)

### Seçenek 2: Custom Auth (Basit)
- ✅ Email + Password ile login
- ✅ JWT token ile session
- ✅ Cookie-based authentication
- ❌ Daha fazla manuel kod

### Seçenek 3: Clerk / Auth0 (SaaS)
- ✅ Hızlı kurulum
- ✅ Enterprise özellikler
- ❌ Ücretli (ücretsiz tier var)
- ❌ External dependency

## Önerilen Yaklaşım: NextAuth.js

### Adımlar

1. **NextAuth.js Kurulumu**
   ```bash
   npm install next-auth
   ```

2. **Database Schema Güncellemesi**
   - `User` modeline `password` field ekle (hash'lenmiş)
   - Veya `authUserId` field'ını kullan (external auth)

3. **NextAuth Configuration**
   - `app/api/auth/[...nextauth]/route.ts` oluştur
   - Credentials provider (email + password)
   - JWT strategy
   - Session callback

4. **Login Sayfaları**
   - `/app/login/admin/page.tsx`
   - `/app/login/teacher/page.tsx`
   - `/app/login/parent/page.tsx`
   - Her biri kendi role'üne göre yönlendirme

5. **Middleware**
   - `middleware.ts` oluştur
   - Protected routes kontrolü
   - Role-based access control

6. **Seed Data Güncellemesi**
   - Test kullanıcılarına password ekle
   - Hash'lenmiş password'ler

## Database Schema Değişikliği

```prisma
model User {
  // ... mevcut fields
  password String? // bcrypt hash
  // veya
  // authUserId String? @map("auth_user_id") // External auth ID
}
```

## API Routes

```
POST /api/auth/login
  Body: { email, password, role }
  Response: { user, token }

POST /api/auth/logout
  Response: { success: true }

GET /api/auth/session
  Response: { user, role }
```

## Middleware Logic

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = getSession()
  
  // Login sayfalarına erişim kontrolü
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (session && session.role === expectedRole) {
      return redirect('/admin') // veya /teacher, /parent
    }
  }
  
  // Protected routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session || session.role !== 'admin') {
      return redirect('/login/admin')
    }
  }
  
  // Aynı şekilde /teacher ve /parent için
}
```

## UI Components

- Login form component (reusable)
- Password input (show/hide toggle)
- Error messages
- Loading states
- "Remember me" checkbox

## Güvenlik

- ✅ Password hashing (bcrypt)
- ✅ Rate limiting (login attempts)
- ✅ CSRF protection
- ✅ Secure cookies (httpOnly, secure)
- ✅ Session timeout

## Test Kullanıcıları

Seed data'ya eklenecek:
- Admin: `admin@harmoni.com` / `admin123`
- Teacher: `ogretmen1@harmoni.com` / `teacher123`
- Parent: `veli1@harmoni.com` / `parent123`

---

## Onay Bekleniyor

Bu planı uygulamak için izin gerekiyor. Hangi yaklaşımı tercih edersiniz?

1. ✅ NextAuth.js (Önerilen)
2. Custom Auth (Basit)
3. Clerk / Auth0 (SaaS)

Ayrıca:
- Password reset özelliği isteniyor mu?
- Email verification isteniyor mu?
- "Remember me" özelliği isteniyor mu?

