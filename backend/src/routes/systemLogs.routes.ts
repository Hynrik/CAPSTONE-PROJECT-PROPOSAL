import express from "express";
import { verifyToken } from "../middleware/auth.middleware";
import { db } from "../db/connection";

const router = express.Router();

// GET /api/system-logs
// Query params: page, limit, userId, action, startDate, endDate
router.get("/", verifyToken, async (req, res) => {
  try {
    // only superadmin can read logs
    const role = req.user?.role;
    if (role !== "superadmin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const offset = (page - 1) * limit;

    const params: any[] = [];
    let where = "WHERE 1=1";

    if (req.query.userId) {
      where += " AND user_id = ?";
      params.push(Number(req.query.userId));
    }

    if (req.query.action) {
      where += " AND action = ?";
      params.push(String(req.query.action));
    }

    if (req.query.role) {
      where += " AND role = ?";
      params.push(String(req.query.role));
    }

    if (req.query.startDate) {
      where += " AND created_at >= ?";
      params.push(String(req.query.startDate));
    }

    if (req.query.endDate) {
      where += " AND created_at <= ?";
      params.push(String(req.query.endDate));
    }

    const countSql = `SELECT COUNT(*) as cnt FROM system_logs ${where}`;
    db.query(countSql, params, (cErr, cRows: any[]) => {
      if (cErr) {
        console.error("systemLogs count error", cErr);
        return res.status(500).json({ message: "Failed to fetch logs" });
      }

      const total = cRows && cRows[0] ? Number(cRows[0].cnt || 0) : 0;

      const sql = `SELECT sl.id, sl.action, sl.description, sl.user_id, sl.role, sl.created_at, u.username as performed_by FROM system_logs sl LEFT JOIN users u ON sl.user_id = u.id ${where} ORDER BY sl.id DESC LIMIT ? OFFSET ?`;
      const qParams = params.concat([limit, offset]);

      db.query(sql, qParams, (err, rows: any[]) => {
        if (err) {
          console.error("systemLogs query error", err);
          return res.status(500).json({ message: "Failed to fetch logs" });
        }

        res.json({
          total,
          page,
          limit,
          data: rows || [],
        });
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Unexpected error" });
  }
});

export default router;
