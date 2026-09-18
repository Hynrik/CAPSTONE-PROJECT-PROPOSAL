import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

type Decoded = {
  role: "admin" | "superadmin";
};

export default function Sidebar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  let role: "admin" | "superadmin" | null = null;

  try {
    if (token) {
      const decoded = jwtDecode<Decoded>(token);
      role = decoded.role;
    }
  } catch {
    role = null;
  }

  // ✅ IMPORTANT: superadmin inherits admin access
  const isAdmin = role === "admin" || role === "superadmin";
  const isSuperAdmin = role === "superadmin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="sidebar d-flex flex-column min-vh-100">

      {/* ================= HEADER ================= */}
      <div className="p-3 border-bottom border-light">
        <h4 className="mb-0 fw-bold">
          <i className="bi bi-bank2 me-2"></i>
          IPG PRIDE
        </h4>
        <small className="text-light opacity-75">
          Cooperative System
        </small>
      </div>

      {/* ================= NAVIGATION ================= */}
      <nav className="mt-4 flex-grow-1">

        {/* ================= ADMIN + SUPERADMIN ================= */}
        {isAdmin && (
          <>
            <div className="sidebar-section-label">Main</div>
            <NavLink to="/" className="sidebar-link">
              <i className="bi bi-speedometer2"></i>
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/payments" className="sidebar-link">
              <i className="bi bi-cash-stack"></i>
              <span>Payments</span>
            </NavLink>

            <NavLink to="/fund-tracker" className="sidebar-link">
              <i className="bi bi-wallet2"></i>
              <span>Fund Tracker</span>
            </NavLink>

            <NavLink to="/funeralassistance" className="sidebar-link">
              <i className="bi bi-heart-pulse"></i>
              <span>Funeral Assistance</span>
            </NavLink>

            <NavLink to="/analytics" className="sidebar-link">
              <i className="bi bi-bar-chart-line"></i>
              <span>Analytics</span>
            </NavLink>

            <div className="sidebar-section-label mt-3">Management</div>
            <NavLink to="/members" className="sidebar-link">
              <i className="bi bi-people-fill"></i>
              <span>Members</span>
            </NavLink>

            <NavLink to="/profile" className="sidebar-link">
              <i className="bi bi-person-circle"></i>
              <span>Profile</span>
            </NavLink>
          </>
        )}

        {/* ================= SUPERADMIN ONLY ================= */}
        {isSuperAdmin && (
          <>
            <hr className="text-light opacity-25 mx-3" />

            <div className="sidebar-section-label">Administration</div>

            <NavLink to="/admins" className="sidebar-link">
              <i className="bi bi-shield-lock"></i>
              <span>Admin Management</span>
            </NavLink>

            <NavLink to="/system-logs" className="sidebar-link">
              <i className="bi bi-journal-text"></i>
              <span>System Logs</span>
            </NavLink>
          </>
        )}

      </nav>

      {/* ================= LOGOUT ================= */}
      <div className="p-3 border-top border-light">
        <button
          onClick={handleLogout}
          className="btn btn-danger w-100 btn-sm"
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Logout
        </button>
      </div>

    </div>
  );
}