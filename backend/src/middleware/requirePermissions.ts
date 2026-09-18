import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const permissions = req.user?.permissions || [];

    if (!Array.isArray(permissions)) {
      return res.status(403).json({ message: "Invalid permissions format" });
    }

    if (!permissions.includes(permission)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};