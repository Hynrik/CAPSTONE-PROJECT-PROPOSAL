import { useEffect, useState } from "react";
import StatCard from "../../features/app/layout/StatCard";
import WeeklyChart from "../../features/dashboard/components/Charts/WeeklyChart";
import StatusChart from "../../features/dashboard/components/Charts/StatusChart";
import api from "../../features/shared/api/axios";
import { useNavigate } from "react-router-dom";

type RecentPayment = {
  id: number;
  first_name?: string;
  last_name?: string;
  member_code?: string;
  description?: string;
  amount?: number | string;
};

export default function Dashboard() {
  const [totals, setTotals] = useState({
    totalMembers: "-",
    totalPayments: "-",
    activeMembers: "-",
    pendingBalance: "-",
  });

  const [paymentsTrend, setPaymentsTrend] = useState<{ labels: string[]; data: number[] } | null>(null);
  const [memberStats, setMemberStats] = useState<number[] | undefined>(undefined);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const totalsRes = await api.get("/analytics/totals");
        const paymentsRes = await api.get("/analytics/payments-trend?period=monthly");
        const memberRes = await api.get("/analytics/member-stats");

        const t = totalsRes.data;
        setTotals({
          totalMembers: String(t.totalMembers ?? "-"),
          totalPayments: t.totalPayments ? `₱${t.totalPayments.toLocaleString()}` : "-",
          activeMembers: String(t.activeMembers ?? "-"),
          pendingBalance: t.pendingBalance ? `₱${t.pendingBalance.toLocaleString()}` : "-",
        });

        setPaymentsTrend({ labels: paymentsRes.data.labels || [], data: paymentsRes.data.data || [] });
        setMemberStats([memberRes.data.active || 0, memberRes.data.inactive || 0, memberRes.data.pending || 0]);

        // fetch recent payments (latest 5)
        try {
          const paymentsRes = await api.get("/payments");
          if (paymentsRes.data && paymentsRes.data.success) {
            setRecentPayments((paymentsRes.data.data || []).slice(0, 5));
          }
        } catch (pErr) {
          console.warn("Failed to load recent payments", pErr);
        }
      } catch (err) {
        console.error("Failed to load analytics", err);
      }
    }

    fetchAnalytics();
  }, []);

  return (
    <div className="dashboard-container app-page app-page--dashboard">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <span className="app-page__eyebrow"><i className="bi bi-grid-1x2 me-2" />Cooperative overview</span>
          <h1 className="page-title">Dashboard Overview</h1>
          <span className="page-subtitle">Welcome to your AIPGE Cooperative System dashboard.</span>
        </div>

        <button className="btn btn-primary btn-lg px-4">
          <i className="bi bi-plus-circle me-2"></i>
          Quick Action
        </button>
      </div>

      <div className="row g-4 mb-5">
        <StatCard title="Total Members" value={totals.totalMembers} icon="bi-people" color="success" />
        <StatCard title="Total Payments" value={totals.totalPayments} icon="bi-cash-stack" color="primary" />
        <StatCard title="Active Members" value={totals.activeMembers} icon="bi-person-check" color="info" />
        <StatCard title="Pending Balance" value={totals.pendingBalance} icon="bi-exclamation-circle" color="warning" />
      </div>

      <div className="row g-4 mb-5">
        <div className="col-xl-4 col-lg-6">
          <div className="chart-card card h-100">
            <div className="card-body p-4">
              <h5 className="mb-4">Monthly Collection Trend</h5>
              <WeeklyChart labels={paymentsTrend?.labels} data={paymentsTrend?.data} />
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-lg-6">
          <div className="chart-card card h-100">
            <div className="card-body p-4">
              <h5 className="mb-4">Member Status</h5>
              <StatusChart counts={memberStats} />
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-lg-12">
          <div className="card h-100">
            <div className="card-body p-4">
              <h5 className="mb-4">Quick Insights</h5>
              <div className="insight-item">
                <i className="bi bi-check-circle-fill text-success fs-5"></i>
                <div>
                  <strong>Most active month</strong>
                  <div className="text-muted">April</div>
                </div>
              </div>
              <div className="insight-item">
                <i className="bi bi-trophy-fill text-warning fs-5"></i>
                <div>
                  <strong>Top payer</strong>
                  <div className="text-muted">Maria Santos</div>
                </div>
              </div>
              <div className="insight-item">
                <i className="bi bi-graph-up-arrow text-info fs-5"></i>
                <div>
                  <strong>Pending growth</strong>
                  <div className="text-muted">+5% relative to last month</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-6">
          <div className="card h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">Recent Payments</h5>
                <span className="badge bg-success">Latest</span>
              </div>
              <div className="list-group list-group-flush">
                {recentPayments.length === 0 && (
                  <div className="text-muted">No payments yet</div>
                )}

                {recentPayments.map((p) => {
                  const name = p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : p.member_code || "Member";
                  const initials = name.split(" ").map((s: string) => s[0]).slice(0,2).join("");
                  return (
                    <div key={p.id} className="list-group-item px-0 border-0 py-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-3">
                        <div className={`avatar-circle bg-success text-white`}>{initials}</div>
                        <div>
                          <div className="fw-semibold">{name}</div>
                          <small className="text-muted">{p.description || "Payment received"}</small>
                        </div>
                      </div>
                      <strong className="text-success">₱{Number(p.amount).toLocaleString()}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-6">
          <div className="card h-100">
            <div className="card-body p-4">
              <h5 className="mb-4">Quick Actions</h5>
              <div className="d-grid gap-3">
                <button className="btn btn-success btn-lg" onClick={() => navigate('/members')}>
                  <i className="bi bi-person-plus me-2"></i>
                  Add Member
                </button>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/payments')}>
                  <i className="bi bi-cash-coin me-2"></i>
                  Add Payment
                </button>
                <button className="btn btn-dark btn-lg" onClick={() => navigate('/analytics')}>
                  <i className="bi bi-bar-chart-line me-2"></i>
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}