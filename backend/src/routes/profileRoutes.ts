import express from "express";

const router = express.Router();

// Get admin profile
router.get("/", (req, res) => {
  res.json({ message: "Get admin profile" });
});

// Update profile
router.put("/", (req, res) => {
  res.json({ message: "Update profile", data: req.body });
});

export default router;