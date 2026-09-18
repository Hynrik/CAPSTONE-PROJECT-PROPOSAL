import dotenv from "dotenv";
dotenv.config();

import app from "./app";

const PORT = process.env.PORT || 5000;

console.log("DB USER:", process.env.DB_USER); // debug


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});