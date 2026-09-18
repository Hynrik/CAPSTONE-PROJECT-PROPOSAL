 
 import { useCallback, useMemo, useState } from "react";
import AddPaymentModal from "../../features/payments/components/modals/AddPaymentModal";
import ViewPaymentsModal from "../../features/payments/components/modals/ViewPaymentsModal";
import type { PaymentForm, Payment, PaymentTotals } from "../../features/shared/types";

import { usePayments } from "../../features/payments/hooks/usePayments";
import { useMembers } from "../../features/members/hooks/useMembers";
import { usePermissions } from "../../features/shared/api/hooks/usePermissions";


export default function Payments() {
  const {
    payments = [],
    loading,
    error,
    addPayment,
    editPayment,
    removePayment,
  } = usePayments();

  const { members = [] } = useMembers();

  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);

  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  /* ================= SEARCH ================= */
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  /* ================= RBAC ================= */
  const permissions = usePermissions();

  const canCreate = permissions.includes("payments.create");
  const canUpdate = permissions.includes("payments.update");
  const canDelete = permissions.includes("payments.delete");

  /* ================= SAVE ================= */
  const handleSave = async (data: PaymentForm) => {
    try {
      await addPayment(data);
      setShowAdd(false);
    } catch (err) {
      console.error("Add payment failed:", err);
    }
  };

  /* ================= MEMBER NAME ================= */
  const getMemberName = useCallback(
    (id: number) => {
      const m = members.find((x) => Number(x.id) === Number(id));
      return m
        ? `${m.firstName ?? ""} ${m.lastName ?? ""}`.trim()
        : `Member #${id}`;
    },
    [members]
  );

  /* ================= FILTER MEMBERS ================= */
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (!search.trim()) return true;

      const fullName = `${m.firstName ?? ""} ${m.lastName ?? ""}`.toLowerCase();
      return fullName.includes(search.toLowerCase());
    });
  }, [members, search]);

  /* ================= FILTER PAYMENTS ================= */
  const filteredPayments = useMemo(() => {
    const memberIds = new Set(filteredMembers.map((m) => m.id));

    return payments.filter((p: Payment) => {
      const matchMember = memberIds.has(p.memberId);

      const matchSelected =
        selectedMemberId ? p.memberId === selectedMemberId : true;

      return matchMember && matchSelected;
    });
  }, [payments, filteredMembers, selectedMemberId]);

  /* ================= RECENT PAYMENTS ================= */
  const recentPayments = useMemo(() => {
    return [...filteredPayments]
      .filter((p) => {
        if (!p.paymentDate) return false;
        if (!monthFilter) return true;
        return p.paymentDate.startsWith(monthFilter);
      })
      .sort(
        (a, b) =>
          new Date(b.paymentDate).getTime() -
          new Date(a.paymentDate).getTime()
      )
      .slice(0, 5);
  }, [filteredPayments, monthFilter]);

  const memberCount = filteredMembers.length;
  const paymentCount = filteredPayments.length;
  const selectedMemberLabel = selectedMemberId ? getMemberName(selectedMemberId) : "All members";

  /* ================= TOTALS ================= */
  const totals = useMemo(() => {
    return filteredPayments.reduce(
      (acc: PaymentTotals, p) => {
        acc.total += Number(p.amount || 0);
        acc.retirement += Number(p.retirement || 0);
        acc.benefits += Number(p.benefits || 0);
        acc.admin += Number(p.admin || 0);
        return acc;
      },
      {
        total: 0,
        retirement: 0,
        benefits: 0,
        admin: 0,
      }
    );
  }, [filteredPayments]);

  return (
    <div className="container-fluid py-4 px-2 px-lg-3 payments-page">
      <div className="payments-hero mb-4">
        <div>
          <span className="payments-eyebrow"><i className="bi bi-receipt-cutoff me-2" />Cooperative treasury</span>
          <h2 className="fw-bold mb-2">Member Payments</h2>
          <p className="mb-0">Track collections, fund allocations, and member payment history in one place.</p>
        </div>

        {canCreate && (
          <button className="btn btn-success px-4 py-2 payments-action" onClick={() => setShowAdd(true)}>
            <i className="bi bi-plus-lg me-2" />Add Payment
          </button>
        )}
      </div>

      {loading && <div className="alert alert-info payments-alert">Loading payments...</div>}
      {error && <div className="alert alert-danger payments-alert">{error}</div>}

      <div className="card border-0 shadow-sm mb-4 payments-filter-panel">
        <div className="card-body p-3 p-lg-4">
          <div className="row g-3 align-items-end">
            <div className="col-lg-7">
              <label className="form-label payments-filter-label"><i className="bi bi-search me-2" />Search member</label>
              <div className="payments-input-wrap"><i className="bi bi-person-search" /><input className="form-control" placeholder="Search by member name" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            </div>

            <div className="col-lg-5">
              <label className="form-label payments-filter-label"><i className="bi bi-calendar3 me-2" />Payment month</label>
              <input type="month" className="form-control" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4 payments-stat-grid">
        <Stat title="Total collected" value={totals.total} accentClass="payments-stat--total" icon="bi-wallet2" />
        <Stat title="Retirement fund" value={totals.retirement} accentClass="payments-stat--retirement" icon="bi-piggy-bank" />
        <Stat title="Benefits fund" value={totals.benefits} accentClass="payments-stat--benefits" icon="bi-heart-pulse" />
        <Stat title="Admin fund" value={totals.admin} accentClass="payments-stat--admin" icon="bi-building" />
      </div>

      <div className="payments-workspace row g-4">
        <div className="col-xl-8">
          <div className="card border-0 shadow-sm h-100 payments-panel">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div className="payments-section-kicker">Collection activity</div>
                  <h5 className="fw-bold mb-1">Recent Payments</h5>
                  <p className="text-muted small mb-0">Latest activity for the current selection</p>
                </div>
                <span className="payments-count">{paymentCount} entries</span>
              </div>

              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="border-0">Member</th>
                      <th className="border-0 text-end">Amount</th>
                      <th className="border-0">Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentPayments.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-3">
                          No payments yet
                        </td>
                      </tr>
                    ) : (
                      recentPayments.map((p: Payment) => (
                        <tr key={p.id}>
                          <td><span className="payments-member-mark">{getMemberName(p.memberId).slice(0, 1).toUpperCase()}</span><span className="fw-semibold">{getMemberName(p.memberId)}</span></td>
                          <td className="text-end fw-bold">₱{Number(p.amount).toFixed(2)}</td>
                          <td>
                            {p.paymentDate
                              ? new Date(p.paymentDate).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div className="card border-0 shadow-sm h-100 payments-panel">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div className="payments-section-kicker">Member directory</div>
                  <h5 className="fw-bold mb-1">Members</h5>
                  <p className="text-muted small mb-0">{selectedMemberId ? `Viewing ${selectedMemberLabel}` : `Showing ${memberCount} members`}</p>
                </div>
              </div>

              <div className="table-responsive" style={{ maxHeight: 350 }}>
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="border-0">Name</th>
                      <th className="border-0">Status</th>
                      <th className="border-0" style={{ width: 160 }}>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-3">
                          No members found
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((m) => (
                        <tr key={m.id}>
                          <td className="fw-semibold">{m.firstName} {m.lastName}</td>
                          <td>
                            <span className={`badge rounded-pill ${m.status === "deceased" ? "bg-danger-subtle text-danger-emphasis" : "bg-success-subtle text-success-emphasis"}`}>
                              {m.status || "Active"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm payments-view-button"
                              onClick={() => {
                                setSelectedMemberId(m.id);
                                setShowView(true);
                              }}
                            >
                              View Payments
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddPaymentModal
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onSave={handleSave}
      />

      <ViewPaymentsModal
        show={showView}
        onClose={() => setShowView(false)}
        payments={filteredPayments}
        memberName={selectedMemberId ? getMemberName(selectedMemberId) : ""}
        membershipStartDate={
          selectedMemberId
            ? members.find((m) => Number(m.id) === Number(selectedMemberId))?.memberSince ?? ""
            : ""
        }
        onUpdate={(data: PaymentForm & { id: number }) => canUpdate && editPayment({ id: data.id, data })}
        onDelete={(id: number) => canDelete && removePayment(id)}
      />
    </div>
  );
}

/* ================= STAT CARD ================= */
function Stat({ title, value, accentClass, icon }: { title: string; value: number; accentClass: string; icon: string }) {
  return (
    <div className="col-md-3">
      <div className={`card p-3 border-0 shadow-sm payments-stat ${accentClass}`}>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <small className="payments-stat__label d-block mb-2">{title}</small>
            <h4 className="mb-0 fw-bold">₱{value.toFixed(2)}</h4>
          </div>
          <div className="payments-stat__icon">
            <i className={`bi ${icon}`} />
          </div>
        </div>
      </div>
    </div>
  );
}