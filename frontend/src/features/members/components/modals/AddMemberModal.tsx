 
 
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
  const [saveError, setSaveError] = useState("");

  const validate = () => {
    const newErrors: Record<string, boolean> = {};

    if (!form.firstName.trim()) newErrors.firstName = true;
    if (!form.lastName.trim()) newErrors.lastName = true;
    if (!form.birthDate) newErrors.birthDate = true;
    if (!form.sex) newErrors.sex = true;
    if (!form.civilStatus.trim()) newErrors.civilStatus = true;
    if (!form.status) newErrors.status = true;

    if (form.spouse.enabled) {
      if (!form.spouse.name.trim()) newErrors.spouseName = true;
      if (!form.spouse.birthDate) newErrors.spouseBirthDate = true;
    }

    form.children.forEach((child, index) => {
      if (!child.name.trim()) newErrors[`children.${index}.name`] = true;
      if (!child.birthDate) newErrors[`children.${index}.birthDate`] = true;
    });

    form.parents.forEach((parent, index) => {
      if (!parent.name.trim()) newErrors[`parents.${index}.name`] = true;
      if (!parent.birthDate) newErrors[`parents.${index}.birthDate`] = true;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      requestAnimationFrame(() => {
        const firstInvalid = document.querySelector<HTMLElement>(".member-form [aria-invalid='true']");
        firstInvalid?.focus({ preventScroll: true });
        firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return false;
    }

    return true;
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
    setErrors({});
    setSaveError("");
    setForm(initialData);
  } else if (show) {
    setErrors({});
    setSaveError("");
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

    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setSaveError("");
  };

  // ================= SPOUSE =================
  const updateSpouse = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      spouse: { ...prev.spouse, [field]: value },
    }));
    const errorField = field === "name" ? "spouseName" : field === "birthDate" ? "spouseBirthDate" : "";
    if (errorField) setErrors((prev) => ({ ...prev, [errorField]: false }));
    setSaveError("");
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
    setErrors((prev) => ({ ...prev, [`${key}.${index}.${String(field)}`]: false }));
    setSaveError("");
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
    setErrors((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([field]) => !field.startsWith(`${key}.`)))
    );
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
  if (!validate()) return;

  try {
    setLoading(true);
      setSaveError("");
    await onSave(form);
    onClose();
  } catch (err) {
    console.error("Error saving member:", err);
      setSaveError(err instanceof Error ? err.message : "Could not save the member. Please try again.");
  } finally {
    setLoading(false);
  }
};

const inputClass = (field: string) =>
  `form-control ${errors[field] ? "is-invalid" : ""}`;

