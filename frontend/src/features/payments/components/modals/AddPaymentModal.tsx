import { useMemo, useState } from "react";
import Modal from "../../../shared/ui/Modal";
import type { PaymentForm } from "../../../shared/types";
import { useMembers } from "../../../members/hooks/useMembers";

const splitAmount = (amount: number) => ({
  retirement: amount * 0.4,
  benefits: amount * 0.3,
  admin: amount * 0.3,
});

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: (data: PaymentForm) => void;
}

export default function AddPaymentModal({
  show,
  onClose,
  onSave,
}: Props) {
  const { members, loading } = useMembers();

  /* ================= RBAC ================= */
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
  const canCreate = permissions.includes("payments.create");

  const [form, setForm] = useState<PaymentForm>({
    memberId: 0,
    amount: 0,
    paymentDate: "",
    description: "",
  });

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");

  /* ================= FILTER ================= */
  const filteredMembers = useMemo(() => {
    return members.filter((m) =>
      `${m.firstName} ${m.lastName}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [members, query]);

  const selectMember = (id: number, name: string) => {
    setForm((prev) => ({ ...prev, memberId: id }));
    setSelectedName(name);
    setQuery(name);
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  const handleSubmit = () => {
    if (!canCreate) {
      alert("You don't have permission to create payments");
      return;
    }

    if (!form.memberId || !form.paymentDate || !form.amount) {
      alert("Please complete all fields");
      return;
    }

    onSave({
      memberId: form.memberId,
      amount: form.amount,
      paymentDate: form.paymentDate,
      description: form.description,
    });

    setForm({
      memberId: 0,
      amount: 0,
      paymentDate: "",
      description: "",
    });

    setQuery("");
    setSelectedName("");
    onClose();
  };

  /* ================= BLOCK UI IF NO PERMISSION ================= */
  if (!canCreate && show) {
    return (
      <Modal show={show} title="Access Denied" onClose={onClose}>
        <div className="alert alert-danger">
          You do not have permission to create payments.
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      show={show}
      title="Add Payment"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={!canCreate}
          >
            Save Payment
          </button>
        </>
      }
    >
      <div className="row g-3">

        {/* MEMBER */}
        <div className="col-12 position-relative">
          <label className="form-label">Member</label>

          <input
            className="form-control"
            placeholder="Search member..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />

          {open && (
            <div
              className="border rounded bg-white position-absolute w-100 shadow"
              style={{ maxHeight: 200, overflowY: "auto", zIndex: 10 }}
            >
              {loading ? (
                <div className="p-2 text-muted">Loading...</div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-2 text-muted">No members found</div>
              ) : (
                filteredMembers.map((m) => {
                  const name = `${m.firstName} ${m.lastName}`;

                  return (
                    <div
                      key={m.id}
                      className="p-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => selectMember(m.id, name)}
                    >
                      {name}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {selectedName && (
            <small className="text-success">
              Selected: {selectedName}
            </small>
          )}
        </div>

        {/* DATE */}
        <div className="col-12">
          <label className="form-label">Payment Date</label>
          <input
            type="date"
            name="paymentDate"
            className="form-control"
            value={form.paymentDate}
            onChange={handleChange}
          />
        </div>

        {/* AMOUNT */}
        <div className="col-12">
          <label className="form-label">Amount</label>
          <input
            type="number"
            name="amount"
            className="form-control"
            value={form.amount}
            onChange={handleChange}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="col-12">
          <label className="form-label">Description</label>
          <input
            type="text"
            name="description"
            className="form-control"
            value={form.description || ""}
            onChange={handleChange}
          />
        </div>

        {/* PREVIEW */}
        <div className="col-12">
          <div className="alert alert-info">
            <strong>Auto Breakdown Preview</strong>

            {form.amount > 0 && (
              <ul className="mb-0 mt-2">
                <li>Retirement: ₱{splitAmount(form.amount).retirement.toFixed(2)}</li>
                <li>Benefits: ₱{splitAmount(form.amount).benefits.toFixed(2)}</li>
                <li>Admin: ₱{splitAmount(form.amount).admin.toFixed(2)}</li>
              </ul>
            )}
          </div>
        </div>

      </div>
    </Modal>
  );
}