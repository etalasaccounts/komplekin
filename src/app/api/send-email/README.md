# Email API Endpoints - KomplekIn

Sistem email menggunakan Resend.com untuk mengirim berbagai jenis email dalam aplikasi KomplekIn.

## Setup Environment Variables

Tambahkan variable berikut ke file `.env.local`:

```env
# Required
RESEND_API_KEY=re_PSekJfUS_Eb7NW479agsj9EBdgFNwegaE
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional (will use onboarding@resend.dev if not set)
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Catatan:** 
- `RESEND_API_KEY` wajib diisi untuk mengirim email
- `RESEND_FROM_EMAIL` opsional - jika tidak diset akan menggunakan default `onboarding@resend.dev` dari Resend
- Untuk production, disarankan setup domain sendiri di Resend dashboard

## 🚨 Penting: Limitasi Mode Testing

Resend memiliki limitasi dalam mode testing (free tier):
- **Hanya bisa mengirim email ke alamat yang sama dengan akun Resend Anda**
- Dalam case ini: `n@etalas.com`
- Untuk mengirim ke alamat lain, perlu verifikasi domain di [resend.com/domains](https://resend.com/domains)

### Solusi yang Diimplementasikan:

1. **Mode Development**: 
   - Email ke alamat selain `n@etalas.com` akan disimulasikan
   - Toast notification akan memberitahu bahwa email disimulasikan

2. **Mode Test**: 
   - Menggunakan endpoint `/api/send-email/test-invitation`
   - Email akan dikirim ke `n@etalas.com` 
   - Berisi kredensial untuk alamat email asli

3. **Mode Production**:
   - Setelah setup domain di Resend, email akan dikirim normal

## Available Endpoints

### 1. Confirmation Email
**Endpoint:** `POST /api/send-email/confirmation`

Mengirim email konfirmasi untuk verifikasi akun baru.

**Request Body:**
```json
{
  "userName": "John Doe",
  "email": "john@example.com",
  "confirmationUrl": "https://app.com/confirm?token=abc123"
}
```

### 2. Resend Invitation
**Endpoint:** `POST /api/send-email/resend-invitation`

Mengirim email undangan dengan temporary password untuk warga baru.

**Request Body:**
```json
{
  "userName": "Jane Smith",
  "email": "jane@example.com",
  "temporaryPassword": "temp123456",
  "magicLink": "https://app.com/magic?token=xyz789",
  "clusterName": "Komplek Mahata",
  "role": "Warga"
}
```

### 2a. Test Invitation (Development)
**Endpoint:** `POST /api/send-email/test-invitation`

Mengirim email test ke alamat verified (`n@etalas.com`) berisi kredensial untuk alamat email asli.

**Request Body:** (sama seperti resend-invitation)
```json
{
  "userName": "Jane Smith",
  "email": "jane@example.com",
  "temporaryPassword": "temp123456",
  "magicLink": "https://app.com/magic?token=xyz789",
  "clusterName": "Komplek Mahata",
  "role": "Warga"
}
```

**Response:**
```json
{
  "success": true,
  "testMode": true,
  "originalEmail": "jane@example.com",
  "sentTo": "n@etalas.com",
  "message": "Test email sent to n@etalas.com with credentials for Jane Smith"
}
```

### 3. Reset Password
**Endpoint:** `POST /api/send-email/reset-password`

Mengirim email untuk reset password.

**Request Body:**
```json
{
  "resetUrl": "https://app.com/reset?token=reset123",
  "email": "user@example.com",
  "userName": "User Name"
}
```

### 4. Invoice Reminder
**Endpoint:** `POST /api/send-email/invoice-reminder`

Mengirim pengingat tagihan kepada warga.

**Request Body:**
```json
{
  "userName": "John Doe",
  "invoiceNumber": "INV-2025-001",
  "amount": "500,000",
  "dueDate": "2025-02-15",
  "email": "john@example.com"
}
```

### 5. PO Approval
**Endpoint:** `POST /api/send-email/po-approval`

Mengirim email untuk persetujuan Purchase Order.

**Request Body:**
```json
{
  "userName": "Admin Name",
  "poNumber": "PO-2025-001",
  "poTitle": "Pembelian Peralatan Cleaning",
  "amount": "2,500,000",
  "requestedBy": "Staff Maintenance",
  "approvalUrl": "https://app.com/approve?id=123",
  "rejectUrl": "https://app.com/reject?id=123",
  "email": "admin@example.com"
}
```

## Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "email_id_from_resend"
  }
}
```

**Error Response:**
```json
{
  "error": "Error message description"
}
```

## Usage Examples

### Menggunakan dari komponen React:

```typescript
const sendInvitationEmail = async (wargaData: any) => {
  try {
    const response = await fetch('/api/send-email/resend-invitation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: wargaData.fullname,
        email: wargaData.email,
        temporaryPassword: wargaData.temporaryPassword,
        magicLink: wargaData.magicLink,
        clusterName: wargaData.clusterName,
        role: wargaData.role
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      toast.success('Email berhasil dikirim!');
    } else {
      toast.error(result.error);
    }
  } catch (error) {
    toast.error('Gagal mengirim email');
  }
};
```

## Notes

- Semua email template menggunakan inline CSS untuk kompatibilitas maksimal
- Email template responsif dan teroptimasi untuk berbagai email client
- Validasi email format dilakukan di setiap endpoint
- Environment variables wajib dikonfigurasi untuk production
- Resend API key dapat diperoleh dari dashboard Resend.com