import { db } from "../../db/connection";

const RATE = 20;

/* =========================
   GET FUND SUMMARY (FINAL)
========================= */
export const getFundSummary = (req: any, res: any) => {
  const sql = `
    SELECT
      summary.month,
      summary.deaths,

      COALESCE(m.activeMembers, 0) AS activeMembers,

      /* ACTUAL COLLECTED MONEY */
      COALESCE(p.paidMembers, 0) * ? AS gathered,

      /* TOTAL EXPECTED COLLECTION */
      COALESCE(m.activeMembers, 0) * ? * summary.deaths AS fund,

      summary.releasedEvents,

      /* DEATH PAYOUT */
      COALESCE(m.activeMembers, 0) * ? * summary.releasedEvents AS released,

      /* BALANCE */
      (COALESCE(m.activeMembers, 0) * ? * summary.deaths)
      - (COALESCE(m.activeMembers, 0) * ? * summary.releasedEvents) AS balance

    FROM
      /* =========================
         DEATH EVENTS PER MONTH
      ========================= */
      (
        SELECT
          DATE_FORMAT(date_of_death, '%Y-%m') AS month,
          COUNT(*) AS deaths,
          COALESCE(SUM(status = 'Released'), 0) AS releasedEvents
        FROM death_events
        GROUP BY DATE_FORMAT(date_of_death, '%Y-%m')
      ) summary

    /* =========================
       ACTIVE MEMBERS FROM THE PREVIOUS MONTH
       Match the month before each death month to member_month_status rows.
    ========================= */
    LEFT JOIN (
      SELECT
        DATE_FORMAT(month_year, '%Y-%m') AS month,
        COUNT(*) AS activeMembers
      FROM member_month_status
      WHERE status = 'active'
      GROUP BY DATE_FORMAT(month_year, '%Y-%m')
    ) m
      ON m.month = DATE_FORMAT(DATE_SUB(CONCAT(summary.month, '-01'), INTERVAL 1 MONTH), '%Y-%m')

    /* =========================
       PAYMENTS PER MONTH (FIXED)
       IMPORTANT: NO MONTH SHIFTING
    ========================= */
    LEFT JOIN (
      SELECT
        month_covered,
        COUNT(DISTINCT member_id) AS paidMembers
      FROM contributions
      WHERE status = 'Paid'
      GROUP BY month_covered
    ) p
      ON p.month_covered = summary.month

    ORDER BY summary.month DESC
  `;

  db.query(sql, [RATE, RATE, RATE, RATE, RATE], (err, results: any[]) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch fund summary",
        error: err,
      });
    }

    const data = results.map((r) => ({
      month: r.month,
      deaths: Number(r.deaths || 0),
      activeMembers: Number(r.activeMembers || 0),

      gathered: Number(r.gathered || 0),
      fund: Number(r.fund || 0),

      released: Number(r.released || 0),
      balance: Number(r.balance || 0),
    }));

    res.json(data);
  });
};

export const getActiveMembersForMonth = (req: any, res: any) => {
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ message: "month is required" });
  }

  const sql = `
    SELECT member_id
    FROM member_month_status
    WHERE month_year = ? AND status = 'active'
  `;

  db.query(sql, [month], (err, results: any[]) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch active members for month",
        error: err,
      });
    }

    const memberIds = (results || []).map((row) => Number(row.member_id));
    res.json(memberIds);
  });
};