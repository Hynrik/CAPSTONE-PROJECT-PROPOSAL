/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../features/shared/api/axios";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [adminId, setAdminId] = useState<number | null>(null);
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);

  // STEP 1: LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      alert("Please enter your username.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        username,
        password
      });

      setAdminId(res.data.adminId);
      setStep(2);
    } catch (err: any) {
      alert(err.message || "Login failed. Please check your username and password.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp.trim()) {
      alert("Please enter the OTP sent to your email.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/verify-otp", { adminId, otp });

      const { token, role, permissions } = res.data;

      // SAVE AUTH DATA
      localStorage.setItem("token", token);
      localStorage.setItem("permissions", JSON.stringify(permissions));

      // OPTIONAL (if you still use it in ProtectedRoute)
      localStorage.setItem("role", role);
      

      // DEBUG (remove later)
      console.log("LOGIN ROLE:", role);

      // 🚀 ROLE-BASED REDIRECT (IMPORTANT FIX)
      if (role === "superadmin") {
        navigate("/admins", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (err: any) {
      alert(err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page d-flex vh-100">

      {/* LEFT BRAND */}
      <div className="login-brand d-none d-md-flex flex-column justify-content-center align-items-center text-white">
        <i className="bi bi-bank" style={{ fontSize: "60px" }}></i>
        <h1 className="mt-3">AIPGE System</h1>
        <p>Secure Admin Access</p>
      </div>

      {/* RIGHT FORM */}
      <div className="login-form-side d-flex justify-content-center align-items-center w-100">

        <div className="card login-card shadow p-4">

          <h4 className="text-center mb-3">
            <i className="bi bi-shield-lock me-2"></i>
            Admin Login
          </h4>

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleLogin}>

              <div className="mb-3">
                <label>Username</label>
                <input
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button className="btn btn-success w-100" disabled={loading}>
                {loading ? "Sending OTP..." : "Login"}
              </button>

            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>

              <p className="text-muted text-center">
                Enter OTP sent to your account
              </p>

              <div className="mb-3">
                <label>OTP Code</label>
                <input
                  className="form-control text-center"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>

              <button className="btn btn-success w-100" disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                className="btn btn-link w-100 mt-2"
                onClick={() => setStep(1)}
              >
                Back
              </button>

            </form>
            
          )}
          

        </div>
      </div>
    </div>
  );
}