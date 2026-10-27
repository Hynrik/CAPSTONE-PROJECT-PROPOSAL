 
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

  const [search, setSearch] = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);

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

  const normalizedSearch = search.trim().toLocaleLowerCase();

  const memberRows = useMemo(() => {
    const paidByMember = new Map<number, number>();
    payments.forEach((payment) => {
      paidByMember.set(
        Number(payment.memberId),
        (paidByMember.get(Number(payment.memberId)) ?? 0) + Number(payment.amount || 0)
      );
    });

    return members.map((member) => {
      const start = member.memberSince ? new Date(member.memberSince) : null;
      const now = new Date();
      const monthsActive = start && !Number.isNaN(start.getTime())
        ? Math.max(
            0,
            (now.getFullYear() - start.getFullYear()) * 12 +
              now.getMonth() - start.getMonth() +
              1
          )
        : 0;
      const expected = monthsActive * 100;
      const paid = paidByMember.get(Number(member.id)) ?? 0;

      return {
        member,
        balance: Math.max(0, expected - paid),
      };
    });
  }, [members, payments]);

  const filteredMembers = useMemo(() => {
    const results = memberRows.filter(({ member, balance }) => {
      const matchesSearch = !normalizedSearch || [
        `${member.firstName ?? ""} ${member.lastName ?? ""}`,
        member.member_code ?? "",
      ].some((value) => value.toLocaleLowerCase().includes(normalizedSearch));

      return matchesSearch && (!pendingOnly || balance > 0);
    });

    return pendingOnly ? results.sort((a, b) => b.balance - a.balance) : results;
  }, [memberRows, normalizedSearch, pendingOnly]);

  const filteredPayments = useMemo(() => {
    if (!normalizedSearch) return payments;

    const matchingMemberIds = new Set(
      memberRows
        .filter(({ member }) =>
          [
            `${member.firstName ?? ""} ${member.lastName ?? ""}`,
            member.member_code ?? "",
          ].some((value) => value.toLocaleLowerCase().includes(normalizedSearch))
        )
        .map(({ member }) => Number(member.id))
    );

    return payments.filter((payment) => matchingMemberIds.has(Number(payment.memberId)));
  }, [payments, memberRows, normalizedSearch]);

  const recentPayments = useMemo(
    () =>
      [...filteredPayments]
        .sort(
          (a, b) =>
            new Date(b.paymentDate).getTime() -
            new Date(a.paymentDate).getTime()
        )
        .slice(0, 5),
    [filteredPayments]
  );

  const selectedMemberPayments = useMemo(
    () => selectedMemberId === null
      ? []
      : payments.filter((payment) => Number(payment.memberId) === Number(selectedMemberId)),
    [payments, selectedMemberId]
  );
  const pendingMemberCount = memberRows.filter(({ balance }) => balance > 0).length;
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

      <div className="payments-toolbar mb-4">
        <div className="payments-search">
          <i className="bi bi-search" aria-hidden="true" />
          <input
            className="form-control"
            aria-label="Search members"
            placeholder="Search by member name or code"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button
              className="payments-search-clear"
              type="button"
              aria-label="Clear member search"
              onClick={() => setSearch("")}
            >
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
          )}
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
                          No payments found for this search
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
              <div className="payments-directory-heading d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div className="payments-section-kicker">Member directory</div>
                  <h5 className="fw-bold mb-1">Members</h5>
                  <p className="text-muted small mb-0">
                    {selectedMemberId ? `Viewing ${selectedMemberLabel}` : `${memberCount} members`}
                    {pendingOnly && " · highest balance first"}
                  </p>
                </div>
                <button
                  className={`btn btn-sm ${pendingOnly ? "btn-danger" : "btn-outline-danger"}`}
                  type="button"
                  aria-pressed={pendingOnly}
                  onClick={() => setPendingOnly((current) => !current)}
                >
                  <i className="bi bi-exclamation-circle me-1" aria-hidden="true" />
                  {pendingOnly ? "Show all" : "Show pending"}
                  <span className="badge text-bg-light ms-1">{pendingMemberCount}</span>
                </button>
              </div>

              <div className="table-responsive" style={{ maxHeight: 350 }}>
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="border-0">Name</th>
                      <th className="border-0 text-end">Balance</th>
                      <th className="border-0 text-end">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center text-muted py-3">
                          {pendingOnly ? "No members have a pending balance" : "No members match your search"}
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map(({ member: m, balance }) => (
                        <tr key={m.id} className={balance > 0 ? "payments-member-pending" : ""}>
                          <td>
                            <div className="fw-semibold">{m.firstName} {m.lastName}</div>
                            <small className="text-muted">{m.member_code || "Member"}</small>
                          </td>
                          <td className={`text-end fw-semibold ${balance > 0 ? "text-danger" : "text-success"}`}>
                            ₱{balance.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        payments={selectedMemberPayments}
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