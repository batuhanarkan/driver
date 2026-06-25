# VipDrive — Tasarım Dokümanı (Spec)

**Tarih:** 2026-06-24
**Durum:** Onaylandı (brainstorming) — implementasyon "başla" komutu beklemede
**Marka:** VipDrive

---

## 1. Amaç & Kapsam

VipDrive, premium şoförlü ulaşım ve seyahat hizmetleri için bir **web sitesi + admin paneli**dir.
Referans olarak bobthedriver.com (Travelium) sitesinin **sayfa şablonları/akışı** birebir alınır;
ancak marka, metinler ve görsel tasarım **tamamen özgün** (VipDrive) olur — telif/marka riski yok.

**İş modeli:** Ödeme YOK. Kullanıcı web'den hizmet seçip **sipariş/talep** oluşturur; talep doğrudan
admin paneline düşer. İşletme talebi panelden yönetir (onaylar / durum değiştirir).

### Kararlaştırılan kapsam
- **Stack:** Next.js (App Router) + TypeScript
- **Hizmetler:** 5 kategori, hepsinde tam sipariş akışı
- **Dil:** Sadece Türkçe
- **Admin:** Tam yönetim (dashboard + içerik + raporlar)
- **Üyelik:** E-posta + şifre (rol bazlı: USER / ADMIN)
- **Ödeme:** Yok

---

## 2. Teknoloji Yığını

