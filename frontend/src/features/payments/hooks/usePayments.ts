/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Payment, PaymentForm } from "../../shared/types";
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} from "../api/payments";

/* =========================
   CONSTANTS
========================= */
const PAYMENTS_KEY = ["payments"] as const;
const MONTHLY_CONTRIBUTION = 100;

/* =========================
   HOOK
========================= */
export const usePayments = () => {
  const queryClient = useQueryClient();

  /* =========================
     FETCH PAYMENTS
  ========================= */
  const {
    data: payments = [],
    isLoading,
    isError,
    error,
  } = useQuery<Payment[]>({
    queryKey: PAYMENTS_KEY,
    queryFn: getPayments,
    staleTime: 10_000,
  });

  /* =========================
     CREATE PAYMENT
  ========================= */
  const addPayment = useMutation({
    mutationFn: createPayment,

    onMutate: async (newPayment: PaymentForm) => {
      await queryClient.cancelQueries({ queryKey: PAYMENTS_KEY });

      const previous = queryClient.getQueryData<Payment[]>(PAYMENTS_KEY);

      const optimistic: Payment = {
        id: Date.now(),
        memberId: newPayment.memberId,

        amount: Number(newPayment.amount),
        paymentDate: newPayment.paymentDate,
        description: newPayment.description ?? "",

        retirement: Number(newPayment.amount) * 0.4,
        benefits: Number(newPayment.amount) * 0.3,
        admin: Number(newPayment.amount) * 0.3,

        memberFirst: "",
        memberLast: "",
        memberStatus: "",
        membershipStartDate: "",
      };

      queryClient.setQueryData<Payment[]>(
        PAYMENTS_KEY,
        (old = []) => [optimistic, ...old]
      );

      return { previous };
    },

    onError: (_err, _new, context) => {
      queryClient.setQueryData(PAYMENTS_KEY, context?.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
    },
  });

  /* =========================
     UPDATE PAYMENT
  ========================= */
  const editPayment = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PaymentForm }) =>
      updatePayment(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: PAYMENTS_KEY });

      const previous = queryClient.getQueryData<Payment[]>(PAYMENTS_KEY);

      queryClient.setQueryData<Payment[]>(PAYMENTS_KEY, (old = []) =>
        old.map((p) =>
          p.id === id
            ? {
                ...p,
                amount: Number(data.amount),
                paymentDate: data.paymentDate,
                description: data.description ?? "",

                retirement: Number(data.amount) * 0.4,
                benefits: Number(data.amount) * 0.3,
                admin: Number(data.amount) * 0.3,
              }
            : p
        )
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      queryClient.setQueryData(PAYMENTS_KEY, context?.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
    },
  });

  /* =========================
     DELETE PAYMENT
  ========================= */
  const removePayment = useMutation({
    mutationFn: deletePayment,

    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: PAYMENTS_KEY });

      const previous = queryClient.getQueryData<Payment[]>(PAYMENTS_KEY);

      queryClient.setQueryData<Payment[]>(PAYMENTS_KEY, (old = []) =>
        old.filter((p) => p.id !== id)
      );

      return { previous };
    },

    onError: (_err, _id, context) => {
      queryClient.setQueryData(PAYMENTS_KEY, context?.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEY });
    },
  });

  /* =========================
     MEMBER BALANCES
  ========================= */
 const memberBalances = useMemo(() => {
  const grouped: Record<
    number,
    {
      memberId: number;
      memberName: string;
      monthsActive: number;
      expectedTotal: number;
      paidTotal: number;
      balance: number;
      startDate: string;
    }
  > = {};

  const getMonthsActive = (startDate: string) => {
    const start = new Date(startDate);
    const today = new Date();

    const months =
      (today.getFullYear() - start.getFullYear()) * 12 +
      (today.getMonth() - start.getMonth());

    return Math.max(0, months);
  };

  payments.forEach((p) => {
    if (!grouped[p.memberId]) {
      grouped[p.memberId] = {
        memberId: p.memberId,
        memberName: `${p.memberFirst ?? ""} ${p.memberLast ?? ""}`.trim(),
        monthsActive: 0,
        expectedTotal: 0,
        paidTotal: 0,
        balance: 0,
        startDate: p.membershipStartDate ?? "",
      };
    }

    const member = grouped[p.memberId];

    // IMPORTANT: keep earliest start date (more accurate)
    if (
      p.membershipStartDate &&
      (!member.startDate ||
        new Date(p.membershipStartDate) < new Date(member.startDate))
    ) {
      member.startDate = p.membershipStartDate;
    }

    member.paidTotal += Number(p.amount || 0);
  });

  return Object.values(grouped).map((m) => {
    const monthsActive = m.startDate ? getMonthsActive(m.startDate) : 0;

    const expectedTotal = monthsActive * MONTHLY_CONTRIBUTION;
    const balance = expectedTotal - m.paidTotal;

    return {
      ...m,
      monthsActive,
      expectedTotal,
      balance,
    };
  });
}, [payments]);

  /* =========================
     TOTALS
  ========================= */
  const totals = useMemo(() => {
    const totalCollected = payments.reduce(
      (s, p) => s + Number(p.amount || 0),
      0
    );

    const totalRetirement = payments.reduce(
      (s, p) => s + Number(p.retirement || 0),
      0
    );

    const totalBenefits = payments.reduce(
      (s, p) => s + Number(p.benefits || 0),
      0
    );

    const totalAdmin = payments.reduce(
      (s, p) => s + Number(p.admin || 0),
      0
    );

    const totalBalance = memberBalances.reduce(
      (s, m) => s + m.balance,
      0
    );

    return {
      totalCollected,
      totalRetirement,
      totalBenefits,
      totalAdmin,
      totalBalance,
    };
  }, [payments, memberBalances]);

  /* =========================
     RETURN
  ========================= */
  return {
    payments,
    loading: isLoading,
    error: isError ? (error as Error).message : null,

    addPayment: addPayment.mutateAsync,
    editPayment: editPayment.mutateAsync,
    removePayment: removePayment.mutateAsync,

    memberBalances,
    totals,
  };
};