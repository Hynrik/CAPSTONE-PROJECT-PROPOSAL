import type { ResultSetHeader } from "mysql2";
import { db } from "../../db/connection";
import { logAction } from "../../utils/logger";

const FUND_TYPES = ["retirement", "benefits", "admin"] as const;
type FundType = (typeof FUND_TYPES)[number];

const isFundType = (value: unknown): value is FundType =>
  typeof value === "string" && FUND_TYPES.includes(value as FundType);

export const getFundEvents = (_req: any, res: any) => {
  const sql = `
    SELECT id, fund_type, event, description, amount, event_date, status, created_by, created_at
    FROM fund_events
    ORDER BY event_date DESC, created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("GET FUND EVENTS ERROR:", err);
      return res.status(500).json({ message: "Failed to fetch fund events", error: err });
    }

    res.json(results);
  });
};

export const createFundEvent = (req: any, res: any) => {
  const { fundType, event, description, amount, eventDate, status = "Recorded" } = req.body;
  const user = req.user;

  if (!isFundType(fundType) || !event || !description || amount === undefined || !eventDate) {
    return res.status(400).json({
      message: "fundType, event, description, amount, and eventDate are required",
    });
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount < 0) {
    return res.status(400).json({ message: "amount must be a non-negative number" });
  }

  const sql = `
    INSERT INTO fund_events (fund_type, event, description, amount, event_date, status, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    sql,
    [fundType, event, description, numericAmount, eventDate, status, user?.id ?? null],
    (err, result: ResultSetHeader) => {
      if (err) {
        console.error("CREATE FUND EVENT ERROR:", err);
        return res.status(500).json({ message: "Failed to create fund event", error: err });
      }

      logAction("CREATE_FUND_EVENT", `Created ${fundType} fund event: ${event}`, {
        id: user?.id,
        role: user?.role,
      });

      res.status(201).json({ message: "Fund event created", id: result.insertId });
    }
  );
};
