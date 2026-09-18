import { db } from "../db/connection";

type Role = "admin" | "superadmin" | string;

/**
 * Log an action to `system_logs`.
 * If extra details (ip, userAgent, meta) are provided they will be appended to the description
 * to avoid requiring schema changes in the database.
 */
export const logAction = (
  action: string,
  description: string,
  user?: {
    id: number;
    role: Role;
  },
  opts?: {
    ip?: string;
    userAgent?: string;
    meta?: any;
  }
) => {
  try {
    let desc = description || "";

    const parts: string[] = [];
    if (opts?.ip) parts.push(`ip=${opts.ip}`);
    if (opts?.userAgent) parts.push(`ua=${String(opts.userAgent).slice(0, 200)}`);
    if (opts?.meta) {
      try {
        parts.push(`meta=${JSON.stringify(opts.meta).slice(0, 1000)}`);
      } catch (e) {
        parts.push(`meta=[unserializable]`);
      }
    }

    if (parts.length > 0) {
      desc = `${desc} | ${parts.join(" ")}`;
    }

    const sql = `
      INSERT INTO system_logs (
        action,
        description,
        user_id,
        role
      )
      VALUES (?, ?, ?, ?)
    `;

    const uid = user?.id ?? null;
    const role = user?.role ?? null;

    db.query(sql, [action, desc, uid, role], (err) => {
      if (err) {
        // fallback: log to console if DB insert fails
        console.warn("logAction: failed to write system_log", err);
      }
    });
  } catch (e) {
    console.warn("logAction unexpected error", e);
  }
};

export default logAction;