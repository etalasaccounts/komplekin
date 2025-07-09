# �� Komplekin Monorepo - Tutorial Lengkap

Monorepo Next.js dengan npm workspaces untuk aplikasi Komplekin. Tutorial ini akan memandu Anda dari setup hingga development pertama kali.

## 📋 Prerequisites (Prasyarat)

Pastikan Anda sudah install:
- **Node.js** versi 18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **VSCode** atau editor favorit Anda
- **Akun Supabase** gratis ([Daftar](https://supabase.com/))

## 🛠️ Setup Project (Langkah demi Langkah)

### Step 1: Clone & Install

```bash
# 1. Clone repository
git clone <repository-url>
cd komplekin

# 2. Install semua dependencies
npm install

# 3. Tunggu hingga selesai (bisa 5-10 menit)
```

### Step 2: Setup Supabase (Database)

1. **Buat Project Supabase:**
   - Kunjungi [supabase.com](https://supabase.com/)
   - Klik "Start your project" 
   - Login dengan GitHub/Google
   - Klik "New Project"
   - Pilih nama: `komplekin`
   - Set password yang kuat
   - Pilih region terdekat (Singapore)
   - Klik "Create new project"

2. **Ambil Credentials:**
   - Tunggu project selesai dibuat (2-3 menit)
   - Ke **Settings** → **API**
   - Copy **Project URL** dan **anon public key**

### Step 3: Setup Environment Variables

```bash
# 1. Buat file .env.local untuk admin app
echo "NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL" > apps/admin/.env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY" >> apps/admin/.env.local

# 2. Buat file .env.local untuk user app
echo "NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL" > apps/user/.env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY" >> apps/user/.env.local
```

**Atau buat manual:**

Buat file `apps/admin/.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Buat file `apps/user/.env.local` dengan isi yang sama.

### Step 4: Jalankan Development Server

```bash
# Jalankan admin app (Port 3001)
npm run dev --workspace=apps/admin

# Atau di terminal terpisah, jalankan user app (Port 3000)
npm run dev --workspace=apps/user
```

### Step 5: Test Aplikasi

1. **Admin App:** Buka http://localhost:3001
2. **User App:** Buka http://localhost:3000
3. **Login Page:** http://localhost:3001/login

Jika berhasil, Anda akan melihat halaman tanpa error!

## 📁 Struktur Project (Yang Perlu Anda Ketahui)

```
komplekin/
├── apps/                          # 🎯 Aplikasi utama
│   ├── admin/                     # Dashboard admin
│   │   ├── app/                   # Halaman-halaman (App Router)
│   │   │   ├── page.tsx          # Homepage admin
│   │   │   ├── login/page.tsx    # Halaman login
│   │   │   ├── layout.tsx        # Layout utama
│   │   │   └── globals.css       # CSS global
│   │   ├── components.json        # Konfigurasi Shadcn UI
│   │   ├── .env.local            # Environment variables
│   │   └── package.json
│   └── user/                      # Aplikasi user
│       ├── app/                   # Halaman-halaman
│       │   ├── page.tsx          # Homepage user
│       │   └── layout.tsx        # Layout utama
│       └── .env.local            # Environment variables
├── packages/                      # 📦 Shared packages
│   ├── ui/                       # Komponen UI reusable
│   │   ├── components/           # Button, Input, Badge, dll
│   │   ├── lib/utils.ts         # Helper functions
│   │   └── index.ts             # Export semua komponen
│   ├── supabase/                # Database wrapper
│   │   ├── client.ts            # Supabase client
│   │   └── index.ts
│   └── types/                   # TypeScript types
│       └── index.ts             # Shared interfaces
├── package.json                  # Dependencies utama
├── turbo.json                   # Turborepo config
├── tsconfig.base.json           # TypeScript config
└── .gitignore                   # Git ignore rules
```

## ⚙️ Tech Stack (Yang Digunakan)

- **Next.js 15.3.5** - Framework React terbaru
- **TypeScript** - JavaScript dengan type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Komponen UI yang 