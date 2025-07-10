# Komplekin - Next.js + TypeScript + Supabase + Shadcn UI

Template lengkap untuk aplikasi web modern dengan autentikasi, middleware protection, dan komponen UI yang indah menggunakan teknologi terbaru 2025.

## 🚀 Fitur Utama

- **Next.js 15** dengan App Router, TypeScript, dan Turbopack support
- **Supabase** untuk autentikasi dan database dengan SSR support terbaru
- **Shadcn UI** untuk komponen UI yang indah dan customizable
- **Tailwind CSS v4** tanpa file konfigurasi terpisah
- **Middleware Protection** untuk routes yang memerlukan autentikasi
- **Halaman Auth** dengan form login/register yang responsive
- **Dashboard Apps** dan **Admin** dengan tampilan yang modern
- **TypeScript strict mode** untuk type safety
- **ESLint** konfigurasi dengan aturan yang ketat

## 📁 Struktur Project

```
komplekin/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   └── page.tsx       # Halaman autentikasi (login/register)
│   │   ├── apps/
│   │   │   └── page.tsx       # Dashboard aplikasi (protected)
│   │   ├── admin/
│   │   │   └── page.tsx       # Dashboard admin (protected)
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles dengan Tailwind v4
│   ├── components/
│   │   └── ui/                # Komponen Shadcn UI
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── label.tsx
│   ├── hooks/
│   │   └── useAuth.ts         # Custom hook untuk autentikasi
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      # Client-side Supabase
│   │   │   └── server.ts      # Server-side Supabase
│   │   └── utils.ts           # Utility functions (cn, dll)
│   ├── services/
│   │   └── auth.ts            # Service untuk autentikasi
│   └── types/
│       └── supabase.ts        # Type definitions
├── middleware.ts              # Middleware untuk route protection
├── components.json            # Konfigurasi Shadcn UI
├── env.template               # Template environment variables
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs         # PostCSS untuk Tailwind v4
└── eslint.config.mjs          # ESLint configuration
```

## 🛠️ Cara Setup

### 1. Clone & Install

```bash
git clone <repository-url>
cd komplekin
npm install
```

### 2. Setup Environment Variables

Copy file template dan isi dengan konfigurasi Supabase:

```bash
cp env.template .env.local
```

Edit `.env.local` dengan nilai yang sesuai:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Setup Supabase

1. Buat project baru di [Supabase](https://app.supabase.com)
2. Pergi ke **Settings > API**
3. Copy **Project URL** dan **anon public** key
4. Paste ke dalam `.env.local`

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi.

## 🔐 Sistem Autentikasi

### Protected Routes

- `/apps` - Dashboard aplikasi (memerlukan login)
- `/admin` - Dashboard admin (memerlukan login + role admin)

### Middleware Protection

File `middleware.ts` mengatur akses ke routes:
- Redirect user yang belum login ke `/auth`
- Melindungi routes `/apps` dan `/admin`
- Membatasi akses `/admin` hanya untuk user dengan role admin

### Auth Flow

1. User mengakses halaman `/auth`
2. Bisa memilih Login atau Register
3. Setelah berhasil login, diarahkan ke `/apps`
4. Jika memiliki role admin, bisa mengakses `/admin`

## 🎨 Komponen UI

### Shadcn UI Components

Yang sudah diinstall:
- `Button` - Untuk tombol dengan berbagai variant
- `Card` - Untuk container konten
- `Input` - Untuk form input
- `Label` - Untuk label form

### Menambah Component Baru

```bash
npx shadcn@latest add [component-name]
```

Contoh:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add toast
npx shadcn@latest add dropdown-menu
```

## 📱 Responsive Design

Semua komponen sudah responsive dengan breakpoints Tailwind:
- **Mobile**: default (< 768px)
- **Tablet**: `md:` (768px - 1024px)
- **Desktop**: `lg:` (> 1024px)

## 🔧 Konfigurasi

### Tailwind CSS v4

- **Tidak ada** file `tailwind.config.js`
- Semua konfigurasi ada di `src/app/globals.css`
- CSS variables untuk theming yang mudah dikustomisasi
- Dark mode support built-in

### Supabase SSR

Menggunakan `@supabase/ssr` dengan konfigurasi terpisah:

- **Client Components**: `src/lib/supabase/client.ts`
- **Server Components**: `src/lib/supabase/server.ts`
- **Middleware**: fungsi `createMiddlewareClient` di `server.ts`

### TypeScript

- **Strict mode** enabled
- **Path mapping** dengan `@/` untuk `src/`
- **Type definitions** untuk Supabase di `src/types/supabase.ts`

## 🚀 Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Import repository ke Vercel
3. Set environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-production-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
   ```
4. Deploy!

### Environment Variables Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## ⚡ Development Commands

```bash
# Development server dengan Turbopack
npm run dev

# Build untuk production
npm run build

# Start production server
npm run start

# Lint check
npm run lint
```

## 🆕 Teknologi Terbaru 2025

- **Next.js 15** - App Router, React Server Components
- **React 19** - Concurrent features, Suspense
- **TypeScript 5** - Strict mode, better inference
- **Tailwind CSS v4** - No config file, better performance
- **Supabase** - Latest auth & database features
- **Shadcn UI** - Modern, accessible components

## 📚 Dokumentasi

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Shadcn UI Docs](https://ui.shadcn.com)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail.

---

**Komplekin** - Template modern untuk aplikasi web dengan autentikasi lengkap 🚀
