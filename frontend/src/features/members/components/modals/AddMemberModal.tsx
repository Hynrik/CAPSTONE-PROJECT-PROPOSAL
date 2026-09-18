 
 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Modal from "../../../shared/ui/Modal";
import type { Child, MemberForm, Parent } from "../../../shared/types";


interface Props {
  show: boolean;
  onClose: () => void;
  onSave: (data: MemberForm) => Promise<void>;
  initialData?: MemberForm;
}

export default function AddMemberModal({ show, onClose, onSave, initialData }: Props) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  console.log("INITIAL DATA:", initialData);
  const validate = () => {
  const newErrors: Record<string, boolean> = {};

  if (!form.firstName) newErrors.firstName = true;
  if (!form.lastName) newErrors.lastName = true;
  if (!form.birthDate) newErrors.birthDate = true;
  if (!form.sex) newErrors.sex = true;
  if (!form.civilStatus) newErrors.civilStatus = true;

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
    };

  const [form, setForm] = useState<MemberForm>({
    member_code: "",

    lastName: "",
    firstName: "",
    middleName: "",
    suffix: "",

    birthDate: "",
    birthPlace: "",
    civilStatus: "",
    sex: "",

    position: "",
    originalAppointment: "",
    office: "",
    salaryGrade: "",

    presentAddress: "",
    permanentAddress: "",

    memberSince: "",
    cscEligibility: "",
    bloodType: "",

    tin: "",
    mobile: "",
    telephone: "",
    email: "",

    soloParent: false,
    lgbtq: false,
    pwd: false,

    status: "active",

    spouse: {
      enabled: false,
      name: "",
      birthDate: "",
      profession: "",
      employer: "",
      isBeneficiary: false,
    },

    children: [{ name: "", birthDate: "", isBeneficiary: false }],
    parents: [{ name: "", birthDate: "", isBeneficiary: false }],

    primeBeneficiary: {
      name: "",
      birthDate: "",
    },
  });
  useEffect(() => {
  if (show && initialData) {
    setForm(initialData);
  } else if (show) {
    // reset when adding new member
    setForm({
      member_code: "",
      lastName: "",
      firstName: "",
      middleName: "",
      suffix: "",
      birthDate: "",
      birthPlace: "",
      civilStatus: "",
      sex: "",
      position: "",
      originalAppointment: "",
      office: "",
      salaryGrade: "",
      presentAddress: "",
      permanentAddress: "",
      memberSince: "",
      cscEligibility: "",
      bloodType: "",
      tin: "",
      mobile: "",
      telephone: "",
      email: "",
      soloParent: false,
      lgbtq: false,
      pwd: false,
      status: "active",
      spouse: {
        enabled: false,
        name: "",
        birthDate: "",
        profession: "",
        employer: "",
        isBeneficiary: false,
      },
      children: [],
      parents: [],
      primeBeneficiary: {
        name: "",
        birthDate: "",
      },
    });
  }
}, [show, initialData]);
  

  // ================= CHANGE HANDLER =================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  // ================= SPOUSE =================
  const updateSpouse = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      spouse: { ...prev.spouse, [field]: value },
    }));
  };

  // ================= ARRAY =================
  const updateArray = <T,>(
    key: "children" | "parents",
    index: number,
    field: keyof T,
    value: any
  ) => {
    setForm((prev) => {
      const updated = [...(prev[key] as any)];
      updated[index] = { ...updated[index], [field]: value };

      return { ...prev, [key]: updated };
    });
  };

    const addArrayItem = (
    key: "children" | "parents",
    item: Child | Parent
    ) => {
    setForm((prev) => ({
        ...prev,
        [key]: [...prev[key], item],
    }));
    };
  const removeArrayItem = (key: "children" | "parents", index: number) => {
    setForm((prev) => ({
      ...prev,
      [key]: (prev[key] as any).filter((_: any, i: number) => i !== index),
    }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
  if (!validate()) return;

  try {
    setLoading(true);
    await onSave(form);
    onClose();
  } catch (err) {
    console.error("Error saving member:", err);
  } finally {
    setLoading(false);
  }
};

const inputClass = (field: string) =>
  `form-control ${errors[field] ? "border border-danger" : ""}`;

  return (
  <Modal
    show={show}
    title="Add New Member"
    onClose={onClose}
    size="wide"
    footer={
      <>
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>

        <button
          className="btn btn-success"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Member"}
        </button>
      </>
    }
  >
    <div className="member-form">
    <div className="member-form__preview">
      <div className="member-form__avatar">{`${form.firstName?.[0] ?? ""}${form.lastName?.[0] ?? ""}`.toUpperCase() || "M"}</div>
      <div><div className="member-form__preview-name">{`${form.firstName || "New"} ${form.lastName || "Member"}`}</div><small>Complete the required fields to create this member record.</small></div>
    </div>
    <div className="row g-3">

      {/* BASIC */}
      <h6 className="member-form__section">Basic Information</h6>

      <input name="firstName" value={form.firstName || ""} className={inputClass("firstName")} placeholder="First Name" onChange={handleChange} />
      <input name="lastName" value={form.lastName || ""} className={inputClass("lastName")} placeholder="Last Name" onChange={handleChange} />
      <input name="middleName" value={form.middleName || ""} className="form-control" placeholder="Middle Name" onChange={handleChange} />
      <input name="suffix" value={form.suffix || ""} className="form-control" placeholder="Suffix" onChange={handleChange} />

      {/* STATUS */}
      <h6 className="member-form__section mt-3">Status</h6>
      <select name="status" value={form.status || ""} className={inputClass("status")} onChange={handleChange}>
        <option value="">Select status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="deceased">Deceased</option>
      </select>

      {/* PERSONAL */}
      <h6 className="member-form__section mt-3">Personal Details</h6>

      <input type="date" name="birthDate" value={form.birthDate || ""} className={inputClass("birthDate")} onChange={handleChange} />
      <input name="birthPlace" value={form.birthPlace || ""} className="form-control" placeholder="Birth Place" onChange={handleChange} />
      <input name="civilStatus" value={form.civilStatus || ""} className={inputClass("civilStatus")} placeholder="Civil Status" onChange={handleChange} />

      <select name="sex" value={form.sex || ""} className={inputClass("sex")} onChange={handleChange}>
        <option value="">Select Sex</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      {/* WORK */}
      <h6 className="member-form__section mt-3">Work Information</h6>

      <input name="position" value={form.position || ""} className={inputClass("position")} placeholder="Position" onChange={handleChange} />
      <input name="office" value={form.office || ""} className={inputClass("office")} placeholder="Office" onChange={handleChange} />
      <input name="salaryGrade" value={form.salaryGrade || ""} className="form-control" placeholder="Salary Grade" onChange={handleChange} />
      <input type="date" name="originalAppointment" value={form.originalAppointment || ""} className="form-control" onChange={handleChange} />

      {/* CONTACT */}
      <h6 className="member-form__section mt-3">Contact</h6>

      <input name="presentAddress" value={form.presentAddress || ""} className="form-control" placeholder="Present Address" onChange={handleChange} />
      <input name="permanentAddress" value={form.permanentAddress || ""} className="form-control" placeholder="Permanent Address" onChange={handleChange} />
      <input name="mobile" value={form.mobile || ""} className="form-control" placeholder="Mobile" onChange={handleChange} />
      <input name="telephone" value={form.telephone || ""} className="form-control" placeholder="Telephone" onChange={handleChange} />
      <input name="email" value={form.email || ""} className="form-control" placeholder="Email" onChange={handleChange} />

      {/* OTHER */}
      <h6 className="member-form__section mt-3">Other</h6>

      <input type="date" name="memberSince" value={form.memberSince || ""} className={inputClass("memberSince")} onChange={handleChange} />
      <input name="cscEligibility" value={form.cscEligibility || ""} className="form-control" placeholder="CSC Eligibility" onChange={handleChange} />
      <input name="bloodType" value={form.bloodType || ""} className="form-control" placeholder="Blood Type" onChange={handleChange} />
      <input name="tin" value={form.tin || ""} className="form-control" placeholder="TIN" onChange={handleChange} />

      {/* BENEFITS */}
      <h6 className="member-form__section mt-3">Benefits</h6>

      <label>
        <input type="checkbox" checked={form.soloParent} onChange={(e) => setForm(p => ({ ...p, soloParent: e.target.checked }))} /> Solo Parent
      </label>

      <label>
        <input type="checkbox" checked={form.lgbtq} onChange={(e) => setForm(p => ({ ...p, lgbtq: e.target.checked }))} /> LGBTQ
      </label>

      <label>
        <input type="checkbox" checked={form.pwd} onChange={(e) => setForm(p => ({ ...p, pwd: e.target.checked }))} /> PWD
      </label>

      {/* SPOUSE */}
      <h6 className="member-form__section mt-3">Spouse</h6>

      <label>
        <input type="checkbox" checked={form.spouse.enabled} onChange={(e) => updateSpouse("enabled", e.target.checked)} /> Enable Spouse
      </label>

      {form.spouse.enabled && (
        <>
          <input value={form.spouse.name || ""} className="form-control" placeholder="Spouse Name" onChange={(e) => updateSpouse("name", e.target.value)} />
          <input type="date" value={form.spouse.birthDate || ""} className="form-control" onChange={(e) => updateSpouse("birthDate", e.target.value)} />

          <label>
            <input type="checkbox" checked={form.spouse.isBeneficiary} onChange={(e) => updateSpouse("isBeneficiary", e.target.checked)} /> Beneficiary
          </label>
        </>
      )}

      {/* CHILDREN */}
      <h6 className="member-form__section mt-3">Children</h6>

      {form.children.map((c, i) => (
        <div key={i} className="row g-2">
          <input value={c.name || ""} className="form-control" placeholder="Name" onChange={(e) => updateArray("children", i, "name", e.target.value)} />
          <input type="date" value={c.birthDate || ""} className="form-control" onChange={(e) => updateArray("children", i, "birthDate", e.target.value)} />

          <label>
            <input type="checkbox" checked={c.isBeneficiary} onChange={(e) => updateArray("children", i, "isBeneficiary", e.target.checked)} /> Beneficiary
          </label>

          <button className="btn btn-danger btn-sm" onClick={() => removeArrayItem("children", i)}>X</button>
        </div>
      ))}

      <button className="btn btn-outline-success btn-sm" onClick={() => addArrayItem("children", { name: "", birthDate: "", isBeneficiary: false })}>
        + Add Child
      </button>

      {/* PARENTS */}
      <h6 className="member-form__section mt-3">Parents</h6>

      {form.parents.map((p, i) => (
        <div key={i} className="row g-2">
          <input value={p.name || ""} className="form-control" placeholder="Name" onChange={(e) => updateArray("parents", i, "name", e.target.value)} />
          <input type="date" value={p.birthDate || ""} className="form-control" onChange={(e) => updateArray("parents", i, "birthDate", e.target.value)} />

          <label>
            <input type="checkbox" checked={p.isBeneficiary} onChange={(e) => updateArray("parents", i, "isBeneficiary", e.target.checked)} /> Beneficiary
          </label>

          <button className="btn btn-danger btn-sm" onClick={() => removeArrayItem("parents", i)}>X</button>
        </div>
      ))}

      <button className="btn btn-outline-success btn-sm" onClick={() => addArrayItem("parents", { name: "", birthDate: "", isBeneficiary: false })}>
        + Add Parent
      </button>

    </div>
    </div>
  </Modal>
);
}