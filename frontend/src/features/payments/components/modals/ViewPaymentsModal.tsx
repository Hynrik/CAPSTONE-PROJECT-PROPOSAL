/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import Modal from "../../../shared/ui/Modal";
import { usePermissions } from "../../../shared/api/hooks/usePermissions";

interface Payment {
  id: number;
  memberId: number;
  amount: number;
  retirement: number;
  benefits: number;
  admin: number;
  paymentDate: string;
}

interface Props {
  show: boolean;
  onClose: () => void;
  payments: Payment[];
  memberName: string;

  /* NEW */
  membershipStartDate: string;

  onUpdate: (updated: Payment) => void;
  onDelete: (id: number) => void;
}

export default function ViewPaymentsModal({
  show,
  onClose,
  payments,
  memberName,
  membershipStartDate,
  onUpdate,
  onDelete,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Payment | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  /* ================= RBAC ================= */
  const permissions = usePermissions();

  const canEdit = permissions.includes("payments.update");
  const canDelete = permissions.includes("payments.delete");

  /* ================= EDIT ================= */
  const startEdit = (p: Payment) => {
    setEditingId(p.id);
    setForm({ ...p });
  };

  const handleChange = (field: keyof Payment, value: any) => {
    if (!form) return;

    setForm({
      ...form,
      [field]:
        field === "paymentDate"
          ? value
          : Number(value),
    });
  };

  const saveEdit = () => {
    if (!form) return;

    onUpdate(form);
    setEditingId(null);
    setForm(null);
  };

  /* ================= DELETE ================= */
  const confirmDelete = (id: number) => {
    setConfirmDeleteId(id);
  };

  const executeDelete = () => {
    if (confirmDeleteId === null) return;

    onDelete(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  /* ================= SEARCH FILTER ================= */
  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return payments;

    return payments.filter((p) => {
      return (
        String(p.amount).includes(q) ||
        p.paymentDate.toLowerCase().includes(q)
      );
    });
  }, [payments, search]);

  /* ================= TOTALS ================= */
  const totals = useMemo(() => {
    return filteredPayments.reduce(
      (acc, p) => {
        acc.amount += Number(p.amount || 0);
        acc.retirement += Number(p.retirement || 0);
        acc.benefits += Number(p.benefits || 0);
        acc.admin += Number(p.admin || 0);

        return acc;
      },
      {
        amount: 0,
        retirement: 0,
        benefits: 0,
        admin: 0,
      }
    );
  }, [filteredPayments]);

  /* ================= MEMBER BALANCE ================= */
const calculateMonthsActive = (startDate?: string) => {
  if (!startDate) return 0;

  const start = new Date(startDate);
  const today = new Date();

  let months =
    (today.getFullYear() - start.getFullYear()) * 12 +
    (today.getMonth() - start.getMonth()) +
    1;

  if (months < 0) months = 0;

  return months;
};

const memberBalanceData = useMemo(() => {
  const MONTHLY_CONTRIBUTION = 100;

  const monthsActive =
    calculateMonthsActive(membershipStartDate);

  const expectedTotal =
    monthsActive * MONTHLY_CONTRIBUTION;

  const paidTotal = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const balance = expectedTotal - paidTotal;

  return {
    monthsActive,
    expectedTotal,
    paidTotal,
    balance,
  };
}, [membershipStartDate, payments]);

  const formatCurrency = (v: number) =>
    `₱${v.toLocaleString()}`;

  return (
    <Modal
      show={show}
      onClose={onClose}
      title={`Payments - ${memberName}`}
      size="wide"
    >
      {/* ================= SUMMARY CARDS ================= */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="border rounded p-3 bg-light h-100">
            <div className="text-muted small mb-1">
              Total Membership Months 
            </div>

            <div className="fs-4 fw-bold">
              {memberBalanceData.monthsActive}
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="border rounded p-3 bg-light h-100">
            <div className="text-muted small mb-1">
              Expected Total
            </div>

            <div className="fs-4 fw-bold">
              {formatCurrency(
                memberBalanceData.expectedTotal
              )}
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="border rounded p-3 bg-light h-100">
            <div className="text-muted small mb-1">
              Total Paid
            </div>

            <div className="fs-4 fw-bold text-success">
              {formatCurrency(
                memberBalanceData.paidTotal
              )}
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className={`border rounded p-3 h-100 ${
              memberBalanceData.balance > 0
                ? "bg-danger-subtle border-danger"
                : "bg-success-subtle border-success"
            }`}
          >
            <div className="text-muted small mb-1">
              Member Balance
            </div>

            <div
              className={`fs-4 fw-bold ${
                memberBalanceData.balance > 0
                  ? "text-danger"
                  : "text-success"
              }`}
            >
              {formatCurrency(
                memberBalanceData.balance
              )}
            </div>

            <div className="small text-muted">
              ₱100 monthly contribution
            </div>
          </div>
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="d-flex gap-3 mb-3 flex-column flex-sm-row align-items-center">
        <div style={{ flex: 1 }}>
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Search payments by amount or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="badge bg-secondary text-white py-2 px-3">
            {filteredPayments.length} Payments
          </div>

          <div className="text-muted small d-none d-sm-block">
            Showing{" "}
            <strong>{filteredPayments.length}</strong> of{" "}
            <strong>{payments.length}</strong>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div style={{ maxHeight: 480, overflowY: "auto" }}>
        {filteredPayments.length === 0 ? (
          <div className="text-center text-muted py-5">
            No payments match your search.
          </div>
        ) : (
          <table className="table table-striped table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="fw-semibold">Amount</th>
                <th className="fw-semibold">Retirement</th>
                <th className="fw-semibold">Benefits</th>
                <th className="fw-semibold">Admin</th>
                <th className="fw-semibold">Date</th>
                <th style={{ width: 140 }}></th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((p) => (
                <tr
                  key={p.id}
                  className={
                    p.id === editingId
                      ? "table-active"
                      : ""
                  }
                >
                  {editingId === p.id ? (
                    <>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={form?.amount}
                          onChange={(e) =>
                            handleChange(
                              "amount",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={form?.retirement}
                          onChange={(e) =>
                            handleChange(
                              "retirement",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={form?.benefits}
                          onChange={(e) =>
                            handleChange(
                              "benefits",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={form?.admin}
                          onChange={(e) =>
                            handleChange(
                              "admin",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={form?.paymentDate}
                          onChange={(e) =>
                            handleChange(
                              "paymentDate",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td className="text-end">
                        <button
                          className="btn btn-success btn-sm me-1"
                          onClick={saveEdit}
                        >
                          <i className="bi bi-check-lg me-1" />
                          Save
                        </button>

                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => {
                            setEditingId(null);
                            setForm(null);
                          }}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="fw-semibold">
                        {formatCurrency(p.amount)}
                      </td>

                      <td>
                        {formatCurrency(p.retirement)}
                      </td>

                      <td>
                        {formatCurrency(p.benefits)}
                      </td>

                      <td>
                        {formatCurrency(p.admin)}
                      </td>

                      <td className="text-muted">
                        {p.paymentDate}
                      </td>

                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          {canEdit && (
                            <button
                              title="Edit payment"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => startEdit(p)}
                            >
                              <i className="bi bi-pencil" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              title="Delete payment"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() =>
                                confirmDelete(p.id)
                              }
                            >
                              <i className="bi bi-trash" />
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>

            {/* ================= FOOTER TOTALS ================= */}
            <tfoot className="table-light">
              <tr>
                <th>
                  {formatCurrency(totals.amount)}
                </th>

                <th>
                  {formatCurrency(totals.retirement)}
                </th>

                <th>
                  {formatCurrency(totals.benefits)}
                </th>

                <th>
                  {formatCurrency(totals.admin)}
                </th>

                <th colSpan={2}>
                  Total Summary
                </th>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* ================= DELETE CONFIRMATION ================= */}
      {confirmDeleteId !== null && (
        <div className="mt-3 p-3 border rounded bg-light">
          <p className="mb-2">
            Are you sure you want to delete this
            payment?
          </p>

          <button
            className="btn btn-danger btn-sm me-2"
            onClick={executeDelete}
          >
            Yes, Delete
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              setConfirmDeleteId(null)
            }
          >
            Cancel
          </button>
        </div>
      )}
    </Modal>
  );
}