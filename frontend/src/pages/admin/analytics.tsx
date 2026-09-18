import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import api from "../../features/shared/api/axios";

export default function Analytics() {
  const weeklyRef = useRef<HTMLCanvasElement | null>(null);
  const statusRef = useRef<HTMLCanvasElement | null>(null);

  const [trendLabels, setTrendLabels] = useState<string[]>([]);
  const [trendData, setTrendData] = useState<number[]>([]);
  const [memberStats, setMemberStats] = useState({ active: 0, inactive: 0, pending: 0 });
  const [totals, setTotals] = useState({ totalPayments: 0, totalMembers: 0, activeMembers: 0, pendingBalance: 0 });
  const [paymentCount, setPaymentCount] = useState(0);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [totRes, trendRes, memberRes, paymentsRes] = await Promise.all([
          api.get("/analytics/totals"),
          api.get("/analytics/payments-trend?period=monthly"),
          api.get("/analytics/member-stats"),
          api.get("/payments"),
        ]);

        setTotals({
          totalPayments: totRes.data.totalPayments || 0,
          totalMembers: totRes.data.totalMembers || 0,
          activeMembers: totRes.data.activeMembers || 0,
          pendingBalance: totRes.data.pendingBalance || 0,
        });

        setTrendLabels(trendRes.data.labels || []);
        setTrendData(trendRes.data.data || []);

        setMemberStats({
          active: memberRes.data.active || 0,
          inactive: memberRes.data.inactive || 0,
          pending: memberRes.data.pending || 0,
        });

        setPaymentCount(paymentsRes.data?.count || 0);
      } catch (err) {
        console.error("Failed to load analytics", err);
      }
    }

    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (!weeklyRef.current || !statusRef.current) return;

    Chart.getChart(weeklyRef.current)?.destroy();
    Chart.getChart(statusRef.current)?.destroy();

    // Weekly Payments Chart
    new Chart(weeklyRef.current, {
      type: "line",
      data: {
        labels: trendLabels.length ? trendLabels : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "Payments",
            data: trendData.length ? trendData : [300, 800, 1200, 900, 1500, 700, 2000],
            borderColor: "#198754",
            backgroundColor: "rgba(25,135,84,0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: "#eee" } },
        },
      },
    });

    // Status Chart
    new Chart(statusRef.current, {
      type: "doughnut",
      data: {
        labels: ["Active", "Inactive", "Pending"],
        datasets: [
          {
            data: [memberStats.active, memberStats.inactive, memberStats.pending],
            backgroundColor: ["#198754", "#6c757d", "#ffc107"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: "bottom",
          },
        },
        cutout: "65%",
      },
    });
  }, [trendLabels, trendData, memberStats]);

  const totalRevenue = totals.totalPayments || 0;
  const activeMembers = totals.activeMembers || 0;
  const pendingBalance = totals.pendingBalance || 0;

  return (
    <div className="app-page app-page--analytics analytics-page">

      {/* HEADER */}
      <div className="analytics-page__header mb-4">
        <div>
        <span className="app-page__eyebrow"><i className="bi bi-graph-up-arrow me-2" />Decision support</span>
        <h3 className="fw-bold mb-2">Analytics Overview</h3>
        <p className="text-muted mb-0">A focused view of collections, membership health, and outstanding balances.</p>
        </div>
        <div className="analytics-period"><i className="bi bi-calendar3 me-2" />Monthly view</div>
      </div>

      {/* STATS CARDS */}
      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <div className="card p-3 border-0 shadow-sm analytics-stat analytics-stat--revenue">
            <div className="analytics-stat__top"><h6>Total Revenue</h6><span><i className="bi bi-wallet2" /></span></div>
            <h4>₱{totalRevenue.toLocaleString()}</h4>
            <small>Collected across all payments</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 border-0 shadow-sm analytics-stat analytics-stat--payments">
            <div className="analytics-stat__top"><h6>Payments</h6><span><i className="bi bi-receipt" /></span></div>
            <h4>{paymentCount}</h4>
            <small>Recorded transactions</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 border-0 shadow-sm analytics-stat analytics-stat--members">
            <div className="analytics-stat__top"><h6>Active Members</h6><span><i className="bi bi-person-check" /></span></div>
            <h4>{activeMembers}</h4>
            <small>Currently active accounts</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 border-0 shadow-sm analytics-stat analytics-stat--pending">
            <div className="analytics-stat__top"><h6>Pending Balance</h6><span><i className="bi bi-hourglass-split" /></span></div>
            <h4>₱{pendingBalance.toLocaleString()}</h4>
            <small>Requires follow-up</small>
          </div>
        </div>

      </div>

      {/* CHART SECTION */}
      <div className="row g-3">

        {/* LINE CHART */}
        <div className="col-md-8">
          <div className="card p-3 border-0 shadow-sm analytics-chart-card">
            <div className="analytics-chart-header">
              <div><span className="analytics-section-kicker">Collection movement</span><h5 className="mb-0">Weekly Payments</h5></div>
              <span className="analytics-chart-note">Last 7 days</span>
            </div>

            <canvas ref={weeklyRef}></canvas>
          </div>
        </div>

        {/* DONUT CHART */}
        <div className="col-md-4">
          <div className="card p-3 border-0 shadow-sm analytics-chart-card analytics-status-card">
            <div className="analytics-chart-header"><div><span className="analytics-section-kicker">Membership health</span><h5 className="mb-0">Member Status</h5></div><i className="bi bi-people analytics-header-icon" /></div>
            <canvas ref={statusRef}></canvas>
            <div className="analytics-status-list">
              <div><span className="analytics-status-dot analytics-status-dot--active" />Active <strong>{memberStats.active}</strong></div>
              <div><span className="analytics-status-dot analytics-status-dot--inactive" />Inactive <strong>{memberStats.inactive}</strong></div>
              <div><span className="analytics-status-dot analytics-status-dot--pending" />Pending <strong>{memberStats.pending}</strong></div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}