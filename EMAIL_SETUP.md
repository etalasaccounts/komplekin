# Setup Email untuk KomplekIn

## Masalah yang Diselesaikan
Jika setelah berhasil membuat warga baru tetapi email tidak terkirim, ikuti panduan setup ini.

## Penyebab Email Tidak Terkirim
1. **Environment Variables tidak dikonfigurasi**
2. **RESEND_API_KEY tidak valid atau tidak ada**
3. **Domain email belum diverifikasi di Resend**

## Cara Setup Email (Resend.com)

### 1. Daftar Resend Account
- Kunjungi https://resend.com
- Daftar akun gratis (dapat 3000 email/bulan)
- Verifikasi email Anda

### 2. Dapatkan API Key
- Login ke dashboard Resend
- Pergi ke **API Keys** tab
- Klik **Create API Key**
- Salin API key yang diberikan

### 3. Setup Domain (Opsional untuk Testing)
- Untuk testing, gunakan domain default Resend
- Untuk production, tambahkan domain Anda dan verifikasi DNS

### 4. Konfigurasi Environment Variables
Tambahkan ke file `.env.local` Anda:

```env
# Email Service (Resend.com)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# RESEND_FROM_EMAIL="custom@yourdomain.com" # Opsional, default menggunakan onboarding@resend.dev
```

**Catatan:** Jika `RESEND_FROM_EMAIL` tidak diset, sistem akan otomatis menggunakan `KomplekIn <onboarding@resend.dev>` (domain default Resend untuk testing).

### 5. Testing Email
- Restart aplikasi Next.js setelah menambah env vars
- Coba tambah warga baru
- Jika masih development mode, email akan disimulasikan
- Untuk real email, pastikan API key valid

## Mode Development vs Production

### Development Mode (Tanpa API Key)
- Email disimulasikan
- Kredensial ditampilkan di toast notification
- WhatsApp message tersedia untuk copy manual

### Testing Mode (Dengan API Key, Email Non-Etalas)
- Email dikirim ke `n@etalas.com` sebagai proxy
- Subject email diberi prefix `[TEST]`
- Template email berisi data warga asli
- Toast notification menjelaskan mode test

### Production Mode (Email @etalas.com)
- Email langsung dikirim ke alamat tujuan
- Warga akan menerima email dengan instruksi login
- WhatsApp backup tersedia

## Cara Kerja Testing Mode

Ketika Anda membuat warga dengan email yang bukan `@etalas.com`:
1. **Email dikirim ke**: `n@etalas.com` 
2. **Template berisi**: Data warga asli (nama, email asli, password)
3. **Subject**: `[TEST] Selamat Datang di KomplekIn`
4. **Admin dapat**: Forward email ke warga atau gunakan WhatsApp

Ini mengatasi batasan Resend testing yang hanya mengizinkan email ke alamat terverifikasi.

## Troubleshooting

### 1. API Key Invalid
```
Error: API key is invalid
```
**Solusi:** Periksa kembali API key di dashboard Resend

### 2. Domain Not Verified
```
Error: Domain not verified
```
**Solusi:** Gunakan domain default atau verifikasi domain custom

### 3. Rate Limit
```
Error: Rate limit exceeded
```
**Solusi:** Upgrade plan Resend atau tunggu reset limit

### 4. Email Tidak Masuk
- Periksa folder spam/junk
- Pastikan email address valid
- Cek logs di dashboard Resend

## Fallback System
Jika email gagal, sistem akan:
1. Tampilkan error di console
2. Copy kredensial ke clipboard
3. Tampilkan toast warning dengan password sementara
4. Admin bisa share manual ke warga

## Testing Email Address
Untuk testing real email (bukan simulasi), gunakan:
`n@etalas.com` - Email khusus untuk testing

---

**Note:** Sistem tetap akan membuat warga di database meskipun email gagal dikirim. Email hanyalah notifikasi tambahan.