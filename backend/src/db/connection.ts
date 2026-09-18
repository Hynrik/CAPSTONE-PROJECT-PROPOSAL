import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config(); // MUST be on top

console.log("DB USER:", process.env.DB_USER); // debug check

export const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection failed:", err);
  } else {
    console.log("✅ DB connected successfully");
  }
});