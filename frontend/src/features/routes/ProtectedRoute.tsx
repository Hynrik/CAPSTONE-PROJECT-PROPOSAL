/* eslint-disable @typescript-eslint/no-unused-vars */
import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

type Decoded = {
  role: string;
};

export default function ProtectedRoute({
  allowedRoles,
}: {
  allowedRoles: string[];
}) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode<Decoded>(token);

    const role = decoded.role?.trim().toLowerCase();
    const allowed = allowedRoles.map((r) => r.trim().toLowerCase());

    if (!role) {
      return <Navigate to="/login" replace />;
    }
    if (!allowed.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
  } catch (err) {
    return <Navigate to="/login" replace />;
  }
}