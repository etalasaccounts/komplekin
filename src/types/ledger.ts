import { Invoice } from "./invoice";
import { UserPermissions } from "./user_permissions";

export interface Ledger {
  id: string;
  user_id: string;
  user_permission: UserPermissions;
  cluster_id: string;
  cluster: Cluster;
  invoice_id: string;
  invoice: Invoice;
  ledger_type: LedgerType;
  coa_id: string;
  coa: ChartOfAccount;
  account_type: AccountType;
  description: string;
  amount: number;
  date: Date;
  receipt: string;
  created_at: Date;
  updated_at: Date;
}

export interface Cluster {
  id: string;
  payment_method: string;
  cluster_name: string;
  address: string;
  cluster_unit: string;
}

export interface ChartOfAccount {
  id: string;
  name: string;
  account_type: AccountType;
}

export enum LedgerType {
  DEBIT = "Debit",
  CREDIT = "Credit",
}

export enum AccountType {
  REVENUE = "Revenue",
  EXPENSE = "Expense",
}