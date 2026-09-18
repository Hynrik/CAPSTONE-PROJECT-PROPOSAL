import { db } from "../db/connection";
import { logAction } from "../utils/logger";
import bcrypt from "bcrypt";

const allowedRoles = ["admin", "superadmin"];

export const createUser = async (req: any, res: any) => {
  const { username, password, full_name, email, role = "admin" } = req.body;

  if (!username?.trim() || !password || password.length < 6 || !full_name?.trim() || !email?.trim() || !allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Username, password (minimum 6 characters), full name, email, and role are required" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (username, password, full_name, email, role, created_by) VALUES (?, ?, ?, ?, ?, ?)",
      [username.trim(), passwordHash, full_name.trim(), email.trim(), role, req.user?.id ?? null],
      (err, result: any) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Username or email already exists" });
          console.error("CREATE USER ERROR:", err);
          return res.status(500).json({ message: "Failed to create user" });
        }

        logAction("CREATE_USER", `Created user ${username}`, { id: req.user?.id, role: req.user?.role });
        res.status(201).json({ id: result.insertId, message: "User created" });
      }
    );
  } catch (error) {
    console.error("HASH USER PASSWORD ERROR:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

export const getUsers = (_req: any, res: any) => {
  db.query(
    "SELECT id, username, full_name, email, role, created_At, created_by FROM users ORDER BY created_At DESC",
    (err, results) => {
      if (err) {
        console.error("GET USERS ERROR:", err);
        return res.status(500).json({ message: "Failed to fetch users" });
      }

      res.json(results);
    }
  );
};

export const updateUser = (req: any, res: any) => {
  const id = Number(req.params.id);
  const { username, full_name, email, role } = req.body;

  if (!Number.isInteger(id) || id < 1 || !username?.trim() || !full_name?.trim() || !email?.trim() || !allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Valid username, full name, email, and role are required" });
  }

  db.query(
    "UPDATE users SET username = ?, full_name = ?, email = ?, role = ? WHERE id = ?",
    [username.trim(), full_name.trim(), email.trim(), role, id],
    (err, result: any) => {
      if (err) {
        console.error("UPDATE USER ERROR:", err);
        return res.status(500).json({ message: "Failed to update user" });
      }

      if (!result.affectedRows) return res.status(404).json({ message: "User not found" });

      logAction("UPDATE_USER", `Updated user ${username}`, {
        id: req.user?.id,
        role: req.user?.role,
      });

      res.json({ message: "User updated" });
    }
  );
};

export const deleteUser = (req: any, res: any) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: "Invalid user ID" });
  if (Number(req.user?.id) === id) return res.status(400).json({ message: "You cannot delete your own account" });

  db.query("DELETE FROM users WHERE id = ?", [id], (err, result: any) => {
    if (err) {
      console.error("DELETE USER ERROR:", err);
      return res.status(500).json({ message: "Failed to delete user" });
    }

    if (!result.affectedRows) return res.status(404).json({ message: "User not found" });

    logAction("DELETE_USER", `Deleted user ${id}`, {
      id: req.user?.id,
      role: req.user?.role,
    });

    res.json({ message: "User deleted" });
  });
};