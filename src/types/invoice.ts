import { UserPermissions } from "./user_permissions";

export interface Invoice {
  id?: string;
  user_id?: string;
  cluster_id?: string;
  amount_paid?: number;
  bill_amount?: number;
  due_date: string;
  payment_date?: string;
  payment_method?: string;
  receipt?: string;
  payment_purpose?: string;
  invoice_status: string;
  verification_status?: string;
  user_permission?: UserPermissions;
}

export enum InvoiceStatus {
  UNPAID = "Belum bayar",
  PAID = "Lunas",
  PARTIAL_PAID = "Kurang bayar",
}

export enum VerificationStatus {
  NOT_YET_CHECKED = "Belum dicek",
  VERIFIED = "Terverifikasi",
  UNVERIFIED = "Ditolak",
}

export enum PaymentPurposeType {
  IURAN_RT = "Iuran RT",
  IURAN_KEAMANAN = "Iuran Keamanan",
  IURAN_KEBERSIHAN = "Iuran Kebersihan",
  IURAN_LAINNYA = "Lainnya"
}