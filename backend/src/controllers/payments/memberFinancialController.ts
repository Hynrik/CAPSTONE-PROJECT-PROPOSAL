import { db } from "../../db/connection";
import type { ResultSetHeader } from "mysql2";
import { logAction } from "../../utils/logger";
export const getMembersWithBalance = (req: any, res: any) => {
  const sql = `
    SELECT 
      m.id,
      m.first_name,
      m.last_name,
      m.status,
      m.member_since,

      COALESCE(SUM(p.amount), 0) AS paid_total

    FROM members m
    LEFT JOIN payments p ON p.member_id = m.id
    GROUP BY m.id
  `;

  db.query(sql, (err, results: any[]) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch member balances",
        error: err,
      });
    }

    const enriched = results.map((m) => {
      const start = new Date(m.member_since);
      const today = new Date();

      let monthsActive =
        (today.getFullYear() - start.getFullYear()) * 12 +
        (today.getMonth() - start.getMonth()) +
        1;

      if (monthsActive < 0) monthsActive = 0;

      const expectedTotal = monthsActive * 100;
      const paidTotal = Number(m.paid_total || 0);

      return {
        id: m.id,
        firstName: m.first_name,
        lastName: m.last_name,
        status: m.status,
        memberSince: m.member_since,

        monthsActive,
        expectedTotal,
        paidTotal,
        balance: expectedTotal - paidTotal,
      };
    });

    res.json(enriched);
  });
};