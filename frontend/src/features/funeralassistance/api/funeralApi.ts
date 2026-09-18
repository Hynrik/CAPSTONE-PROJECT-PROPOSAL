/* eslint-disable @typescript-eslint/no-explicit-any */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* ================= TYPES ================= */

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: any;
  timeout?: number;
};

/* ================= TOKEN ================= */

const getToken = () => localStorage.getItem("token");

/* ================= CORE REQUEST ================= */

const request = async <T = any>(url: string, options: ApiOptions = {}) : Promise<T> => {
  const { method = "GET", body, timeout = 15000 } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken() || ""}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    let data: any = null;

    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }

    if (!res.ok) {
      const message =
        typeof data === "object" ? data?.message : data;

      console.error(`API ERROR [${method} ${url}]:`, message);
      throw new Error(message || "Request failed");
    }

    return data;
  } catch (err: any) {
    clearTimeout(timer);

    if (err.name === "AbortError") {
      throw new Error("Request timeout. Please try again.");
    }

    throw err;
  }
};

/* =========================================================
   MEMBERS
========================================================= */

export const getMembersAPI = () =>
  request("/members");

/* =========================================================
   CONTRIBUTIONS
========================================================= */

export const getContributionsAPI = () =>
  request("/funeral-assistance/contributions");

export const markContributionPaidAPI = (
  memberId: number,
  month: string
) =>
  request("/funeral-assistance/contributions/mark-paid", {
    method: "POST",
    body: { memberId, month },
  });

export const createContributionAPI = (data: {
  memberId: number;
  month: string;
  amount?: number;
}) =>
  request("/funeral-assistance/contributions", {
    method: "POST",
    body: data,
  });

/* =========================================================
   DEATH EVENTS
========================================================= */

export const getDeathEventsAPI = () =>
  request("/funeral-assistance/death-events");

export const createDeathEventAPI = (data: {
  memberId: number;
  dateOfDeath: string;
}) =>
  request("/funeral-assistance/death-events", {
    method: "POST",
    body: data,
  });

export const updateDeathEventAPI = (id: number, dateOfDeath: string) =>
  request(`/funeral-assistance/death-events/${id}`, {
    method: "PATCH",
    body: { dateOfDeath },
  });

export const releaseDeathEventAPI = (id: number) =>
  request(`/funeral-assistance/death-events/${id}/release`, {
    method: "PATCH",
  });


export const getFundSummaryAPI = () =>
  request("/funeral-assistance/fund-summary");

export const getActiveMembersForMonthAPI = (month: string) =>
  request(`/funeral-assistance/active-members-for-month?month=${encodeURIComponent(month)}`);

export type FundType = "retirement" | "benefits" | "admin";

export type FundEvent = {
  id: number;
  fund_type: FundType;
  event: string;
  description: string;
  amount: number;
  event_date: string;
  status: "Recorded" | "Approved" | "Cancelled";
};

export const getFundEventsAPI = () =>
  request<FundEvent[]>("/funeral-assistance/fund-events");

export const createFundEventAPI = (data: {
  fundType: FundType;
  event: string;
  description: string;
  amount: number;
  eventDate: string;
  status?: FundEvent["status"];
}) =>
  request("/funeral-assistance/fund-events", {
    method: "POST",
    body: data,
  });

export const updateFundEventAPI = (id: number, data: {
  fundType: FundType;
  event: string;
  description: string;
  amount: number;
  eventDate: string;
  status: FundEvent["status"];
}) =>
  request(`/funeral-assistance/fund-events/${id}`, {
    method: "PATCH",
    body: data,
  });