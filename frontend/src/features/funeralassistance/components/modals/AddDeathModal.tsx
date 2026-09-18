import type { Member } from "../../types/funeral";

type Props = {
  show: boolean;
  onClose: () => void;
  onSave: () => void;

  form: {
    memberId: string;
    dateOfDeath: string;
  };

  setForm: (data: {
    memberId: string;
    dateOfDeath: string;
  }) => void;

  members: Member[];
};

export default function EventModal({
  show,
  onClose,
  onSave,
  form,
  setForm,
  members,
}: Props) {
  if (!show) return null;

  /* ================= FULL NAME ================= */
  const getFullName = (m: Member) =>
    `${m.first_name} ${m.middle_name ?? ""} ${m.last_name}`
      .replace(/\s+/g, " ")
      .trim();

  const availableMembers = members.filter(
    (m) => String(m.status ?? "").toLowerCase() !== "deceased"
  );

  return (
    <div className="modal d-block assistance-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content p-3">

          <div className="d-flex align-items-start justify-content-between mb-3"><div><span className="assistance-section-kicker">Assistance release</span><h5 className="mb-0">Add Death Event</h5></div><button type="button" className="btn-close" aria-label="Close" onClick={onClose} /></div>

          {/* MEMBER SELECT */}
          <label className="form-label">Member</label>
          <select
            className="form-select mb-3"
            value={form.memberId}
            onChange={(e) =>
              setForm({
                ...form,
                memberId: e.target.value,
              })
            }
          >
            <option value="">Select Member</option>

            {availableMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {getFullName(m)}
              </option>
            ))}
          </select>

          {/* DATE */}
          <label className="form-label">Date of death</label>
          <input
            type="date"
            className="form-control mb-4"
            value={form.dateOfDeath}
            onChange={(e) =>
              setForm({
                ...form,
                dateOfDeath: e.target.value,
              })
            }
          />

          {/* ACTIONS */}
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>

            <button type="button" className="btn btn-danger" onClick={onSave} disabled={!form.memberId || !form.dateOfDeath}>
              <i className="bi bi-check2 me-2" />Save event
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}