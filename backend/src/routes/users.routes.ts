import express from "express";
import { createUser, deleteUser, getUsers, updateUser } from "../controllers/users.controller";
import { verifyToken, requirePermission } from "../middleware/auth.middleware";

const router = express.Router();

router.use(verifyToken, requirePermission("users.manage"));
router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;