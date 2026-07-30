# Production Deploy — ETcomp (etcom.app.re.kr)

## 1. Stack

- **Next.js 16 (App Router)** — frontend + API routes bitta ilovada
- **Prisma + PostgreSQL** — ma'lumotlar bazasi
- **PM2** — process manager (server: Node.js, npm, PM2 allaqachon o'rnatilgan)
- **Nginx** — reverse proxy + mavjud Let's Encrypt SSL

Statik export (Vite/SPA) emas — bu server-side render qiluvchi Node ilova, shuning uchun har doim PM2 orqali ishlab turishi kerak, faqat Nginx orqali fayl xizmat qilinmaydi.

**Fayl yuklash (upload) mavjud.** Mahsulot/post rasmlari admin panelda to'g'ridan-to'g'ri kompyuterdan yuklanadi (yoki xohlasa tashqi URL ham kiritish mumkin). Fayllar `public/uploads/` papkasiga yoziladi va Next.js orqali `/uploads/<fayl>` manzilida avtomatik xizmat qilinadi.

Bu papka **git tomonidan kuzatilmaydi** (`.gitignore`da `/public/uploads/*` istisno qilingan), shuning uchun serverda `git pull` qilinganda mavjud yuklangan rasmlar hech qachon o'chirilmaydi yoki qayta yozilmaydi — bu avtomatik persistence beradi, qo'shimcha sozlash shart emas. Faqat papka birinchi marta mavjud va yozish huquqiga ega bo'lishi kerak:

```bash
mkdir -p /var/www/ETcomp/public/uploads
chown -R $(whoami):$(whoami) /var/www/ETcomp/public/uploads
```

---

## 2. Serverda birinchi marta tayyorlash (bir marta bajariladi)

SSH orqali serverga kiring:

```bash
ssh root@49.247.205.179
```

### 2.1 PostgreSQL o'rnatish (agar hali yo'q bo'lsa)

```bash
apt update
apt install -y postgresql postgresql-contrib
systemctl enable --now postgresql
```

### 2.2 Baza va foydalanuvchi yaratish

```bash
sudo -u postgres psql -c "CREATE USER etcomp_user WITH PASSWORD 'STRONG_PASSWORD_BUNI_ALMASHTIRING';"
sudo -u postgres psql -c "CREATE DATABASE etcomp OWNER etcomp_user;"
```

> `STRONG_PASSWORD_BUNI_ALMASHTIRING` o'rniga kuchli parol qo'ying — buni keyinroq `.env`dagi `DATABASE_URL`da ishlatasiz. Parolni biror joyga yozib qo'ying, faqat sizda saqlansin.

### 2.3 Loyiha papkasini tayyorlash

```bash
mkdir -p /var/www/ETcomp/logs
```

(Mavjud vaqtinchalik `index.html` fayllarini keyingi bosqichda WinSCP orqali fayllar yuklanganda ustidan yozib yuborasiz — alohida o'chirish shart emas, loyiha fayllari ularni almashtiradi.)

---

## 3. Qaysi fayllarni WinSCP orqali yuklash kerak

`/var/www/ETcomp` ichiga **butun loyiha papkasini** yuklang, **quyidagilardan tashqari** (bularni **yuklamang**):

| Yuklamang | Sabab |
|---|---|
| `node_modules/` | Serverda `npm install` orqali o'rnatiladi |
| `.next/` | Serverda `npm run build` orqali yaratiladi |
| `.env` | Maxfiy — serverda alohida qo'lda yaratasiz (pastga qarang) |
| `.git/` | Kerak emas |
| `prisma/dev.db*` (agar bo'lsa) | Faqat lokal SQLite sinov fayli, production'da ishlatilmaydi |

**Yuklaydigan asosiy narsalar**: `src/`, `prisma/` (schema + migrations), `public/`, `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `ecosystem.config.js`, `.env.example`, `eslint.config.mjs`.

---

## 4. Serverda birinchi deploy

Fayllar yuklangandan so'ng:

```bash
cd /var/www/ETcomp
```

### 4.1 `.env` faylini yarating (WinSCP orqali emas, to'g'ridan-to'g'ri serverda)

```bash
nano .env
```

Quyidagini joylashtiring (qiymatlarni o'zingiznikiga almashtiring):

```
DATABASE_URL="postgresql://etcomp_user:STRONG_PASSWORD_BUNI_ALMASHTIRING@localhost:5432/etcomp?schema=public"
JWT_SECRET="uzun-tasodifiy-satr-generatsiya-qiling"
NEXT_PUBLIC_SITE_URL="https://etcom.app.re.kr"
PORT=3000
NODE_ENV=production
SEED_ADMIN_EMAIL="admin@etcompany.co.kr"
SEED_ADMIN_PASSWORD="kuchli-parol"
```

`JWT_SECRET` uchun tasodifiy qiymat generatsiya qilish:

```bash
openssl rand -base64 48
```

Saqlab chiqing (Ctrl+O, Enter, Ctrl+X).

### 4.2 O'rnatish, migratsiya, build

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run build
```

- `npm install` — `postinstall` orqali `prisma generate`ni ham avtomatik bajaradi.
- `npx prisma migrate deploy` — `prisma/migrations/` papkasidagi tayyor migratsiyani bazaga qo'llaydi (jadvallarni yaratadi).
- `npm run db:seed` — birinchi admin foydalanuvchi (`.env`dagi `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`) va namuna ma'lumotlarni yaratadi. **Faqat birinchi marta ishlatiladi** — keyingi deploylarda bu qadamni o'tkazib yuboring (aks holda takroriy ma'lumot yaratmaydi, chunki seed skripti mavjud yozuvlarni tekshiradi, lekin admin userni safe upsert qiladi).

### 4.3 PM2 orqali ishga tushirish

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

`pm2 startup` buyrug'i ekranga yana bitta buyruq chiqaradi (masalan `sudo env PATH=... pm2 startup systemd -u root --hp /root`) — **o'sha buyruqni ham nusxalab bajaring**, shunda server qayta yuklanganda PM2 avtomatik ishga tushadi.

Holatni tekshirish:

```bash
pm2 status
pm2 logs ETcomp --lines 50
```

---

## 5. Nginx

Joriy konfiguratsiyani backup qiling:

```bash
cp /etc/nginx/sites-available/ETcomp /etc/nginx/sites-available/ETcomp.bak.$(date +%Y%m%d%H%M%S)
```

Loyiha ichidagi tayyor faylni serverga ko'chiring va joylashtiring (`deploy/nginx-etcomp.conf` fayli allaqachon `/var/www/ETcomp/deploy/` ichida — WinSCP orqali yuklangan bo'ladi):

```bash
cp /var/www/ETcomp/deploy/nginx-etcomp.conf /etc/nginx/sites-available/ETcomp
nginx -t
systemctl reload nginx
```

`nginx -t` xato bermasa, `systemctl reload nginx` ishlaydi. Xato chiqsa, backup fayldan qaytaring (pastdagi Rollback bo'limiga qarang).

Saytni tekshiring: **https://etcom.app.re.kr**

---

## 6. Keyingi deploylar (yangilanish)

Kod o'zgarganda:

```bash
cd /var/www/ETcomp
# WinSCP orqali yangilangan fayllarni yuklang (node_modules/.next/.env dan tashqari)
npm install
npx prisma migrate deploy   # faqat schema o'zgargan bo'lsa kerak
npm run build
pm2 restart ETcomp
```

---

## 7. Loglarni tekshirish

```bash
pm2 logs ETcomp --lines 100          # ilova loglari
tail -f /var/log/nginx/error.log     # Nginx xatolari
tail -f /var/log/nginx/access.log    # Nginx so'rovlar
journalctl -u postgresql -n 50       # PostgreSQL loglari
```

---

## 8. Rollback (orqaga qaytarish)

**Nginx konfiguratsiyasini qaytarish:**

```bash
cp /etc/nginx/sites-available/ETcomp.bak.<sana> /etc/nginx/sites-available/ETcomp
nginx -t && systemctl reload nginx
```

**Ilovani oldingi holatga qaytarish** (agar yangi deploy buzilgan bo'lsa):

```bash
pm2 stop ETcomp
# eski fayllarni qayta yuklang yoki git orqali oldingi commitga qayting
npm install
npm run build
pm2 restart ETcomp
```

**Baza migratsiyasini orqaga qaytarish** — Prisma avtomatik "down" migratsiya yaratmaydi. Agar oxirgi migratsiya muammoli bo'lsa, `prisma/migrations/` papkasidagi oxirgi migratsiya papkasini qo'lda tahlil qilib, teskari SQL yozib bajarish kerak bo'ladi. Muhim o'zgarishlardan oldin bazani zaxiralang:

```bash
pg_dump -U etcomp_user -h localhost etcomp > /root/backups/etcomp_$(date +%Y%m%d%H%M%S).sql
```

---

## 9. Tez-tez ishlatiladigan tekshiruv buyruqlari

```bash
pm2 status                  # ilova ishlab turibdimi
curl -I http://127.0.0.1:3000   # Next.js to'g'ridan-to'g'ri javob beryaptimi
curl -I https://etcom.app.re.kr # Nginx orqali tashqaridan javob keladimi
```
