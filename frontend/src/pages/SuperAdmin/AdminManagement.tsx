import { useEffect, useMemo, useState } from "react";
import type { User } from "../../features/shared/types/users";
import { createUser, deleteUser, getUsers, updateUser } from "../../features/shared/api/users";

type Admin = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: "admin" | "superadmin";
  created_At: string;
  password: string;
};

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState<Admin>({
    id: 0,
    username: "",
    name: "",
    email: "",
    role: "admin",
    created_At: "",
    password: "",
  });

  useEffect(() => {
    getUsers()
      .then((users: User[]) => setAdmins(users.map((user) => ({ ...user, name: user.full_name, password: "" })) ))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  /* ================= FILTER ================= */
  const filteredAdmins = useMemo(() => {
    return admins.filter((a) =>
      `${a.username} ${a.name} ${a.email} ${a.role}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [admins, search]);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!form.id || !form.username.trim() || !form.name.trim() || !form.email.trim()) return;

    try {
      await updateUser(form.id, { username: form.username.trim(), full_name: form.name.trim(), email: form.email.trim(), role: form.role });
      setAdmins((prev) => prev.map((admin) => (admin.id === form.id ? { ...form, name: form.name.trim(), created_At: admin.created_At } : admin)));
      setShowForm(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to update user");
    }
  };

  const handleCreate = async () => {
    if (!form.username.trim() || !form.name.trim() || !form.email.trim() || form.password.length < 6) return;
    try {
      await createUser({ username: form.username.trim(), password: form.password, full_name: form.name.trim(), email: form.email.trim(), role: form.role });
      setShowForm(false);
      setForm({ id: 0, username: "", name: "", email: "", role: "admin", created_At: "", password: "" });
      setLoading(true);
      setAdmins((await getUsers()).map((user) => ({ ...user, name: user.full_name, password: "" })));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this user account?")) return;
    try {
      await deleteUser(id);
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to delete user");
    }
  };

  return (
    <div className="container-fluid py-4 app-page app-page--superadmin">

      {/* ================= HEADER ================= */}
      <div className="card p-3 mb-3 shadow-sm app-page__hero-card">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <span className="app-page__eyebrow"><i className="bi bi-shield-lock me-2" />Access control</span>
            <h3 className="mb-0">Admin Management</h3>
            <small className="text-muted">
              Superadmin Control Panel
            </small>
          </div>

          <button className="btn btn-primary" onClick={() => { setForm({ id: 0, username: "", name: "", email: "", role: "admin", created_At: "", password: "" }); setShowForm(true); }}><i className="bi bi-person-plus me-2" />Add Admin</button>
        </div>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="card p-3 mb-3 shadow-sm">
        <input
          className="form-control"
          placeholder="Search admin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* ================= TABLE ================= */}
      <div className="card p-3 shadow-sm">
        {loading ? <div className="text-center text-muted py-5"><div className="spinner-border text-success mb-2" />Loading users...</div> : <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-3">
                    No admins found
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((a) => (
                  <tr key={a.id}>
                    <td><span className="admin-username"><i className="bi bi-at me-1" />{a.username}</span></td>
                    <td>{a.name}</td>
                    <td>{a.email}</td>
                    <td>
                      <span className="badge bg-info text-dark">
                        {a.role}
                      </span>
                    </td>
                    <td className="text-muted">{a.created_At ? new Date(a.created_At).toLocaleDateString() : "-"}</td>

                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => {
                          setForm(a);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(a.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>}
      </div>

      {/* ================= SIMPLE MODAL ================= */}
      {showForm && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center">
          
          <div className="card p-4" style={{ width: 400 }}>
            <h5 className="mb-3">
              {form.id ? "Edit User Account" : "Add Admin Account"}
            </h5>

            <label className="form-label">Login username</label>
            <input
              className="form-control mb-3"
              placeholder="Username used for login"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />

            {!form.id && <><label className="form-label">Login password</label><input type="password" className="form-control mb-3" placeholder="Minimum 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></>}

            <label className="form-label">Full name</label>
            <input
              className="form-control mb-2"
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              className="form-control mb-2"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <select className="form-control mb-3" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "superadmin" })}>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>

            <div className="d-flex justify-content-end">
                <button
                className="btn btn-secondary me-2"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={form.id ? handleSave : handleCreate}
                disabled={!form.username.trim() || !form.name.trim() || !form.email.trim() || (!form.id && form.password.length < 6)}
              >
                Save
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}