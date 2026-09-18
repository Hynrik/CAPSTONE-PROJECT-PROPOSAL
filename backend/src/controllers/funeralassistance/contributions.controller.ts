import { db } from "../../db/connection";
import type { ResultSetHeader } from "mysql2";
import { logAction } from "../../utils/logger";

/* ======================
   GET ALL CONTRIBUTIONS
========================= */
export const getContributions = (req: any, res: any) => {
  const sql = `
    SELECT 
      c.id,
      c.member_id,
      c.month_covered,
      c.amount,
      c.status,
      c.paid_at,
      c.created_at,

      CONCAT(
        m.first_name,
        ' ',
        IFNULL(CONCAT(m.middle_name, ' '), ''),
        m.last_name
      ) AS member_name,

      m.member_code

    FROM contributions c
    LEFT JOIN members m ON m.id = c.member_id
    ORDER BY c.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("GET CONTRIBUTIONS ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch contributions",
        error: err,
      });
    }

    res.json(results);
  });
};

/* =========================
   MARK AS PAID
========================= */
export const markContributionPaid = (req: any, res: any) => {
  const { memberId, month } = req.body;
  const user = req.user;

  if (!memberId || !month) {
    return res.status(400).json({
      message: "memberId and month are required",
    });
  }

  const sql = `
    UPDATE contributions
    SET 
      status = 'Paid',
      paid_at = NOW()
    WHERE member_id = ? AND month_covered = ?
  `;

  db.query(sql, [memberId, month], (err, result: ResultSetHeader) => {
    if (err) {
      console.error("MARK CONTRIBUTION PAID ERROR:", err);

      return res.status(500).json({
        message: "Failed to update contribution",
        error: err,
      });
    }

    logAction(
      "MARK_CONTRIBUTION_PAID",
      `Marked contribution as PAID (member ${memberId}, month ${month})`,
      {
        id: user?.id,
        role: user?.role,
      }
    );

    res.json({
      message: "Contribution marked as paid",
      affectedRows: result.affectedRows,
    });
  });
};

/* =========================
   CREATE CONTRIBUTION
========================= */
export const createContribution = (req: any, res: any) => {
  const { memberId, month, amount } = req.body;
  const user = req.user;

  if (!memberId || !month) {
    return res.status(400).json({
      message: "memberId and month are required",
    });
  }

  const findSql = `SELECT id FROM contributions WHERE member_id = ? AND month_covered = ? LIMIT 1`;

  db.query(findSql, [memberId, month], (findErr, findResults: any[]) => {
    if (findErr) {
      console.error("CHECK CONTRIBUTION EXISTENCE ERROR:", findErr);
      return res.status(500).json({
        message: "Failed to verify contribution",
        error: findErr,
      });
    }

    if (findResults.length > 0) {
      return res.status(409).json({
        message: "Contribution already exists for this member and month",
      });
    }

    const sql = `
      INSERT INTO contributions (
        member_id,
        month_covered,
        amount,
        status,
        created_at
      )
      VALUES (?, ?, ?, 'Unpaid', NOW())
    `;

    db.query(
      sql,
      [memberId, month, amount ?? 20],
      (err, result: ResultSetHeader) => {
        if (err) {
          console.error("CREATE CONTRIBUTION ERROR:", err);

          return res.status(500).json({
            message: "Failed to create contribution",
            error: err,
          });
        }

        logAction(
          "CREATE_CONTRIBUTION",
          `Created contribution (member ${memberId}, month ${month})`,
          {
            id: user?.id,
            role: user?.role,
          }
        );

        res.status(201).json({
          message: "Contribution created",
          id: result.insertId,
        });
      }
    );
  });
};