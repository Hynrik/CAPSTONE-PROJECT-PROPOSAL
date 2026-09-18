import express from "express";
import { db } from "../db/connection";

const router = express.Router();

// Dashboard totals - compute from DB
router.get("/totals", (req, res) => {
  const sql = `
    SELECT
      m.id,
      m.member_since,
      m.status,
      COALESCE(SUM(p.amount), 0) AS paid_total
    FROM members m
    LEFT JOIN payments p ON p.member_id = m.id
    GROUP BY m.id
  `;

  db.query(sql, (err, results: any[]) => {
    if (err) {
      console.error("ANALYTICS TOTALS ERROR:", err);
      return res.status(500).json({ message: "Failed to compute totals", error: err });
    }

    const rows = Array.isArray(results) ? results : [];

    const totalMembers = rows.length;
    let totalPayments = 0;
    let activeMembers = 0;
    let pendingBalance = 0;

    const today = new Date();

    for (const r of rows) {
      const paid = Number(r.paid_total || 0);
      totalPayments += paid;

      if (r.status === "active") activeMembers += 1;

      // compute expectedTotal based on months active (monthly expected = 100)
      const start = new Date(r.member_since);
      let monthsActive = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth()) + 1;
      if (monthsActive < 0) monthsActive = 0;
      const expectedTotal = monthsActive * 100;

      const balance = expectedTotal - paid;
      if (balance > 0) pendingBalance += balance;
    }

    res.json({
      totalMembers,
      totalPayments,
      activeMembers,
      pendingBalance,
    });
  });
});

// Payment trends - supports 'period' query: 'daily' (default last 7 days) or 'monthly' (last 12 months)
router.get("/payments-trend", (req, res) => {
  const period = String(req.query.period || "daily");

  if (period === "monthly") {
    // aggregate by year-month for last 12 months
    const sql = `
      SELECT YEAR(payment_date) as y, MONTH(payment_date) as m, COALESCE(SUM(amount),0) as sum
      FROM payments
      WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
      GROUP BY YEAR(payment_date), MONTH(payment_date)
      ORDER BY YEAR(payment_date), MONTH(payment_date)
    `;

    db.query(sql, (err, results: any[]) => {
      if (err) {
        console.error("PAYMENTS TREND MONTHLY ERROR:", err);
        return res.status(500).json({ message: "Failed to fetch monthly payments trend", error: err });
      }

      const map: Record<string, number> = {};
      for (const r of results || []) {
        const key = `${r.y}-${String(r.m).padStart(2, "0")}`;
        map[key] = Number(r.sum || 0);
      }

      const labels: string[] = [];
      const data: number[] = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        labels.push(d.toLocaleString(undefined, { month: 'short' }));
        data.push(map[key] || 0);
      }

      return res.json({ labels, data });
    });

    return;
  }

  // default: daily (last 7 days)
  const sql = `
    SELECT DATE(payment_date) as d, COALESCE(SUM(amount),0) as sum
    FROM payments
    WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    GROUP BY DATE(payment_date)
    ORDER BY DATE(payment_date)
  `;

  db.query(sql, (err, results: any[]) => {
    if (err) {
      console.error("PAYMENTS TREND ERROR:", err);
      return res.status(500).json({ message: "Failed to fetch payments trend", error: err });
    }

    // build labels for last 7 days
    const labels: string[] = [];
    const dataMap: Record<string, number> = {};
    for (const r of results || []) {
      const key = (r.d || "").toString();
      dataMap[key] = Number(r.sum || 0);
    }

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      labels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
    }

    const data = labels.map((lbl, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - idx));
      const key = d.toISOString().slice(0, 10);
      return dataMap[key] || 0;
    });

    res.json({ labels, data });
  });
});

// Member stats - distribution for status chart
router.get("/member-stats", (req, res) => {
  const sql = `SELECT status, COUNT(*) as cnt FROM members GROUP BY status`;

  db.query(sql, (err, results: any[]) => {
    if (err) {
      console.error("MEMBER STATS ERROR:", err);
      return res.status(500).json({ message: "Failed to fetch member stats", error: err });
    }

    const map: Record<string, number> = {};
    for (const r of results || []) {
      map[r.status] = Number(r.cnt || 0);
    }

    res.json({
      active: map['active'] || 0,
      inactive: map['inactive'] || 0,
      pending: map['pending'] || 0,
    });
  });
});

export default router;