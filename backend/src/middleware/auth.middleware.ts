import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logAction } from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
    permissions: string[];
  };
}

  export const verifyToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = decoded as {
        id: number;
        role: string;
        permissions: string[];
      };

      // LOGGING: record state-changing requests performed by admin or superadmin
      try {
        const method = (req.method || "").toUpperCase();
        if (req.user && ["admin", "superadmin"].includes(req.user.role) && ["POST", "PUT", "DELETE"].includes(method)) {
          const bodyPreview = req.body ? JSON.stringify(req.body).slice(0, 1000) : "";
          const desc = `${method} ${req.originalUrl} ${bodyPreview}`;
          const ip = (req.headers["x-forwarded-for"] as string) || req.ip || req.connection?.remoteAddress || "";
          const ua = req.headers["user-agent"] || "";
          logAction(`API_${method}`, desc, { id: req.user.id, role: req.user.role as any }, { ip, userAgent: ua });
        }
      } catch (e) {
        console.warn("admin logging failed", e);
      }

      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  };

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied (role)" });
    }

    next();
  };
};
export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const permissions = req.user?.permissions;

    if (!Array.isArray(permissions)) {
      return res.status(403).json({ message: "Invalid permissions" });
    }

    if (!permissions.includes(permission)) {
      return res.status(403).json({ message: "Access denied (permission)" });
    }

    next();
  };
};