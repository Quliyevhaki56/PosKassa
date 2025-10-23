# Multi-Restoran Kassa Sistemi (POS)

Tam funksional, multi-restoran dəstəkli Point of Sale (POS) sistemi.

## Xüsusiyyətlər

- ✅ Masa idarəetməsi (boş, məşğul, ödəniş gözləyir)
- ✅ Kateqoriya və alt kateqoriya dəstəyi
- ✅ Real-time sifariş hesablaması
- ✅ Endirim tətbiqi (faiz və məbləğ)
- ✅ 3 ödəniş metodu (nağd, kart, qarışıq)
- ✅ Çek çapı (react-to-print)
- ✅ Müştəri ekranı (dual display)
- ✅ Redux state idarəetməsi
- ✅ Supabase database inteqrasiyası
- ✅ Row Level Security (RLS)
- ✅ Multi-restoran dəstəyi

## Texnologiyalar

- React 18
- Redux Toolkit
- React Router v6
- Supabase (PostgreSQL)
- Tailwind CSS
- Lucide React (icons)
- react-hot-toast
- react-to-print
- date-fns

## İlk Quraşdırma

### 1. İstifadəçi Yaratma

Supabase Auth panelindən istifadəçi yaradın:

```
Email: kassir@pos.local
Password: kassir123
```

### 2. İstifadəçini Database-ə əlavə edin

Supabase SQL Editor-də aşağıdakı sorğunu icra edin:

```sql
-- Əvvəlcə restaurant_id-ni tapın
SELECT id FROM restaurants WHERE name = 'Demo Restaurant';

-- Sonra istifadəçini əlavə edin (restaurant_id-ni yuxarıdakı nəticə ilə əvəz edin)
INSERT INTO users (id, restaurant_id, username, full_name, role, is_active)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'kassir@pos.local'),
  'RESTAURANT_ID_BURAYA',  -- Yuxarıdakı sorğudan gələn ID
  'kassir',
  'Demo Kassir',
  'cashier',
  true
);
```

## Sistemə Giriş

### POS Dashboard
1. `/pos/login` ünvanına gedin
2. İstifadəçi adı: `kassir`
3. Şifrə: `kassir123`
4. Giriş düyməsinə klikləyin

### Müştəri Ekranı
- `/customer-display` ünvanını ayrı brauzerdə və ya ekranda açın
- Bu ekran avtomatik olaraq aktiv sifarişi göstərəcək

## İstifadə

### 1. Masa Seçimi
- Sol paneldən masanı seçin
- Masa rəngi statusu göstərir:
  - 🟢 Yaşıl = Boş
  - 🔴 Qırmızı = Məşğul
  - 🟡 Sarı = Ödəniş gözləyir

### 2. Sifariş Əlavə Etmə
- Kateqoriya seçin
- Əgər alt kateqoriya varsa, onu seçin
- Məhsul kartına klikləyərək sifarişə əlavə edin

### 3. Sifariş İdarəetməsi
- `+` / `-` düymələri ilə miqdarı dəyişdirin
- 🗑️ düyməsi ilə məhsulu silin
- "Masanı təmizlə" düyməsi ilə bütün sifarişi ləğv edin

### 4. Endirim Tətbiqi
- "Endirim tətbiq et" düyməsinə klikləyin
- Faiz və ya məbləğ seçin
- Sürətli seçim və ya xüsusi məbləğ daxil edin

### 5. Ödəniş
**Nağd:**
- Verilən məbləği daxil edin
- Sistem avtomatik qalığı hesablayacaq

**Kart:**
- Terminal ödənişini təsdiqləyin
- Checkbox-u işarələyin

**Qarışıq:**
- Nağd məbləği daxil edin
- Kart məbləği daxil edin
- Cəm ümumi məbləğə bərabər olmalıdır

### 6. Çek Çapı
- Ödəniş yekunlaşdıqdan sonra avtomatik çap açılacaq
- Çek müştəriyə verin

### 7. Müştəri Ekranı
- Avtomatik olaraq cari sifarişi göstərir
- Real-time yenilənir
- İdle vəziyyətində qarşılama mesajı göstərir

## Database Strukturu

### Tables
- `restaurants` - Restoran məlumatları
- `users` - İstifadəçilər (kassir, admin, ofisiant)
- `categories` - Məhsul kateqoriyaları (hierarchy dəstəyi)
- `products` - Məhsullar və qiymətlər
- `tables` - Masalar və cari sifarişlər
- `completed_orders` - Yekunlaşdırılmış sifarişlər

### Row Level Security (RLS)
- Bütün cədvəllərdə RLS aktivdir
- İstifadəçilər yalnız öz restoranlarının datasına çıxış əldə edə bilər
- Autentifikasiya tələb olunur

## Əlavə Restoran Əlavə Etmə

1. `restaurants` cədvəlinə yeni restoran əlavə edin
2. Supabase Auth-da yeni istifadəçi yaradın
3. `users` cədvəlinə istifadəçini əlavə edin və `restaurant_id`-ni təyin edin
4. Restoran üçün kateqoriya, məhsul və masa əlavə edin

## Məsləhətlər

- **Dual Display:** İki monitorlu sistemlərdə müştəri ekranını ikinci monitorda tam ekran açın
- **Touch Screen:** Sistem toxunma ekranlar üçün optimizasiya olunub
- **Çap:** Çek çapı üçün əlavə printer tənzimləməsi tələb olunmur (brauzer çapı)
- **Offline:** Sistem online olmalıdır (Supabase inteqrasiyası)

## Problemlərin həlli

**Giriş Xətası:**
- Supabase Auth-da istifadəçinin yaradıldığını yoxlayın
- `users` cədvəlində istifadəçinin mövcud olduğunu yoxlayın
- `is_active = true` olduğunu yoxlayın

**Məlumat Görsənmir:**
- Restaurant ID-nin düzgün olduğunu yoxlayın
- RLS policies-lərin düzgün konfiqurasiya olunduğunu yoxlayın
- Brauzer konsolunda xətaları yoxlayın

**Çap İşləmir:**
- Brauzer çap icazəsini yoxlayın
- Popup blocker-i deaktiv edin

## Development

```bash
# Dependencies quraşdırın
npm install

# Development server
npm run dev

# Production build
npm run build

# Type check
npm run typecheck
```

## Təhlükəsizlik

- ✅ RLS aktivdir
- ✅ Autentifikasiya tələb olunur
- ✅ Restaurant isolation
- ✅ Secure password hash (Supabase Auth)
- ✅ HTTPS (production)

## Gələcək Təkmilləşdirmələr

- [ ] Admin Dashboard (restoran idarəetməsi)
- [ ] Hesabat və statistika
- [ ] Çoxlu dilin dəstəyi
- [ ] Oflayn rejim (PWA)
- [ ] Printer API inteqrasiyası
- [ ] Kupon sistemi
- [ ] Müştəri loyallıq proqramı
- [ ] Rezervasiya sistemi

## Lisenziya

MIT License

## Dəstək

Problemlər və ya suallar üçün issue açın.
