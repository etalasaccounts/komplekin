# 🚀 Komplekin Monorepo

Monorepo Next.js dengan npm workspaces untuk aplikasi Komplekin, terdiri dari admin dashboard dan user application.

## 📁 Struktur Proyek

```
komplekin/
├── apps/
│   ├── admin/          # Next.js Admin Dashboard (Port 3001)
│   └── user/           # Next.js User Application (Port 3000)
├── packages/
│   ├── ui/             # Komponen Shadcn UI (Button, Input, dsb)
│   ├── supabase/       # Supabase client wrapper
│   └── types/          # Shared TypeScript types
├── turbo.json          # Turborepo pipeline config
├── package.json        # Root workspace dengan npm
├── tsconfig.base.json  # Base TypeScript config
└── env.local.example   # Environment variables template
```

## ⚙️ Tech Stack

- **Framework**: Next.js 14 dengan App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: Supabase
- **Monorepo**: npm workspaces + Turborepo
- **Package Manager**: npm (bukan pnpm)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

```bash
# Copy environment template
cp env.local.example .env.local

# Edit .env.local dengan Supabase credentials Anda
# Dapatkan dari: https://supabase.com > Project Settings > API
```

### 3. Development

```bash
# Jalankan semua apps
npm run dev

# Atau jalankan specific app
npm run dev --workspace=apps/admin   # Port 3001
npm run dev --workspace=apps/user    # Port 3000
```

### 4. Build

```bash
# Build semua apps
npm run build

# Build specific app
npm run build --workspace=apps/admin
```

## 📦 Packages

### `packages/ui`
Komponen UI bergaya Shadcn UI yang bisa digunakan di semua apps:
- `Button` - Tombol dengan berbagai variant
- `Input` - Input field dengan styling konsisten
- `cn()` - Utility function untuk class names

### `packages/supabase`
Wrapper untuk Supabase client:
- `createClient()` - Browser client untuk authentication
- `supabase` - Pre-configured client instance

### `packages/types`
Shared TypeScript types:
- `User`, `AuthState` - Authentication types
- `Database` - Supabase database types
- `ApiResponse` - API response types

## 🎯 URL Applications

- **Admin Dashboard**: http://localhost:3001
- **User Application**: http://localhost:3000
- **Admin Login**: http://localhost:3001/login

## 🔧 Scripts Available

```bash
npm run dev          # Development semua apps
npm run build        # Build semua apps  
npm run lint         # Lint semua apps
npm run type-check   # TypeScript check
npm run clean        # Clean cache
```

## 📝 Features

### Admin App
- ✅ Login page dengan Supabase authentication
- ✅ Menggunakan komponen Button dan Input dari `ui` package
- ✅ TypeScript dengan shared types
- ✅ Tailwind CSS + Shadcn UI styling

### User App
- ✅ Landing page dengan komponen UI
- ✅ Responsive design
- ✅ Shared styling dengan admin

### Shared Packages
- ✅ UI components yang reusable
- ✅ Supabase client wrapper
- ✅ TypeScript types yang konsisten
- ✅ Path mapping untuk import (`ui`, `supabase`, `types`)

## 🛠️ Development Guide

### Menambah Komponen UI Baru

1. Buat komponen di `packages/ui/components/`
2. Export di `packages/ui/index.ts`
3. Gunakan di apps: `import { NewComponent } from 'ui'`

### Menambah Types Baru

1. Tambahkan di `packages/types/index.ts`
2. Gunakan di apps: `import type { NewType } from 'types'`

### Menggunakan Supabase

```typescript
import { createClient } from 'supabase'

const supabase = createClient()

// Authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

## 📚 Path Mapping

Sudah dikonfigurasi path mapping untuk import yang mudah:

```typescript
import { Button } from 'ui'              // packages/ui
import { createClient } from 'supabase'   // packages/supabase  
import type { User } from 'types'         // packages/types
```

## 🔒 Environment Variables

Required untuk `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🚨 Troubleshooting

### Port sudah digunakan
```bash
# Kill process yang menggunakan port
npx kill-port 3000
npx kill-port 3001
```

### TypeScript errors
```bash
npm run type-check
```

### Linting issues
```bash
npm run lint
```

## 📈 Next Steps

1. **Setup Supabase Database**: Buat tables di Supabase dashboard
2. **Add Authentication Logic**: Implementasi sign up, logout
3. **Add More Components**: Toast, Modal, Form components
4. **Database Integration**: CRUD operations
5. **Deployment**: Setup di Vercel atau platform lain

---

**Created with ❤️ using npm workspaces + Turborepo** 