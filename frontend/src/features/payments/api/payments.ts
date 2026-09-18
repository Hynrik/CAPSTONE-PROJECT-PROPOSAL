import api from "../../shared/api/axios";
import type { Payment, PaymentForm } from "../../shared/types";

/* =========================
   RAW API RESPONSE TYPE
========================= */
type PaymentApiResponse = {
  id: number;
  member_id: number;

  amount: number | string;
  payment_date: string;
  description?: string;

  retirement_fund?: number;
  benefits_fund?: number;
  admin_fund?: number;

  first_name?: string;
  last_name?: string;
  member_status?: string;

  /* ✅ ADD THIS (CRITICAL FOR BALANCE) */
  membership_start_date?: string;
};

/* =========================
   GET PAYMENTS
========================= */
export const getPayments = async (): Promise<Payment[]> => {
  const res = await api.get("/payments");

  const raw: PaymentApiResponse[] = Array.isArray(res.data)
    ? res.data
    : res.data?.data || [];

  return raw.map((p): Payment => ({
    id: p.id,
    memberId: p.member_id,

    amount: Number(p.amount || 0),
    paymentDate: p.payment_date,
    description: p.description ?? "",

    retirement: Number(p.retirement_fund || 0),
    benefits: Number(p.benefits_fund || 0),
    admin: Number(p.admin_fund || 0),

    memberFirst: p.first_name,
    memberLast: p.last_name,
    memberStatus: p.member_status,

    /* ✅ CRITICAL FIELD FOR MEMBER BALANCE */
    membershipStartDate: p.membership_start_date ?? "",
  }));
};

/* =========================
   CREATE PAYMENT
========================= */
export const createPayment = async (data: PaymentForm): Promise<Payment> => {
  const payload = {
    memberId: data.memberId,
    amount: Number(data.amount),
    paymentDate: data.paymentDate,
    description: data.description ?? "",
  };

  const res = await api.post("/payments", payload);
  return res.data;
};

/* =========================
   UPDATE PAYMENT
========================= */
export const updatePayment = async (
  id: number,
  data: PaymentForm
): Promise<Payment> => {
  const payload = {
    memberId: data.memberId,
    amount: Number(data.amount),
    paymentDate: data.paymentDate,
    description: data.description ?? "",
  };

  const res = await api.put(`/payments/${id}`, payload);
  return res.data;
};

/* =========================
   DELETE PAYMENT
========================= */
export const deletePayment = async (id: number): Promise<{ success: boolean }> => {
  const res = await api.delete(`/payments/${id}`);
  return res.data;
};