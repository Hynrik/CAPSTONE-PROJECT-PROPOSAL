import type { Member, Payment, PaymentStatus } from "../../types/funeral";

type Props = {
  show: boolean;
  selectedMonth: string | null;
  paymentMonth: string | null;
  onClose: () => void;

  modalMembers: Member[];
  payments: Payment[];
  activeMembers?: number;
  projectedFund?: number;
  deaths?: number;

  memberSearch: string;
  setMemberSearch: (v: string) => void;

  markAsPaid: (id: number, month: string) => void;
  createContributionAndMarkPaid: (
    id: number,
    month: string,
    amount?: number
  ) => void;
};

export default function MonthModal({
  show,
  selectedMonth,
  paymentMonth,
  onClose,
  payments,
  modalMembers,
  activeMembers = 0,
  projectedFund = 0,
  deaths = 0,
  memberSearch,
  setMemberSearch,
  markAsPaid,
  createContributionAndMarkPaid,
}: Props) {
  if (!show || !selectedMonth || !paymentMonth) return null;

  /* ================= FAST LOOKUP ================= */
  const paymentMap = new Map<string, PaymentStatus>();

  payments.forEach((p) => {
    if (p.month === paymentMonth) {
      paymentMap.set(String(p.memberId), p.status);
    }
  });

  const getFullName = (m: Member) =>
    `${m.first_name} ${m.last_name}`;

  const formatCurrency = (value: number) =>
    `₱${(value ?? 0).toLocaleString()}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div className="card shadow-lg w-100 assistance-ledger-modal">

        {/* HEADER */}
        <div className="assistance-ledger-modal__header text-white p-3 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">Monthly Ledger</h5>
            <small>
              Death month: {selectedMonth} • Contribution month: {paymentMonth}
            </small>
          </div>

          <button className="btn btn-light btn-sm" onClick={onClose}>
            <i className="bi bi-x-lg me-1" />Close
          </button>
        </div>

        {/* BODY */}
        <div className="p-3">
          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <div className="assistance-ledger-stat border rounded-3 p-3">
                <small className="text-muted">Deaths</small>
                <div className="fw-bold">{deaths}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="assistance-ledger-stat border rounded-3 p-3">
                <small className="text-muted">Active Members</small>
                <div className="fw-bold">{activeMembers}</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="assistance-ledger-stat border rounded-3 p-3">
                <small className="text-muted">Projected Fund</small>
                <div className="fw-bold text-primary">{formatCurrency(projectedFund)}</div>
              </div>
            </div>
          </div>

          <small className="text-muted">Review and manage member contributions for this month.</small>

          {/* SEARCH */}
          <div className="assistance-search mb-3"><i className="bi bi-search" /><input
            className="form-control"
            placeholder="Search member..."
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
          /></div>

          {/* TABLE */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Status</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>

              <tbody>
                {modalMembers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">
                      No members found
                    </td>
                  </tr>
                ) : (
                  modalMembers.map((m) => {
                    const status = paymentMap.get(String(m.id));

                    return (
                      <tr key={m.id}>
                        <td>{getFullName(m)}</td>

                        <td>
                          {status === "Paid" ? (
                            <span className="badge bg-success">Paid</span>
                          ) : status === "Unpaid" ? (
                            <span className="badge bg-warning text-dark">
                              Unpaid
                            </span>
                          ) : (
                            <span className="badge bg-secondary text-white">
                              No contribution
                            </span>
                          )}
                        </td>

                        <td className="text-end">
                          {status === "Paid" ? (
                            <span className="text-success">Done</span>
                          ) : status === "Unpaid" ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                markAsPaid(m.id, paymentMonth)
                              }
                            >
                              Mark Paid
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() =>
                                createContributionAndMarkPaid(
                                  m.id,
                                  paymentMonth,
                                  20
                                )
                              }
                            >
                              Set Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}