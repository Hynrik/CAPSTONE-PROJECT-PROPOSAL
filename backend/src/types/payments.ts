export type Payment = {
  id: number;
  memberId: number;
  submittedBy: number | null;
  amount: number;
  paymentDate: string;

  retirement: number;
  benefits: number;
  admin: number;

  description?: string;
};