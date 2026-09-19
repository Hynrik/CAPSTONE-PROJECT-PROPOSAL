import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config(); // MUST be on top

const useSsl = process.env.DB_SSL === "true";

export const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || process.env.DB_DATABASE,
  ssl: useSsl
    ? {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      }
    : undefined,
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err);
  } else {
    console.log("✅ DB connected successfully");
  }
});