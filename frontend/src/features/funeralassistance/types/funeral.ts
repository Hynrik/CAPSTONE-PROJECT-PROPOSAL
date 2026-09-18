/* =========================
   MEMBER
========================= */
export type Member = {
  id: number;
  member_code: string;
  status?: string;

  first_name: string;
  middle_name?: string;
  last_name: string;
};

/* =========================
   PAYMENT / CONTRIBUTION
========================= */
export type PaymentStatus = "Paid" | "Unpaid";

export type Payment = {
  memberId: number;
  month: string;
  status: PaymentStatus;
};

/* =========================
   DEATH EVENT
========================= */
export type DeathEventStatus = "Pending" | "Released";

export type DeathEvent = {
  id: number;
  member_id: number;
  date_of_death: string;
  status: DeathEventStatus;
};

/* =========================
   LEDGER ENTRY
========================= */
export type LedgerEntry = {
  month: string;
  prevMonth: string;
  deaths: number;
  activeMembers: number;
  gathered: number;
  fund: number;
  released: number;
  balance: number;
};

/* =========================
   FORMS (MODALS)
========================= */
export type DeathEventForm = {
  memberId: string;
  dateOfDeath: string;
};