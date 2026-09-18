import { Routes, Route } from "react-router-dom";

import MainLayout from "../app/layout/Mainlayout";

import Dashboard from "../../pages/admin/dashboard";
import Payments from "../../pages/admin/payments";
import Analytics from "../../pages/admin/analytics";
import Members from "../../pages/admin/members";
import Profile from "../../pages/admin/profile";
import FuneralAssistance from "../../pages/admin/funeralassistance";
import FundTracker from "../../pages/admin/fundTracker";

import AdminLogin from "../../pages/auth/Landing";

import AdminManagement from "../../pages/SuperAdmin/AdminManagement";
import SystemLogsPage from "../../pages/SuperAdmin/SystemLogsPage";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}
      <Route path="/login" element={<AdminLogin />} />

      {/* ================= ADMIN + SUPERADMIN SYSTEM ================= */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "superadmin"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/funeralassistance" element={<FuneralAssistance />} />
          <Route path="/fund-tracker" element={<FundTracker />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/members" element={<Members />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* ================= SUPERADMIN ONLY ================= */}
      <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
        <Route element={<MainLayout />}>
          <Route path="/admins" element={<AdminManagement />} />
          <Route path="/system-logs" element={<SystemLogsPage />} />
        </Route>
      </Route>

    </Routes>
  );
}