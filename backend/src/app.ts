import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import memberRoutes from "./routes/members.routes";
import paymentRoutes from "./routes/payments.routes";
import funeralAssistanceRoutes from "./routes/funeralAssistanceroutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import systemLogsRoutes from "./routes/systemLogs.routes";
import usersRoutes from "./routes/users.routes";


const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/funeral-assistance", funeralAssistanceRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/system-logs", systemLogsRoutes);
app.use("/api/users", usersRoutes);


export default app;