import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/connection";
import { logAction } from "../utils/logger";
import { rolePermissions } from "../config/rolePermissions";
import { sendOtpEmail } from "../utils/mailer";
const JWT_SECRET = process.env.JWT_SECRET || "secret";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const getDatabaseErrorMessage = (error: unknown) => {
  if (error && typeof error === "object") {
    const databaseError = error as {
      code?: unknown;
      errno?: unknown;
      sqlState?: unknown;
      sqlMessage?: unknown;
      message?: unknown;
    };
    const details = [
      databaseError.code,
      databaseError.errno,
      databaseError.sqlState,
      databaseError.sqlMessage || databaseError.message,
    ]
      .filter((detail) => detail !== undefined && detail !== null && String(detail).trim())
      .map(String);

    if (details.length > 0) {
      return details.join(" | ");
    }
  }

  return "Unknown database error. Check the Render database environment variables and logs.";
};

/* =========================
   STEP 1: LOGIN (REQUEST OTP)
========================= */
export const login = (req: Request, res: Response) => {
  const { username, password } = req.body;

  const ip = (req.headers["x-forwarded-for"] as string) || req.ip || req.connection?.remoteAddress || "";
  const ua = req.headers["user-agent"] || "";

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results: any[]) => {
      if (err) {
        const message = getDatabaseErrorMessage(err);
        console.error("LOGIN USER QUERY ERROR:", message);
        return res.status(500).json({
          message: `Login database query failed: ${message}`
        });
      }

      if (results.length === 0) {
        // record failed login attempt (unknown username)
        try {
          logAction("LOGIN_FAIL", `Invalid credentials for username=${username}` , undefined, { ip, userAgent: ua });
        } catch (e) {
          console.warn("failed to log login_fail", e);
        }

        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = results[0];

      const match = await bcrypt.compare(password, user.password);


      if (!match) {
        // record failed login attempt (bad password)
        try {
          logAction("LOGIN_FAIL", `Invalid credentials for username=${username}` , { id: user.id, role: user.role }, { ip, userAgent: ua });
        } catch (e) {
          console.warn("failed to log login_fail", e);
        }

        return res.status(401).json({ message: "Invalid credentials" });
      }

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      db.query(
        "INSERT INTO otp_codes (admin_id, otp, expires_at) VALUES (?, ?, ?)",
        [user.id, otp, expiresAt],
        (otpErr) => {
          if (otpErr) {
            console.error("CREATE OTP ERROR:", getDatabaseErrorMessage(otpErr));
          }
        }
      );

      try {
        await sendOtpEmail(user.email, otp);
        console.log("✅ OTP email sent to:", user.email);
      } catch (emailErr) {
        const message = emailErr instanceof Error ? emailErr.message : String(emailErr);
        console.error("❌ Failed to send OTP email:", message);
        return res.status(500).json({ message: "Unable to send verification email. Please contact an administrator." });
      }

      try {
        logAction("OTP_REQUEST", `OTP requested for adminId=${user.id}` , { id: user.id, role: user.role }, { ip, userAgent: ua, meta: { expiresAt: expiresAt.toISOString() } });
      } catch (e) {
        console.warn("failed to log otp_request", e);
      }

      return res.json({
        message: "OTP sent",
        adminId: user.id,
        userName: user.username
      });
    }
  );
};

/* =========================
   STEP 2: VERIFY OTP → JWT + PERMISSIONS
========================= */
export const verifyOtp = (req: Request, res: Response) => {
  const { adminId, otp } = req.body;
  const ip = (req.headers["x-forwarded-for"] as string) || req.ip || req.connection?.remoteAddress || "";
  const ua = req.headers["user-agent"] || "";

  db.query(
    `SELECT * FROM otp_codes 
     WHERE admin_id = ? AND otp = ? AND is_used = 0 
     ORDER BY created_at DESC LIMIT 1`,
    [adminId, otp],
    (err, results: any[]) => {
      if (err) {
        const message = getDatabaseErrorMessage(err);
        console.error("VERIFY OTP QUERY ERROR:", message);
        return res.status(500).json({
          message: `OTP database query failed: ${message}`
        });
      }

      if (results.length === 0) {
        try {
          logAction("LOGIN_FAIL", `Invalid OTP for adminId=${adminId}`, { id: adminId, role: "unknown" }, { ip, userAgent: ua });
        } catch (e) {
          console.warn("failed to log invalid otp", e);
        }
        return res.status(401).json({ message: "Invalid OTP" });
      }

      const record = results[0];

      if (new Date(record.expires_at) < new Date()) {
        try {
          logAction("LOGIN_FAIL", `OTP expired for adminId=${adminId}`, { id: adminId, role: "unknown" }, { ip, userAgent: ua });
        } catch (e) {
          console.warn("failed to log expired otp", e);
        }
        return res.status(401).json({ message: "OTP expired" });
      }

      db.query("UPDATE otp_codes SET is_used = 1 WHERE id = ?", [
        record.id
      ]);

      /* =========================
         GET USER
      ========================= */
      db.query(
        "SELECT role, username FROM users WHERE id = ?",
        [adminId],
        (err2, results: any[]) => {
          if (err2) {
            const message = getDatabaseErrorMessage(err2);
            console.error("GET LOGIN USER ERROR:", message);
            return res.status(500).json({
              message: `Login user lookup failed: ${message}`
            });
          }

          const user = results?.[0];

          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }

          const role = user.role;

          /* =========================
             ASSIGN PERMISSIONS
          ========================= */
          const permissions = rolePermissions[role] || [];

          /* =========================
             CREATE JWT
          ========================= */
          const token = jwt.sign(
            {
              id: adminId,
              role,
              permissions
            },
            JWT_SECRET,
            { expiresIn: "1d" }
          );

          console.log(permissions, "PERMISSIONS FOR ROLE:", role);

          /* =========================
             LOG ACTION
          ========================= */
          try {
            logAction("LOGIN", "User logged in", { id: adminId, role }, { ip, userAgent: ua });
          } catch (e) {
            console.warn("failed to log login", e);
          }

          return res.json({
            message: "Login successful",
            token,
            role,
            permissions
          });
        }
      );
    }
  );
};