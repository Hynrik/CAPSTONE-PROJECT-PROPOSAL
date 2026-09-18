/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";

import {
  getMembersAPI,
  getContributionsAPI,
  getDeathEventsAPI,
  getFundSummaryAPI,
  markContributionPaidAPI,
  createContributionAPI,
  createDeathEventAPI,
  updateDeathEventAPI,
  releaseDeathEventAPI,
} from "../api/funeralApi";
import type {
  Member,
  Payment,
  DeathEvent,
  LedgerEntry,
} from "../types/funeral";

/* ================= TYPES ================= */

type Contribution = {
  id: number;
  member_id: number;
  month_covered: string;
  amount: number;
  status: "Paid" | "Unpaid";
  paid_at?: string;
};

/* ================= HOOK ================= */

export const useFuneral = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [events, setEvents] = useState<DeathEvent[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const payments = useMemo<Payment[]>(() => {
    return contributions.map((contribution) => ({
      memberId: contribution.member_id,
      month: contribution.month_covered,
      status: contribution.status === "Paid" ? "Paid" : "Unpaid",
    }));
  }, [contributions]);

  /* ================= FETCH ================= */

  const fetchAll = async () => {
    setLoading(true);

    try {
      const [m, c, e, f] = await Promise.all([
        getMembersAPI(),
        getContributionsAPI(),
        getDeathEventsAPI(),
        getFundSummaryAPI(),
      ]);

      /* ================= SAFE MEMBERS ================= */

      const safeMembers: Member[] = Array.isArray(m)
        ? m.map((x: any) => ({
            id: Number(x.id ?? x.member_id ?? 0),
            member_code: x.member_code ?? x.memberCode ?? "",
            status: x.status ?? x.member_status ?? "",
            first_name: x.first_name ?? x.firstName ?? "",
            middle_name: x.middle_name ?? x.middleName ?? "",
            last_name: x.last_name ?? x.lastName ?? "",
          }))
        : [];

      /* ================= SAFE CONTRIBUTIONS ================= */

      const safeContributions: Contribution[] = Array.isArray(c)
        ? c.map((x: any) => ({
            id: Number(x.id ?? 0),
            member_id: Number(x.member_id ?? x.memberId ?? 0),
            month_covered: x.month_covered ?? x.monthCovered ?? "",
            amount: Number(x.amount ?? 0),
            status: x.status === "Paid" ? "Paid" : "Unpaid",
            paid_at: x.paid_at ?? x.paidAt ?? undefined,
          }))
        : [];

      /* ================= SAFE EVENTS ================= */

      const safeEvents: DeathEvent[] = Array.isArray(e)
        ? e.map((x: any) => ({
            id: Number(x.id ?? 0),
            member_id: Number(x.member_id ?? x.memberId ?? 0),
            date_of_death: x.date_of_death ?? x.dateOfDeath ?? "",
            status: x.status === "Released" ? "Released" : "Pending",
          }))
        : [];

      console.log("SAFE MEMBERS:", safeMembers);
      console.log("SAFE EVENTS:", safeEvents);

      const safeLedger: LedgerEntry[] = Array.isArray(f)
        ? f.map((x: any) => ({
            month: x.month ?? x.date_month ?? "",
            prevMonth: x.prevMonth ?? x.prev_month ?? "",
            deaths: Number(x.deaths ?? 0),
            activeMembers: Number(x.activeMembers ?? x.active_members ?? 0),
            gathered: Number(x.gathered ?? 0),
            fund: Number(x.fund ?? 0),
            released: Number(x.released ?? 0),
            balance: Number(x.balance ?? 0),
          }))
        : [];

      setMembers(safeMembers);
      setContributions(safeContributions);
      setEvents(safeEvents);
      setLedger(safeLedger);
    } catch (err) {
      console.error("Fetch error:", err);

      setMembers([]);
      setContributions([]);
      setEvents([]);
      setLedger([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* ================= SAFE ACTION WRAPPER ================= */

  const runAction = async (fn: () => Promise<any>) => {
    try {
      await fn();
      await fetchAll();
    } catch (err) {
      console.error("Action error:", err);
    }
  };

  /* ================= ACTIONS ================= */

  const markAsPaid = (memberId: number, month: string) =>
    runAction(() => markContributionPaidAPI(memberId, month));

  const createContribution = (
    memberId: number,
    month: string,
    amount?: number
  ) =>
    runAction(() =>
      createContributionAPI({
        memberId,
        month,
        amount,
      })
    );

  const createContributionAndMarkPaid = (
    memberId: number,
    month: string,
    amount?: number
  ) =>
    runAction(async () => {
      await createContributionAPI({ memberId, month, amount });
      await markContributionPaidAPI(memberId, month);
    });

  const createDeathEvent = (memberId: number, dateOfDeath: string) =>
    runAction(() =>
      createDeathEventAPI({
        memberId,
        dateOfDeath,
      })
    );

  const releaseDeath = (id: number) =>
    runAction(() => releaseDeathEventAPI(id));

  const updateDeathEvent = (id: number, dateOfDeath: string) =>
    runAction(() => updateDeathEventAPI(id, dateOfDeath));

  /* ================= HELPERS ================= */

  const getFullName = (m: Member) => {
    return `${m.first_name ?? ""} ${m.middle_name ?? ""} ${
      m.last_name ?? ""
    }`
      .replace(/\s+/g, " ")
      .trim();
  };

  /* ================= TOTALS ================= */

  const totalCollected = useMemo(() => {
    return ledger.reduce((sum, entry) => sum + Number(entry.gathered || 0), 0);
  }, [ledger]);

  const totalReleased = useMemo(() => {
    return ledger.reduce((sum, entry) => sum + Number(entry.released || 0), 0);
  }, [ledger]);

  const balance = useMemo(() => {
    return ledger.reduce((sum, entry) => sum + Number(entry.balance || 0), 0);
  }, [ledger]);

  /* ================= RETURN ================= */

  return {
    members,
    contributions,
    payments,
    events,
    ledger,
    loading,
    markAsPaid,
    createContribution,
    createContributionAndMarkPaid,
    createDeathEvent,
    updateDeathEvent,
    releaseDeath,
    totalCollected,
    totalReleased,
    balance,
    fetchAll,
    getFullName,
  };
};