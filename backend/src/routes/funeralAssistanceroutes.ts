import express from "express";

/* ================= CONTROLLERS ================= */
import {
  getContributions,
  createContribution,
  markContributionPaid,
} from "../controllers/funeralassistance/contributions.controller";

import {
  getDeathEvents,
  createDeathEvent,
  updateDeathEvent,
  releaseDeathEvent,
} from "../controllers/funeralassistance/deathevents.controller";

import {
  getFundSummary,
  getActiveMembersForMonth,
} from "../controllers/funeralassistance/monthlyfund.controller";

import {
  getFundEvents,
  createFundEvent,
} from "../controllers/funeralassistance/fundEvents.controller";

/* ================= MIDDLEWARE ================= */
import { verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

/* ================= CONTRIBUTIONS ================= */

// Get all contributions
router.get("/contributions", verifyToken, getContributions);

// Create contribution
router.post("/contributions", verifyToken, createContribution);

// Mark contribution as paid
router.post("/contributions/mark-paid", verifyToken, markContributionPaid);
router.put("/contributions/mark-paid", verifyToken, markContributionPaid);

/* ================= DEATH EVENTS ================= */

// Get all death events
router.get("/death-events", verifyToken, getDeathEvents);

// Create death event
router.post("/death-events", verifyToken, createDeathEvent);

// Edit a pending death event
router.patch("/death-events/:id", verifyToken, updateDeathEvent);
router.put("/death-events/:id", verifyToken, updateDeathEvent);

// Release funeral assistance
router.patch("/death-events/:id/release", verifyToken, releaseDeathEvent);
router.put("/death-events/:id/release", verifyToken, releaseDeathEvent);

/* ================= MONTHLY FUND ================= */

// Get fund summary
router.get("/fund-summary", verifyToken, getFundSummary);
router.get("/active-members-for-month", verifyToken, getActiveMembersForMonth);

/* ================= FUND EVENTS ================= */

router.get("/fund-events", verifyToken, getFundEvents);
router.post("/fund-events", verifyToken, createFundEvent);

export default router;