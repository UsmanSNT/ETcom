# NewHomePage

Next.js (App Router) + TypeScript + Prisma/PostgreSQL bilan qurilgan korporativ sayt va admin CMS.

## Ishga tushirish (lokal)

1. PostgreSQL'ni Docker orqali ishga tushiring:

```bash
docker compose up -d
```

2. Bog'liqliklarni o'rnating (agar hali o'rnatilmagan bo'lsa):

```bash
npm install
```

3. Bazaga schema'ni qo'llang:

```bash
npx prisma migrate dev --name init
```

4. Boshlang'ich admin foydalanuvchi va bitta kategoriya yaratish uchun seed'ni ishga tushiring:

```bash
npm run db:seed
```

Standart admin login: `admin@newhomepage.com` / `admin1234!` (`.env` dagi `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` orqali o'zgartirish mumkin).

5. Dev serverni ishga tushiring:

```bash
npm run dev
```

- Sayt: http://localhost:3000
- Admin panel: http://localhost:3000/admin/login

## Loyiha tuzilishi

- `src/app` — public sahifalar (`/`, `/about`, `/business`, `/products`, `/promotion`, `/contact`) va `/admin` panel
- `src/app/api` — public va admin API route'lari
- `src/lib/i18n/dictionaries.ts` — KO/EN matn resurslari
- `prisma/schema.prisma` — ma'lumotlar bazasi modeli

## Production (VPS)

`docker-compose.yml` PostgreSQL uchun. Next.js ilovasini alohida Dockerfile bilan (keyingi bosqichda qo'shiladi) yoki `npm run build && npm run start` orqali ishga tushirish mumkin. `.env` faylida `DATABASE_URL`, `JWT_SECRET` va `NEXT_PUBLIC_SITE_URL` production qiymatlariga o'zgartirilishi kerak.
