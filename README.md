# NewHomePage

Next.js (App Router) + TypeScript + Prisma bilan qurilgan korporativ sayt va admin CMS.

## Ishga tushirish (lokal)

Lokal ishlab chiqish uchun hozircha **SQLite** ishlatiladi (server o'rnatish shart emas, `.env`dagi `DATABASE_URL="file:./dev.db"`). Production'da (VPS) PostgreSQL'ga o'tkaziladi — pastdagi "Production" bo'limiga qarang.

1. Bog'liqliklarni o'rnating (agar hali o'rnatilmagan bo'lsa):

```bash
npm install
```

2. Bazaga schema'ni qo'llang (birinchi marta yoki schema o'zgarganda):

```bash
npx prisma migrate dev
```

3. Boshlang'ich admin foydalanuvchi, namuna mahsulotlar va yangiliklarni yaratish uchun seed'ni ishga tushiring:

```bash
npm run db:seed
```

Standart admin login: `admin@newhomepage.com` / `admin1234!` (`.env` dagi `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` orqali o'zgartirish mumkin).

4. Dev serverni ishga tushiring:

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

Production'da PostgreSQL ishlatiladi (`docker-compose.yml` shu uchun tayyor):

1. `prisma/schema.prisma`dagi `datasource db` blokida `provider = "sqlite"` ni `provider = "postgresql"` ga qaytaring.
2. `.env`da `DATABASE_URL`ni Postgres connection string'iga o'zgartiring (`docker compose up -d` bilan ishga tushirilgan bazaga).
3. `npx prisma migrate dev --name init_postgres` bilan yangi migratsiya yarating (SQLite migratsiyalarini o'chirib, qaytadan boshlash kerak bo'lishi mumkin).
4. `npm run db:seed`, so'ng `npm run build && npm run start`.

`JWT_SECRET` va `NEXT_PUBLIC_SITE_URL`ni ham production qiymatlariga o'zgartiring.
