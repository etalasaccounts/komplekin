export interface Iuran {
  id: string; // UUID
  created_at: string;
  updated_at: string;
  name: string;
  participants: string[]; // array of UUIDs
  due_date: number; // numeric
  start_date: string; // date
  end_date: string; // date
  amount: number; // numeric
  cluster_id: string;
}

export interface CreateIuranRequest {
  name: string;
  participants: string[];
  due_date: number;
  start_date: string;
  end_date: string;
  amount: number;
  cluster_id: string;
}

export interface UpdateIuranRequest {
  name?: string;
  participants?: string[];
  due_date?: number;
  start_date?: string;
  end_date?: string;
  amount?: number;
}