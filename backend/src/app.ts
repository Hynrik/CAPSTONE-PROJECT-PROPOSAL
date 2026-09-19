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

const allowedOrigins = process.env.FRONTEND_URLS
	?.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

// MIDDLEWARES
app.use(
	cors({
		origin: allowedOrigins?.length ? allowedOrigins : true,
	})
);
app.use(express.json());

app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/funeral-assistance", funeralAssistanceRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/system-logs", systemLogsRoutes);
app.use("/api/users", usersRoutes);


export default app;