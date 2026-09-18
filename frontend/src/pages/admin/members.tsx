import AddMemberModal from "../../features/members/components/modals/AddMemberModal";
import ViewMemberModal from "../../features/members/components/modals/ViewMembermodal";

import type { Member, MemberForm } from "../../features/shared/types";
import { useMembers } from "../../features/members/hooks/useMembers";
import { useMemo, useState } from "react";

export default function Members() {
  const {
    filteredMembers,
    loading,
    search,
    setSearch,
    addMember,
    updateMember,
    stats,
  } = useMembers();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const activeCount = useMemo(
    () => filteredMembers.filter((member) => member.status === "active").length,
    [filteredMembers]
  );

  const inactiveCount = useMemo(
    () => filteredMembers.filter((member) => member.status === "inactive").length,
    [filteredMembers]
  );

  // ================= ADD =================
  const handleSaveMember = async (form: MemberForm) => {
    await addMember(form);
    setShowAddModal(false);
  };

  // ================= UPDATE =================
  const handleUpdateMember = async (updated: MemberForm) => {
    if (!selectedMember) return;

    await updateMember(selectedMember.id, updated);

    setShowViewModal(false);
    setSelectedMember(null);
  };

  // ================= STATUS =================
  const getStatusClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success-subtle text-success-emphasis";
      case "inactive":
        return "bg-secondary-subtle text-secondary-emphasis";
      case "deceased":
        return "bg-dark-subtle text-dark-emphasis";
      default:
        return "bg-secondary-subtle text-secondary-emphasis";
    }
  };

  const getInitials = (member: Member) => {
    const first = member.firstName?.[0] ?? "";
    const last = member.lastName?.[0] ?? "";
    return `${first}${last}`.toUpperCase() || "M";
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ================= VIEW =================
  const viewMember = (member: Member) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  return (
    <div className="container-fluid py-4 px-2 px-lg-3 app-page app-page--members">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
        <div>
          <span className="app-page__eyebrow"><i className="bi bi-people me-2" />Membership records</span>
          <h2 className="fw-bold mb-1">Members Management</h2>
          <p className="text-muted mb-0">
            Manage memberships, review member activity, and stay on top of account status from one place.
          </p>
        </div>

        <button className="btn btn-success px-4 py-2" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-person-plus me-2"></i>
          Add Member
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 members-stat members-stat--total">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <small className="text-muted d-block mb-2">Total Members</small>
                <h3 className="mb-0 fw-bold">{stats.total}</h3>
              </div>
              <div className="stat-icon bg-success text-white">
                <i className="bi bi-people fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 members-stat members-stat--active">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <small className="text-muted d-block mb-2">Active</small>
                <h3 className="mb-0 fw-bold">{activeCount}</h3>
              </div>
              <div className="stat-icon bg-primary text-white">
                <i className="bi bi-person-check fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 h-100 members-stat members-stat--inactive">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <small className="text-muted d-block mb-2">Inactive</small>
                <h3 className="mb-0 fw-bold">{inactiveCount}</h3>
              </div>
              <div className="stat-icon bg-warning text-white">
                <i className="bi bi-person-x fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4 members-filter-panel">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-lg-8">
              <label className="form-label members-filter-label"><i className="bi bi-search me-2" />Search members</label>
              <div className="members-search"><i className="bi bi-person-search" /><input className="form-control" placeholder="Search by name, member ID, or status..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            </div>
            <div className="col-lg-4">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setSearch("")}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Reset Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 members-directory-panel">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div className="members-section-kicker">Active records</div>
              <h5 className="fw-bold mb-1">Member Directory</h5>
              <p className="text-muted small mb-0">
                {filteredMembers.length} members currently shown
              </p>
            </div>
            <span className="members-record-count">
              {filteredMembers.length} records
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border text-success mb-3" role="status"></div>
              <div>Loading members...</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th className="border-0">Member</th>
                    <th className="border-0">Status</th>
                    <th className="border-0">Member Since</th>
                    <th className="border-0 text-end">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-4">
                        <div className="py-3">
                          <i className="bi bi-person-slash fs-3 d-block mb-2"></i>
                          No members found for this search.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar-circle bg-success-subtle text-success-emphasis">
                              {getInitials(m)}
                            </div>
                            <div>
                              <div className="fw-semibold">
                                {m.firstName} {m.lastName}
                              </div>
                              <small className="text-muted">
                                ID: {m.member_code || m.id}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={`badge rounded-pill ${getStatusClass(m.status)}`}>
                            {m.status}
                          </span>
                        </td>

                        <td className="text-muted">{formatDate(m.memberSince)}</td>

                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => viewMember(m)}
                          >
                            <i className="bi bi-eye me-2"></i>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AddMemberModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveMember}
      />

      <ViewMemberModal
        show={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onUpdate={handleUpdateMember}
      />
    </div>
  );
}