| Katman | Seçim |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui |
| Mutasyon | Server Actions + Zod doğrulama |
| ORM | Prisma |
| Veritabanı | PostgreSQL (lokal dev; Vercel'de Neon) |
| Auth | Auth.js (NextAuth v5) — Credentials + bcrypt, rol bazlı |
| State (sepet) | Zustand (client, localStorage'a persist) |
| Test | Vitest (birim) + Playwright (e2e) |
| Deploy | Vercel |

### Route grup yapısı
```
app/
├── (web)        → Halka açık site (web layout: üst menü + footer)
├── (auth)       → Giriş / Kayıt (sade layout)
├── (account)    → Kullanıcı paneli (giriş gerekli)
├── admin        → Admin panel (sadece ADMIN; sidebar layout)
└── api          → Yardımcı uçlar (gerekirse)
```
Parantezli gruplar URL'e yansımaz; sadece layout izolasyonu sağlar.

---

## 3. Veri Modeli (Prisma)

```
User      id, ad, email (uniq), şifreHash, telefon, rol (USER|ADMIN), createdAt
Service   id, slug, kategori (CHAUFFEUR|TRANSFER|TOUR|GUIDE|GREETING),
          başlık, açıklama, kapakGörsel, görseller[], temelFiyat, aktif (bool)
Vehicle   id, ad, sınıf (EKONOMI|BUSINESS|VAN|LUKS), kapasite, görsel, fiyat
Order     id, siparişNo, userId, durum (enum), toplamTutar, not, createdAt
OrderItem id, orderId, serviceId, vehicleId?, detay (JSON), birimFiyat, adet
Campaign  id, başlık, açıklama, görsel, indirimYüzde, aktif (bool)
Lead      id, tip (İLETİŞİM|KURUMSAL|KARİYER), ad, email, telefon, mesaj, createdAt
```

### Sipariş durum makinesi
```
BEKLEMEDE → ONAYLANDI → DEVAM_EDIYOR → TAMAMLANDI
     └──────────────────→ İPTAL   (her aşamadan geçilebilir)
```

### Tasarım kararları
- **Order + OrderItem ayrımı:** Bir sipariş birden çok hizmet satırı içerebilir
  (ör. transfer + tur tek siparişte).
- **`detay` JSON alanı:** Her hizmet farklı alanlara sahip (transfer = alış/varış noktası;
  rehberlik = dil/saat). Sabit kolon yerine esnek JSON + form tarafında Zod ile tip güvenliği.
  Bu karar "5 farklı hizmet, tek sipariş modeli" hedefini mümkün kılar.
- **Lead tek tablo:** İletişim / kurumsal / kariyer formları tek `Lead` tablosunda;
  admin "Talepler" ekranında `tip` filtresiyle ayrışır.

---

## 4. Sayfa Haritası

### Web (halka açık)
| Route | İçerik |
|---|---|
| `/` | Ana sayfa: hero + rezervasyon arama formu + hizmet kartları + fırsatlar |
| `/hizmetler/[kategori]` | Hizmet detay sayfası (5 kategori) |
| `/rezervasyon` | Çok adımlı sipariş/talep formu |
| `/sepet` | Sepet |
| `/firsatlar` | Kampanyalar listesi |
| `/kurumsal` | Kurumsal başvuru formu |
| `/kariyer` | "Bizimle çalışır mısınız?" başvuru formu |
| `/iletisim` | İletişim formu + bilgiler |
| `/gizlilik`, `/sartlar` | Yasal sayfalar |

### Auth & Hesap
| Route | İçerik |
|---|---|
| `/giris` | Giriş |
| `/kayit` | Kayıt |
| `/hesabim` | Profil + Siparişlerim |

### Admin (`/admin`, sadece ADMIN)
| Route | İçerik |
|---|---|
| `/admin` | Dashboard: bugünkü/bekleyen sipariş, toplam, hızlı istatistik |
| `/admin/siparisler` | Sipariş listesi + filtre + durum değiştir |
| `/admin/siparisler/[id]` | Sipariş detay |
| `/admin/hizmetler` | Hizmet/fiyat CRUD |
| `/admin/kampanyalar` | Kampanya CRUD |
| `/admin/kullanicilar` | Kullanıcı listesi |
| `/admin/talepler` | İletişim/kurumsal/kariyer form gönderimleri |
| `/admin/raporlar` | Basit raporlar (sipariş sayısı, kategori dağılımı vb.) |

---

## 5. Sipariş Akışı (ana akış)

```
Kullanıcı → hizmet seçer → /rezervasyon formu (tarih, lokasyon, araç, kişi)
  → "Sepete ekle" (Zustand client state)
    → /sepet → "Siparişi Gönder"
      → [giriş gerekli; değilse /giris'e yönlendir]
        → Server Action createOrder() (Zod doğrulama)
          → DB'ye Order(BEKLEMEDE) + OrderItem'lar yazılır
            → Admin /admin/siparisler'de görür (revalidate)
            → Kullanıcı /hesabim'da siparişini görür
```

---

## 6. Güvenlik & Roller

- **Şifreler:** bcrypt ile hash'lenir, asla düz metin saklanmaz.
- **Erişim kontrolü:** `middleware` + layout guard
  - `/admin/*` → sadece `ADMIN` rolü
  - `/hesabim` → giriş yapmış kullanıcı
- **Session:** Auth.js JWT.
- **İlk admin:** seed script ile bir ADMIN kullanıcısı oluşturulur.

---

## 7. Tasarım Dili (görsel)

- **Hava:** Premium / lüks şoför & seyahat.
- **Palet:** Koyu zemin + altın/şampanya vurgu, bol beyaz alan.
- **Detaylar:** Yumuşak animasyonlar, büyük tipografi, kaliteli görseller.
- Implementasyonda `frontend-design` skill'i kullanılacak — jenerik "AI görünümü"nden kaçınılır.

---

## 8. Test Stratejisi

- **Birim (Vitest):** fiyat hesaplama, sipariş durum geçişleri, `createOrder` doğrulama.
- **E2E (Playwright):** "kayıt ol → hizmet seç → sepet → sipariş gönder → admin görür" akışı.
- TDD yaklaşımı: kritik iş mantığı için önce test.

---

## 9. Kapsam Dışı (YAGNI)

- Online ödeme / banka entegrasyonu (model dışı).
- Çok dillilik (sadece Türkçe).
- Sosyal giriş (Google vb.) — sonradan eklenebilir.
- Gerçek e-posta gönderimi (MVP'de opsiyonel; sipariş bildirimi panelde görünür).

---

## 10. Sonraki Adım

Spec onayı sonrası `writing-plans` skill'i ile adım adım uygulama planı çıkarılacak.
**Not:** Kullanıcı "başla" diyene kadar scaffolding/kod yazılmayacak.
