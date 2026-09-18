import { useState } from "react";
import Modal from "../../../shared/ui/Modal";
import AddMemberModal from "./AddMemberModal";
import type { Member, MemberForm } from "../../../shared/types";

interface Props {
  show: boolean;
  onClose: () => void;
  member: Member | null;
  onUpdate: (data: MemberForm) => Promise<void>;
}

export default function ViewMemberModal({
  show,
  onClose,
  member,
  onUpdate,
}: Props) {
  const [showEdit, setShowEdit] = useState(false);

  if (!member) return null;

  const fullName = `${member.firstName} ${member.middleName || ""} ${member.lastName} ${member.suffix || ""}`;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-success";
      case "inactive":
        return "bg-secondary";
      case "deceased":
        return "bg-danger";
      default:
        return "bg-dark";
    }
  };

  const toForm = (m: Member): MemberForm => ({
    member_code: "",

    lastName: m.lastName,
    firstName: m.firstName,
    middleName: m.middleName || "",
    suffix: m.suffix || "",

    birthDate: m.birthDate,
    birthPlace: m.birthPlace,
    civilStatus: m.civilStatus,
    sex: m.sex,

    position: m.position,
    originalAppointment: m.originalAppointment,
    office: m.office,
    salaryGrade: m.salaryGrade,

    presentAddress: m.presentAddress,
    permanentAddress: m.permanentAddress,

    memberSince: m.memberSince,
    bloodType: m.bloodType,
    tin: m.tin,
    mobile: m.mobile,
    telephone: m.telephone,
    email: m.email,

    status: m.status,
    cscEligibility: m.cscEligibility,

    soloParent: m.soloParent,
    lgbtq: m.lgbtq,
    pwd: m.pwd,

    spouse: m.spouse ?? {
      enabled: false,
      name: "",
      birthDate: "",
      profession: "",
      employer: "",
      isBeneficiary: false,
    },

    children: m.children ?? [],
    parents: m.parents ?? [],

    primeBeneficiary: m.primeBeneficiary ?? {
      name: "",
      birthDate: "",
    },
  });

  const handleSave = async (data: MemberForm) => {
  try {
    await onUpdate(data);

    // ✅ SUCCESS FEEDBACK
    alert("Member updated successfully");

    setShowEdit(false);
    onClose();
  } catch (err) {
    console.error("Error saving member:", err);
    alert("Failed to update member");
  }
};

 return (
  <>
    <Modal show={show} onClose={onClose} title="Member Profile" size="wide">

      {/* BODY */}
      <div style={{ maxHeight: "75vh", display: "flex", flexDirection: "column" }}>

        {/* SCROLLABLE CONTENT */}
        <div style={{ overflowY: "auto", flex: 1 }}>

          {/* ================= HEADER ================= */}
          <div className="text-center mb-3 p-3 border rounded bg-light">
            <h4 className="mb-1">{fullName}</h4>

            <div className="d-flex justify-content-center gap-2 align-items-center">
              <small className="text-muted">
                Code: {member.member_code || "N/A"}
              </small>

              <span className={`badge ${getStatusBadge(member.status)}`}>
                {member.status}
              </span>
            </div>
          </div>

          {/* ================= GRID INFO ================= */}
          <div className="row g-3">

            <div className="col-md-6">
              <div className="border rounded p-2 h-100">
                <div className="fw-bold mb-2 text-success">Basic Info</div>
                <small className="text-muted">
                  Birth: {member.birthDate} <br />
                  Civil Status: {member.civilStatus} <br />
                  Sex: {member.sex}
                </small>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-2 h-100">
                <div className="fw-bold mb-2 text-success">Work Info</div>
                <small className="text-muted">
                  Position: {member.position} <br />
                  Office: {member.office} <br />
                  Salary Grade: {member.salaryGrade}
                </small>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-2 h-100">
                <div className="fw-bold mb-2 text-success">Contact</div>
                <small className="text-muted">
                  Mobile: {member.mobile || "—"} <br />
                  Email: {member.email || "—"} <br />
                  Address: {member.presentAddress || "—"}
                </small>
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-2 h-100">
                <div className="fw-bold mb-2 text-success">Other</div>
                <small className="text-muted">
                  Member Since: {member.memberSince || "—"} <br />
                  Blood Type: {member.bloodType || "—"} <br />
                  TIN: {member.tin || "—"}
                </small>
              </div>
            </div>

          </div>

          {/* BENEFITS */}
          <div className="mt-3 border rounded p-2">
            <div className="fw-bold text-success mb-2">Beneficiary</div>

            <div className="d-flex gap-2 flex-wrap">
              {member.soloParent && <span className="badge bg-primary">Solo Parent</span>}
              {member.lgbtq && <span className="badge bg-info">LGBTQ</span>}
              {member.pwd && <span className="badge bg-warning text-dark">PWD</span>}

              {!member.soloParent && !member.lgbtq && !member.pwd && (
                <small className="text-muted">No benefits registered</small>
              )}
            </div>
          </div>

        </div>

        {/* ================= FIXED ACTION BAR ================= */}
        <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-3 bg-white">

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowEdit(true)}
          >
            Edit Member
          </button>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>
    </Modal>

    {/* EDIT MODAL */}
    {showEdit && member && (
      <AddMemberModal
      key={member?.id}
        show={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={handleSave}
        initialData={toForm(member)}
      />
    )}
  </>
);
}