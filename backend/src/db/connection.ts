import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config(); // MUST be on top

const dbPort = Number(process.env.DB_PORT || 3306);
const useSsl =
  process.env.DB_SSL?.toLowerCase() === "true" || dbPort === 4000;

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: dbPort,
  user: process.env.DB_USER || process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: useSsl
    ? {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      }
    : undefined,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ DB connection failed:", err);
  } else {
    console.log("✅ DB connected successfully");
    connection.query(
      `SELECT
        DATABASE() AS databaseName,
        (SELECT COUNT(*) FROM members) AS memberCount,
        (SELECT COUNT(*) FROM payments) AS paymentCount`,
      (queryErr, results: any[]) => {
        if (queryErr) {
          console.error("DB data check failed:", queryErr.message);
        } else {
          const counts = results[0];
          console.log(
            `DB data check: database=${counts.databaseName}, members=${counts.memberCount}, payments=${counts.paymentCount}`
          );
        }
        connection.release();
      }
    );
  }
});