export type CommitteeStatus = 'open' | 'active' | 'completed';
export type MemberStatus = 'pending' | 'approved' | 'removed';
export type PaymentStatus = 'pending' | 'paid' | 'confirmed' | 'rejected';

export interface Profile {
  id: string;
  full_name: string;
  phone?: string | null;
  bank_account?: string | null;
  iban?: string | null;
  trust_score: number;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
}

export interface Committee {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  duration_months: number;
  monthly_amount: number;
  max_members: number;
  start_date: string;
  current_month: number;
  status: CommitteeStatus;
  created_at: string;
  creator?: Profile;
  member_count?: number;
}

export interface CommitteeMember {
  id: string;
  committee_id: string;
  user_id: string;
  turn_order: number;
  transaction_id?: string | null;
  bank_details?: string | null;
  iban?: string | null;
  payment_method?: string | null;
  status: MemberStatus;
  joined_at: string;
  profile?: Profile;
}

export interface Payment {
  id: string;
  committee_id: string;
  member_id: string;
  month_number: number;
  amount: number;
  status: PaymentStatus;
  proof_url?: string | null;
  confirmed_by?: string | null;
  paid_at?: string | null;
  created_at: string;
  member?: CommitteeMember;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}
