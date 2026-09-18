import { db } from "../../db/connection";
import type { ResultSetHeader } from "mysql2";
import { logAction } from "../../utils/logger";

const getMonthYear = (dateString: string): string | null => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Store as a valid SQL DATE for month-year tracking.
  // MySQL DATE requires YYYY-MM-DD, so use the first day of the month.
  return `${year}-${month}-01`;
};

const upsertMemberMonthStatus = (
  memberId: number,
  monthYear: string,
  callback: (err: any | null) => void
) => {
  const findSql = `SELECT id FROM member_month_status WHERE member_id = ? AND month_year = ? LIMIT 1`;

  db.query(findSql, [memberId, monthYear], (findErr, findResults: any[]) => {
    if (findErr) {
      return callback(findErr);
    }

    if (Array.isArray(findResults) && findResults.length > 0) {
      const updateSql = `UPDATE member_month_status SET status = 'active' WHERE member_id = ? AND month_year = ?`;
      return db.query(updateSql, [memberId, monthYear], (updateErr) => {
        return callback(updateErr);
      });
    }

    const insertSql = `INSERT INTO member_month_status (member_id, month_year, status) VALUES (?, ?, 'active')`;
    db.query(insertSql, [memberId, monthYear], (insertErr) => {
      return callback(insertErr);
    });
  });
};

/* =========================
   GET ALL PAYMENTS (NO LOGGING = CLEAN)
========================= */
export const getPayments = (req: any, res: any) => {
  const sql = `
    SELECT 
      /* =========================
         PAYMENT INFO
      ========================= */
      p.id,
      p.member_id,
      p.submitted_by,
      p.amount,
      p.payment_date,
      p.description,

      p.retirement_fund,
      p.benefits_fund,
      p.admin_fund,

      p.created_at,

      /* =========================
         MEMBER INFO
      ========================= */
      m.first_name,
      m.last_name,
      m.member_code,
      m.status AS member_status,

      /* =========================
         IMPORTANT FOR BALANCE
      ========================= */
      m.member_since AS membership_start_date

    FROM payments p

    LEFT JOIN members m
      ON m.id = p.member_id

    ORDER BY p.payment_date DESC
  `;

  db.query(sql, (err, results: any) => {
    if (err) {
      console.error("GET PAYMENTS ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch payments",
        error: err.message,
      });
    }

    const rows = Array.isArray(results) ? results : [];

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  });
};

/* =========================
   CREATE PAYMENT
========================= */
export const createPayment = (req: any, res: any) => {
  try {
    const { memberId, amount, paymentDate, description } = req.body;

    const user = req.user;

    if (!user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!memberId || !amount || !paymentDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const numAmount = Number(amount);
    const numMemberId = Number(memberId);

    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const monthYear = getMonthYear(paymentDate);
    if (!monthYear) {
      return res.status(400).json({ message: "Invalid paymentDate" });
    }

    const retirement_fund = numAmount * 0.4;
    const benefits_fund = numAmount * 0.3;
    const admin_fund = numAmount * 0.3;

    const sql = `
      INSERT INTO payments (
        member_id,
        submitted_by,
        amount,
        payment_date,
        description,
        retirement_fund,
        benefits_fund,
        admin_fund
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        numMemberId,
        user.id,
        numAmount,
        paymentDate,
        description ?? "",
        retirement_fund,
        benefits_fund,
        admin_fund,
      ],
      (err, result: ResultSetHeader) => {
        if (err) {
          return res.status(500).json({
            message: "Failed to create payment",
            error: err,
          });
        }

        upsertMemberMonthStatus(numMemberId, monthYear, (statusErr) => {
          if (statusErr) {
            console.error("MEMBER_MONTH_STATUS ERROR:", statusErr);
            return res.status(201).json({
              message:
                "Payment created successfully, but failed to update member month status",
              paymentId: result.insertId,
              warning: "member_month_status update failed",
            });
          }

          logAction("CREATE_PAYMENT", "Created new payment record", {
            id: user.id,
            role: user.role,
          });

          res.status(201).json({
            message: "Payment created successfully",
            paymentId: result.insertId,
          });
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      message: "Unexpected error",
      error,
    });
  }
};

/* =========================
   UPDATE PAYMENT
========================= */
export const updatePayment = (req: any, res: any) => {
  const { id } = req.params;
  const { amount, paymentDate, description, memberId } = req.body;

  const user = req.user;

  if (!id) {
    return res.status(400).json({ message: "Missing payment ID" });
  }

  if (!memberId) {
    return res.status(400).json({ message: "Missing memberId" });
  }

  const numAmount = Number(amount);
  const numMemberId = Number(memberId);

  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  if (!Number.isFinite(numMemberId) || numMemberId <= 0) {
    return res.status(400).json({ message: "Invalid memberId" });
  }

  const monthYear = getMonthYear(paymentDate);
  if (!monthYear) {
    return res.status(400).json({ message: "Invalid paymentDate" });
  }

  const retirement_fund = numAmount * 0.4;
  const benefits_fund = numAmount * 0.3;
  const admin_fund = numAmount * 0.3;

  const sql = `
    UPDATE payments
    SET 
      amount = ?,
      payment_date = ?,
      description = ?,
      retirement_fund = ?,
      benefits_fund = ?,
      admin_fund = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      numAmount,
      paymentDate,
      description,
      retirement_fund,
      benefits_fund,
      admin_fund,
      id,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update payment",
          error: err,
        });
      }

      upsertMemberMonthStatus(numMemberId, monthYear, (statusErr) => {
        if (statusErr) {
          console.error("MEMBER_MONTH_STATUS ERROR:", statusErr);
          return res.status(200).json({
            message: "Payment updated successfully, but failed to update member month status",
            warning: "member_month_status update failed",
          });
        }

        logAction("UPDATE_PAYMENT", `Updated payment #${id}`, {
          id: user?.id,
          role: user?.role,
        });

        res.json({
          message: "Payment updated successfully",
        });
      });
    }
  );
};

/* =========================
   DELETE PAYMENT
========================= */
export const deletePayment = (req: any, res: any) => {
  const { id } = req.params;
  const user = req.user;

  if (!id) {
    return res.status(400).json({ message: "Missing payment ID" });
  }

  const sql = `DELETE FROM payments WHERE id = ?`;

  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to delete payment",
        error: err,
      });
    }

    logAction("DELETE_PAYMENT", `Deleted payment #${id}`, {
      id: user?.id,
      role: user?.role,
    });

    res.json({
      message: "Payment deleted successfully",
    });
  });
};