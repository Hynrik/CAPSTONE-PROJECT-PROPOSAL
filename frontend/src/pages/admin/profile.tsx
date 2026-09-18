import { useState } from "react";

type Admin = {
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
};

export default function Profile() {
  const [admin, setAdmin] = useState<Admin>({
    name: "Admin User",
    email: "admin@aipge.com",
    role: "System Administrator",
    phone: "+63 900 000 0000",
    address: "Iloilo, Philippines",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdmin((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleEdit = () => setIsEditing((prev) => !prev);

  return (
    <div className="app-page app-page--profile">

      {/* HEADER */}
      <div className="profile-page__header d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="app-page__eyebrow"><i className="bi bi-person-circle me-2" />Account center</span>
          <h3 className="fw-bold mb-0">Admin Profile</h3>
          <small className="text-muted">
            Manage your account settings and security
          </small>
        </div>

        <button
          className={`btn profile-edit-button ${isEditing ? "btn-success" : "btn-outline-primary"}`}
          onClick={toggleEdit}
        >
          <i className={`bi ${isEditing ? "bi-check2" : "bi-pencil-square"} me-2`} />
          {isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      {/* PROFILE LAYOUT */}
      <div className="row g-4">

        {/* LEFT CARD */}
        <div className="col-md-4">

          <div className="card border-0 shadow-sm text-center p-4 profile-identity-card">

            {/* Avatar */}
            <div
              className="profile-avatar"
            >
              {admin.name.charAt(0)}
            </div>

            <h5 className="mb-1">{admin.name}</h5>
            <p className="text-muted mb-2">{admin.role}</p>

            <span className="profile-status-badge">
              <i className="bi bi-shield-check me-1" />Active Admin
            </span>

            <hr />

            <div className="text-start small text-muted profile-contact-list">
              <p className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                {admin.email}
              </p>

              <p className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                {admin.phone}
              </p>

              <p className="mb-0">
                <i className="bi bi-geo-alt me-2"></i>
                {admin.address}
              </p>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="col-md-8">

          {/* ACCOUNT INFO */}
          <div className="card border-0 shadow-sm p-4 mb-4 profile-section-card">

            <div className="profile-section-heading"><div><span className="profile-section-kicker">Identity details</span><h5 className="mb-0">Account Information</h5></div><i className="bi bi-person-vcard" /></div>

            <div className="row g-3">

              <div className="col-md-6">
                <label className="form-label">Full Name</label>
                <input
                  name="name"
                  value={admin.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-control"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  name="email"
                  value={admin.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-control"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input
                  name="phone"
                  value={admin.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-control"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Address</label>
                <input
                  name="address"
                  value={admin.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-control"
                />
              </div>

            </div>

          </div>

          {/* SECURITY */}
          <div className="card border-0 shadow-sm p-4 profile-section-card profile-security-card">

            <div className="profile-section-heading"><div><span className="profile-section-kicker">Protection</span><h5 className="mb-0">Security Settings</h5></div><i className="bi bi-lock" /></div>

            <button className="btn btn-outline-warning w-100 mb-2">
              <i className="bi bi-key me-2"></i>
              Change Password
            </button>

            <button className="btn btn-outline-danger w-100">
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}