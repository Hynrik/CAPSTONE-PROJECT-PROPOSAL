import express from "express";
import { getMembers, createMember,updateMember,deleteMember } from "../controllers/member.controller";
import { verifyToken } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", verifyToken, getMembers);
router.post("/", verifyToken, createMember);
router.put("/:id", verifyToken, updateMember);
router.delete("/:id", verifyToken, deleteMember);

export default router;