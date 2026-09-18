import { useEffect, useMemo, useState } from "react";

import { useFuneral } from "../../features/funeralassistance/hooks/useFuneral";
import type { DeathEventForm, LedgerEntry } from "../../features/funeralassistance/types/funeral";

import MonthModal from "../../features/funeralassistance/components/modals/MonthLedgerModal";
import EventModal from "../../features/funeralassistance/components/modals/AddDeathModal";
import { getActiveMembersForMonthAPI } from "../../features/funeralassistance/api/funeralApi";

export default function FuneralAssistance() {
  const {
    members,
    payments,
    events,
    ledger,
    loading,

    markAsPaid,
    createContributionAndMarkPaid,
    createDeathEvent,
    releaseDeath,

    totalCollected,
    totalReleased,
    balance,

    getFullName,
  } = useFuneral();

  /* ================= STATE ================= */
  const [selectedLedger, setSelectedLedger] = useState<LedgerEntry | null>(null);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  const [memberSearch, setMemberSearch] = useState("");
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [eventSearch, setEventSearch] = useState("");
  const [activeMemberIds, setActiveMemberIds] = useState<number[]>([]);

  const [form, setForm] = useState<DeathEventForm>({
    memberId: "",
    dateOfDeath: "",
  });

  const handleSaveEvent = async () => {
    if (!form.memberId || !form.dateOfDeath) return;

    await createDeathEvent(Number(form.memberId), form.dateOfDeath);

    setForm({ memberId: "", dateOfDeath: "" });
    setShowEventModal(false);
  };

  /* ================= HELPERS ================= */
  const formatCurrency = (value: number) =>
    `₱${(value ?? 0).toLocaleString()}`;


  const getMonthKey = (date: string) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "";

    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`;
  };

  const ledgerPaymentMonth = selectedLedger?.month ?? null;

  /* ================= MEMBER MAP ================= */
  const memberMap = useMemo(() => {
    const map = new Map<number, (typeof members)[number]>();
    members.forEach((m) => map.set(Number(m.id), m));
    return map;
  }, [members]);

  /* ================= LEDGER FILTER ================= */
  const filteredLedger = useMemo(() => {
    const q = ledgerSearch.toLowerCase();
    return ledger.filter((l) =>
      l.month.toLowerCase().includes(q)
    );
  }, [ledger, ledgerSearch]);

  /* ================= EVENT FILTER ================= */
  const filteredEvents = useMemo(() => {
    const q = eventSearch.toLowerCase();

    return events.filter((e) => {
      const member = memberMap.get(Number(e.member_id));
      const name = member ? getFullName(member).toLowerCase() : "";

      return (
        name.includes(q) ||
        e.date_of_death.includes(eventSearch)
      );
    });
  }, [events, eventSearch, memberMap, getFullName]);

  useEffect(() => {
    const loadActiveMembers = async () => {
      if (!selectedLedger) {
        setActiveMemberIds([]);
        return;
      }

      const previousMonth = (() => {
        const [year, month] = (selectedLedger.month || "").split("-");
        if (!year || !month) return null;

        const date = new Date(Number(year), Number(month) - 1, 1);
        date.setMonth(date.getMonth() - 1);

        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      })();

      if (!previousMonth) {
        setActiveMemberIds([]);
        return;
      }

      try {
        const ids = await getActiveMembersForMonthAPI(`${previousMonth}-01`);
        setActiveMemberIds(Array.isArray(ids) ? ids.map((id: number | string) => Number(id)) : []);
      } catch (err) {
        console.error("Failed to load active members for month", err);
        setActiveMemberIds([]);
      }
    };

    loadActiveMembers();
  }, [selectedLedger]);

  /* ================= MODAL MEMBERS ================= */
  const modalMembers = useMemo(() => {
    if (!selectedLedger) return [];

    const q = memberSearch.toLowerCase();

    return members.filter((m) => {
      const matchesName = getFullName(m).toLowerCase().includes(q);
      const isActiveForMonth = activeMemberIds.includes(Number(m.id));
      return matchesName && isActiveForMonth;
    });
  }, [members, selectedLedger, memberSearch, getFullName, activeMemberIds]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-success mb-3" />
          <h5 className="fw-bold">
            Loading Funeral Assistance System...
          </h5>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-3 funeral-page app-page app-page--assistance">

      {/* ================= HEADER ================= */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 funeral-page__header">

        <div>
          <span className="app-page__eyebrow"><i className="bi bi-heart-pulse me-2" />Member care fund</span>
          <h2 className="fw-bold mb-1">Funeral Assistance System</h2>
          <p className="text-muted mb-0">
            Manage contributions, ledger records, and assistance releases from one organized view.
          </p>
        </div>

        <button
          className="btn btn-danger rounded-pill px-4 shadow-sm"
          onClick={() => setShowEventModal(true)}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Add Death Event
        </button>

      </div>

      {/* ================= SUMMARY ================= */}
      <div className="row g-3 mb-4 funeral-page__summary">

        <div className="col-md-4">
            <div className="card shadow-sm border-0 rounded-4 summary-card summary-card--collected">
            <div className="card-body">
              <div className="summary-card__top"><small className="text-uppercase text-muted fw-semibold">
                Total Contributions
              </small><span className="summary-card__icon"><i className="bi bi-arrow-down-left" /></span></div>
              <h3 className="fw-bold text-primary mt-2">
                {formatCurrency(totalCollected)}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-4 summary-card summary-card--released">
            <div className="card-body">
              <div className="summary-card__top"><small className="text-uppercase text-muted fw-semibold">
                Total Released
              </small><span className="summary-card__icon"><i className="bi bi-arrow-up-right" /></span></div>
              <h3 className="fw-bold text-danger mt-2">
                {formatCurrency(totalReleased)}
              </h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0 rounded-4 summary-card summary-card--balance">
            <div className="card-body">
              <div className="summary-card__top"><small className="text-uppercase text-muted fw-semibold">
                Balance
              </small><span className="summary-card__icon"><i className="bi bi-wallet2" /></span></div>
              <h3 className={`fw-bold mt-2 ${balance < 0 ? "text-danger" : "text-success"}`}>
                {formatCurrency(balance)}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* ================= LEDGER ================= */}
      <div className="card border-0 shadow-lg mb-4 rounded-4 overflow-hidden assistance-panel">

        <div className="card-header bg-white border-0 py-3 px-4">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

            <div>
              <div className="assistance-section-kicker">Contribution monitoring</div>
              <h5 className="fw-bold mb-1">Monthly Ledger</h5>
              <small className="text-muted">
                Contribution and assistance overview
              </small>
            </div>

            <div className="assistance-search"><i className="bi bi-search" /><input className="form-control form-control-sm" placeholder="Search month..." value={ledgerSearch} onChange={(e) => setLedgerSearch(e.target.value)} /></div>
          </div>

        </div>

        <div className="table-responsive">

          <table className="table align-middle mb-0">

            <thead className="table-light">
              <tr>
                <th className="ps-4">Month</th>
                <th className="text-center">Deaths</th>
                <th className="text-center">Active Members</th>
                <th className="text-end">Collected</th>
                <th className="text-end">Projected Fund</th>
                <th className="text-end">Released</th>
              </tr>
            </thead>

            <tbody>
              {filteredLedger.map((l) => (
                <tr
                  key={l.month}
                  className="ledger-row"
                  onClick={() => {
                    setSelectedLedger(l);
                    setShowMonthModal(true);
                  }}
                >
                  <td className="ps-4 fw-semibold">{l.month}</td>

                  <td className="text-center">
                    <span className="badge bg-danger-subtle text-danger">
                      {l.deaths}
                    </span>
                  </td>

                  <td className="text-center">
                    <span className="badge bg-info-subtle text-info">
                      {l.activeMembers}
                    </span>
                  </td>

                  <td className="text-end text-success fw-semibold">
                    {formatCurrency(l.gathered)}
                  </td>

                  <td className="text-end text-primary fw-semibold">
                    {formatCurrency(l.fund)}
                  </td>

                  <td className="text-end text-secondary fw-semibold">
                    {formatCurrency(l.released)}
                  </td>

                </tr>
              ))}

              {filteredLedger.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    No ledger records found
                  </td>
                </tr>
              )}
            </tbody>

          </table>

        </div>
      </div>

      {/* ================= EVENTS ================= */}
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden assistance-panel">

        <div className="card-header bg-white border-0 py-3 px-4">

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

            <div>
              <div className="assistance-section-kicker">Assistance releases</div>
              <h5 className="fw-bold mb-1">Death Events</h5>
              <small className="text-muted">
                Assistance release management
              </small>
            </div>

            <div className="assistance-search"><i className="bi bi-search" /><input className="form-control form-control-sm" placeholder="Search events..." value={eventSearch} onChange={(e) => setEventSearch(e.target.value)} /></div>

          </div>

        </div>

        <div className="table-responsive">

          <table className="table align-middle mb-0">

            <thead className="table-light">
              <tr>
                <th className="ps-4">Member</th>
                <th>Date</th>
                <th className="text-center">Active Members</th>
                <th className="text-end">Amount</th>
                <th className="text-center pe-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredEvents.map((e) => {
                const member = memberMap.get(Number(e.member_id));
                const monthKey = getMonthKey(e.date_of_death);
                const ledgerEntry = ledger.find((item) => item.month === monthKey);
                const activeMembers = Number(ledgerEntry?.activeMembers ?? 0);
                const amount = activeMembers * 20;

                const formattedDate = (() => {
                  const d = new Date(e.date_of_death);
                  return Number.isNaN(d.getTime())
                    ? e.date_of_death
                    : d.toLocaleDateString("en-US", { dateStyle: "medium" });
                })();

                return (
                  <tr key={e.id}>
                    <td className="ps-4"><span className="assistance-member-mark">{(member ? getFullName(member) : "?").slice(0, 1).toUpperCase()}</span><span className="fw-semibold">
                      {member ? getFullName(member) : "Unknown"}
                    </span></td>

                    <td>{formattedDate}</td>

                    <td className="text-center">
                      <span className="badge bg-info-subtle text-info">
                        {activeMembers}
                      </span>
                    </td>

                    <td className="text-end text-success fw-bold">
                      {formatCurrency(amount)}
                    </td>

                    <td className="text-center pe-4">
                      {e.status === "Pending" ? (
                        <button
                          className="btn btn-success btn-sm assistance-release-button"
                          onClick={() => releaseDeath(e.id)}
                        >
                          Release
                        </button>
                      ) : (
                        <span className="badge bg-secondary">
                          Released
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">
                    No death events found
                  </td>
                </tr>
              )}
            </tbody>

          </table>

        </div>
      </div>

      {/* ================= MODALS ================= */}
      <EventModal
        show={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={handleSaveEvent}
        form={form}
        setForm={setForm}
        members={members}
      />

      <MonthModal
        show={showMonthModal}
        selectedMonth={selectedLedger?.month ?? null}
        paymentMonth={ledgerPaymentMonth}
        onClose={() => {
          setShowMonthModal(false);
          setSelectedLedger(null);
          setMemberSearch("");
        }}
        payments={payments}
        modalMembers={modalMembers}
        activeMembers={selectedLedger?.activeMembers ?? 0}
        projectedFund={selectedLedger?.fund ?? 0}
        deaths={selectedLedger?.deaths ?? 0}
        memberSearch={memberSearch}
        setMemberSearch={setMemberSearch}
        markAsPaid={markAsPaid}
        createContributionAndMarkPaid={createContributionAndMarkPaid}
      />

    </div>
  );
}