const fieldError = (field: string, message: string) =>
  errors[field] ? <div id={`${field.replaceAll(".", "-")}-error`} className="invalid-feedback d-block">{message}</div> : null;

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
    {saveError && <div className="alert alert-danger" role="alert">{saveError}</div>}
    <div className="member-form__preview">
      <div className="member-form__avatar">{`${form.firstName?.[0] ?? ""}${form.lastName?.[0] ?? ""}`.toUpperCase() || "M"}</div>
      <div><div className="member-form__preview-name">{`${form.firstName || "New"} ${form.lastName || "Member"}`}</div><small>Complete the required fields to create this member record.</small></div>
    </div>
    <div className="row g-3">

      {/* BASIC */}
      <h6 className="member-form__section">Basic Information</h6>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="member-first-name">First Name <span className="text-danger" aria-hidden="true">*</span></label>
        <input id="member-first-name" name="firstName" value={form.firstName || ""} className={inputClass("firstName")} placeholder="First Name" required aria-invalid={Boolean(errors.firstName)} aria-describedby={errors.firstName ? "firstName-error" : undefined} onChange={handleChange} />
        {fieldError("firstName", "Enter the member's first name.")}
      </div>
      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="member-last-name">Last Name <span className="text-danger" aria-hidden="true">*</span></label>
        <input id="member-last-name" name="lastName" value={form.lastName || ""} className={inputClass("lastName")} placeholder="Last Name" required aria-invalid={Boolean(errors.lastName)} aria-describedby={errors.lastName ? "lastName-error" : undefined} onChange={handleChange} />
        {fieldError("lastName", "Enter the member's last name.")}
      </div>
      <input name="middleName" value={form.middleName || ""} className="form-control" placeholder="Middle Name" onChange={handleChange} />
      <input name="suffix" value={form.suffix || ""} className="form-control" placeholder="Suffix" onChange={handleChange} />

      {/* STATUS */}
      <h6 className="member-form__section mt-3">Status</h6>
      <div className="col-12 col-md-6">
      <label className="form-label" htmlFor="member-status">Member Status <span className="text-danger" aria-hidden="true">*</span></label>
      <select id="member-status" name="status" value={form.status || ""} className={inputClass("status")} required aria-invalid={Boolean(errors.status)} aria-describedby={errors.status ? "status-error" : undefined} onChange={handleChange}>
        <option value="">Select status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="deceased">Deceased</option>
      </select>
      {fieldError("status", "Select a member status.")}
      </div>

      {/* PERSONAL */}
      <h6 className="member-form__section mt-3">Personal Details</h6>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="member-birth-date">Date of Birth <span className="text-danger" aria-hidden="true">*</span></label>
        <input id="member-birth-date" type="date" name="birthDate" value={form.birthDate || ""} className={inputClass("birthDate")} required aria-invalid={Boolean(errors.birthDate)} aria-describedby={errors.birthDate ? "birthDate-error" : undefined} onChange={handleChange} />
        {fieldError("birthDate", "Enter the member's date of birth.")}
      </div>
      <input name="birthPlace" value={form.birthPlace || ""} className="form-control" placeholder="Birth Place" onChange={handleChange} />
      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="member-civil-status">Civil Status <span className="text-danger" aria-hidden="true">*</span></label>
        <input id="member-civil-status" name="civilStatus" value={form.civilStatus || ""} className={inputClass("civilStatus")} placeholder="Civil Status" required aria-invalid={Boolean(errors.civilStatus)} aria-describedby={errors.civilStatus ? "civilStatus-error" : undefined} onChange={handleChange} />
        {fieldError("civilStatus", "Enter the member's civil status.")}
      </div>

      <div className="col-12 col-md-6">
      <label className="form-label" htmlFor="member-sex">Sex <span className="text-danger" aria-hidden="true">*</span></label>
      <select id="member-sex" name="sex" value={form.sex || ""} className={inputClass("sex")} required aria-invalid={Boolean(errors.sex)} aria-describedby={errors.sex ? "sex-error" : undefined} onChange={handleChange}>
        <option value="">Select Sex</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      {fieldError("sex", "Select the member's sex.")}
      </div>

      {/* WORK */}
      <h6 className="member-form__section mt-3">Work Information</h6>

      <input name="position" value={form.position || ""} className={inputClass("position")} placeholder="Position" onChange={handleChange} />
      <input name="office" value={form.office || ""} className={inputClass("office")} placeholder="Office" onChange={handleChange} />
      <input name="salaryGrade" value={form.salaryGrade || ""} className="form-control" placeholder="Salary Grade" onChange={handleChange} />
      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="member-original-appointment">Original Appointment Date</label>
        <input id="member-original-appointment" type="date" name="originalAppointment" value={form.originalAppointment || ""} className="form-control" onChange={handleChange} />
      </div>

      {/* CONTACT */}
      <h6 className="member-form__section mt-3">Contact</h6>

      <input name="presentAddress" value={form.presentAddress || ""} className="form-control" placeholder="Present Address" onChange={handleChange} />
      <input name="permanentAddress" value={form.permanentAddress || ""} className="form-control" placeholder="Permanent Address" onChange={handleChange} />
      <input name="mobile" value={form.mobile || ""} className="form-control" placeholder="Mobile" onChange={handleChange} />
      <input name="telephone" value={form.telephone || ""} className="form-control" placeholder="Telephone" onChange={handleChange} />
      <input name="email" value={form.email || ""} className="form-control" placeholder="Email" onChange={handleChange} />

      {/* OTHER */}
      <h6 className="member-form__section mt-3">Other</h6>

      <div className="col-12 col-md-6">
        <label className="form-label" htmlFor="member-since">Member Since</label>
        <input id="member-since" type="date" name="memberSince" value={form.memberSince || ""} className={inputClass("memberSince")} onChange={handleChange} />
      </div>
      <select name="cscEligibility" value={form.cscEligibility || ""} className="form-select" onChange={handleChange}>
        <option value="">Select CSC Eligibility (optional)</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
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
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="spouse-name">Spouse Name <span className="text-danger" aria-hidden="true">*</span></label>
            <input id="spouse-name" value={form.spouse.name || ""} className={inputClass("spouseName")} placeholder="Spouse Name" required={form.spouse.enabled} aria-invalid={Boolean(errors.spouseName)} aria-describedby={errors.spouseName ? "spouseName-error" : undefined} onChange={(e) => updateSpouse("name", e.target.value)} />
            {fieldError("spouseName", "Enter the spouse's name or disable the spouse section.")}
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="spouse-birth-date">Spouse Date of Birth <span className="text-danger" aria-hidden="true">*</span></label>
            <input id="spouse-birth-date" type="date" value={form.spouse.birthDate || ""} className={inputClass("spouseBirthDate")} required={form.spouse.enabled} aria-invalid={Boolean(errors.spouseBirthDate)} aria-describedby={errors.spouseBirthDate ? "spouseBirthDate-error" : undefined} onChange={(e) => updateSpouse("birthDate", e.target.value)} />
            {fieldError("spouseBirthDate", "Enter the spouse's date of birth or disable the spouse section.")}
          </div>

          <label>
            <input type="checkbox" checked={form.spouse.isBeneficiary} onChange={(e) => updateSpouse("isBeneficiary", e.target.checked)} /> Beneficiary
          </label>
        </>
      )}

      {/* CHILDREN */}
      <h6 className="member-form__section mt-3">Children</h6>

      {form.children.map((c, i) => (
        <div key={i} className="row g-2">
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor={`child-name-${i}`}>Child Name <span className="text-danger" aria-hidden="true">*</span></label>
            <input id={`child-name-${i}`} value={c.name || ""} className={inputClass(`children.${i}.name`)} placeholder="Name" required aria-invalid={Boolean(errors[`children.${i}.name`])} aria-describedby={errors[`children.${i}.name`] ? `children-${i}-name-error` : undefined} onChange={(e) => updateArray("children", i, "name", e.target.value)} />
            {fieldError(`children.${i}.name`, "Enter the child's name or remove this row.")}
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor={`child-birth-date-${i}`}>Child Date of Birth <span className="text-danger" aria-hidden="true">*</span></label>
            <input id={`child-birth-date-${i}`} type="date" value={c.birthDate || ""} className={inputClass(`children.${i}.birthDate`)} required aria-invalid={Boolean(errors[`children.${i}.birthDate`])} aria-describedby={errors[`children.${i}.birthDate`] ? `children-${i}-birthDate-error` : undefined} onChange={(e) => updateArray("children", i, "birthDate", e.target.value)} />
            {fieldError(`children.${i}.birthDate`, "Enter the child's date of birth or remove this row.")}
          </div>

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
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor={`parent-name-${i}`}>Parent Name <span className="text-danger" aria-hidden="true">*</span></label>
            <input id={`parent-name-${i}`} value={p.name || ""} className={inputClass(`parents.${i}.name`)} placeholder="Name" required aria-invalid={Boolean(errors[`parents.${i}.name`])} aria-describedby={errors[`parents.${i}.name`] ? `parents-${i}-name-error` : undefined} onChange={(e) => updateArray("parents", i, "name", e.target.value)} />
            {fieldError(`parents.${i}.name`, "Enter the parent's name or remove this row.")}
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor={`parent-birth-date-${i}`}>Parent Date of Birth <span className="text-danger" aria-hidden="true">*</span></label>
            <input id={`parent-birth-date-${i}`} type="date" value={p.birthDate || ""} className={inputClass(`parents.${i}.birthDate`)} required aria-invalid={Boolean(errors[`parents.${i}.birthDate`])} aria-describedby={errors[`parents.${i}.birthDate`] ? `parents-${i}-birthDate-error` : undefined} onChange={(e) => updateArray("parents", i, "birthDate", e.target.value)} />
            {fieldError(`parents.${i}.birthDate`, "Enter the parent's date of birth or remove this row.")}
          </div>

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