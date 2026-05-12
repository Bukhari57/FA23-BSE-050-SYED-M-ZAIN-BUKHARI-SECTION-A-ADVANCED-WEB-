export type CommitteeStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface Committee {
  _id: string;
  name: string;
  description?: string;
  monthlyAmount: number;
  durationMonths: number;
  memberLimit: number;
  status: CommitteeStatus;
  startDate: string;
  payoutDayOfMonth: number;
  autoRotationEnabled: boolean;
  currentRotationIndex: number;
  nextPayoutDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  _id: string;
  committee: string;
  fullName: string;
  email?: string;
  cnic: string;
  phone: string;
  transactionId?: string;
  iban?: string;
  accountTitle?: string;
  profileImageUrl?: string;
  position: number;
  isActive: boolean;
  joinedAt: string;
}

export interface Payment {
  _id: string;
  committee: string;
  member: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'pending' | 'paid' | 'late' | 'partial';
  fineAmount: number;
  paidAt?: string;
  transactionRef?: string;
  notes?: string;
}

export interface Transaction {
  _id: string;
  committee: string;
  member?: string;
  type: 'collection' | 'payout' | 'refund' | 'fine';
  amount: number;
  description?: string;
  processedAt: string;
}
