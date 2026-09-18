export type Payment = {
  id: number;
  memberId: number;

  amount: number;
  paymentDate: string;
  description?: string;

  retirement: number;
  benefits: number;
  admin: number;

  memberFirst?: string;
  memberLast?: string;
  memberStatus?: string;

  membershipStartDate?: string;
  monthsActive?: number;
  expectedTotal?: number;
  paidTotal?: number;
  balance?: number;
};

export type PaymentTotals = {
  total: number;
  retirement: number;
  benefits: number;
  admin: number;
};

export type PaymentMember = {
  id: number;
  first: string;
  last: string;
  status: "active" | "inactive" | "deceased";
  balance: number;
  lastPayment: string;
};

export type PaymentForm = {
  memberId: number;
  amount: number;
  paymentDate: string;
  description?: string;

  submittedBy?: number | null;
};