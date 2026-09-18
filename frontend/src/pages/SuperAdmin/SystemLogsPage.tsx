import { useEffect, useMemo, useState } from "react";
import api from "../../features/shared/api/axios";

type SystemLog = {
  id: number;
  action: string;
  performedBy: string;
  role: "admin" | "superadmin";
  timestamp: string;
  details: string;
};

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  /* ================= FILTER LOGS ================= */
  const filteredLogs = useMemo(() => {
    // Apply client-side search on top of server-side results
    return logs.filter((log) => {
      const matchSearch =
        `${log.action} ${log.performedBy} ${log.details}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchRole = filterRole ? log.role === filterRole : true;

      return matchSearch && matchRole;
    });
  }, [logs, search, filterRole]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchLogs() {
      setLoading(true);
      setError(null);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any = { page, limit };
        if (filterRole) params.role = filterRole;
        const res = await api.get("/system-logs", { params, signal: controller.signal });

        const payload = res.data;
        setTotal(payload.total || 0);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: SystemLog[] = (payload.data || []).map((r: any) => {
          const rawDescription = String(r.description || "");
          const details = rawDescription.split(" | ")[0];
          const timestamp = new Date(r.created_at).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          });

          return {
            id: r.id,
            action: r.action,
            performedBy: r.performed_by || (r.user_id ? `User#${r.user_id}` : "System"),
            role: r.role,
            timestamp,
            details,
          };
        });

        setLogs(mapped);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.name !== "CanceledError") {
          setError(err.message || "Failed to load logs");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();

    return () => controller.abort();
  }, [page, limit, filterRole]);

  return (
    <div className="container-fluid py-4 app-page app-page--superadmin">

      {/* ================= HEADER ================= */}
      <div className="card p-3 mb-3 shadow-sm app-page__hero-card">
        <span className="app-page__eyebrow"><i className="bi bi-journal-text me-2" />Audit trail</span>
        <h3 className="mb-0">System Logs</h3>
        <small className="text-muted">
          Audit trail of all system activities
        </small>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="card p-3 mb-3 shadow-sm">
        <div className="row g-2">

          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Search logs (action, user, details)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <select
              className="form-control"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearch("");
                setFilterRole("");
              }}
            >
              Reset
            </button>
          </div>

        </div>
      </div>

      {/* ================= LOG TABLE ================= */}
      {error ? (<div className="alert alert-danger">{error}</div>) : null}
      <div className="card p-3 shadow-sm">
        <div className="table-responsive" style={{ maxHeight: 500 }}>

          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Action</th>
                <th>Performed By</th>
                <th>Role</th>
                <th>Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-3">
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="fw-semibold">
                        {log.action}
                      </span>
                    </td>

                    <td>{log.performedBy}</td>

                    <td>
                      <span
                        className={`badge ${
                          log.role === "superadmin"
                            ? "bg-danger"
                            : "bg-primary"
                        }`}
                      >
                        {log.role}
                      </span>
                    </td>

                    <td className="text-muted">
                      {log.details}
                    </td>

                    <td>{log.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>

          </table>

        </div>
      </div>

      {/* ================ PAGINATION ================ */}
      <div className="d-flex align-items-center justify-content-between mt-3">
        <div>
          <small className="text-muted">Total: {total}</small>
        </div>

        <div className="btn-group" role="group">
          <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Prev
          </button>
          <button className="btn btn-sm btn-outline-secondary" disabled={loading}>
            Page {page}
          </button>
          <button className="btn btn-sm btn-outline-secondary" disabled={page * limit >= total || loading} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>

        <div>
          <select className="form-select form-select-sm" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

    </div>
  );
}