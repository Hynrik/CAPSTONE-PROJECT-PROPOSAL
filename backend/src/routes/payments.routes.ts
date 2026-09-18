import express from "express";
import { getPayments, createPayment, updatePayment, deletePayment } from "../controllers/payments/payments.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/",verifyToken, getPayments);
router.post("/",verifyToken, createPayment);
router.put("/:id",verifyToken, updatePayment);
router.delete("/:id",verifyToken, deletePayment);

export default router;