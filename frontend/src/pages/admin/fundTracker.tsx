import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  createFundEventAPI,
  getFundEventsAPI,
  updateFundEventAPI,
  type FundEvent,
  type FundType,
} from "../../features/funeralassistance/api/funeralApi";
import { getPayments } from "../../features/payments/api/payments";
import type { Payment } from "../../features/shared/types";

const fundLabels: Record<FundType, string> = {
  retirement: "Retirement Fund",
  benefits: "Benefits Fund",
  admin: "Admin Fund",
};

const fundMeta: Record<FundType, { icon: string; tone: string }> = {
  retirement: { icon: "bi-piggy-bank", tone: "fund-card--blue" },
  benefits: { icon: "bi-heart-pulse", tone: "fund-card--red" },
  admin: { icon: "bi-building", tone: "fund-card--gold" },
};

const emptyForm = {
  fundType: "benefits" as FundType,
  event: "",
  description: "",
  amount: "",
  eventDate: "",
  status: "Recorded" as FundEvent["status"],
};

export default function FundTracker() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fundEvents, setFundEvents] = useState<FundEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadFundEvents = async () => {
    try {
      setFundEvents(await getFundEventsAPI());
    } catch (error) {
      console.error("Failed to load fund events", error);
      setFundEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      setPayments(await getPayments());
    } catch (error) {
      console.error("Failed to load payments", error);
      setPayments([]);
    }
  };

  useEffect(() => {
    loadFundEvents();
    loadPayments();
  }, []);

  const paymentTotals = useMemo(() => {
    return payments.reduce<Record<FundType, number>>(
      (totals, payment) => {
        totals.retirement += Number(payment.retirement || 0);
        totals.benefits += Number(payment.benefits || 0);
        totals.admin += Number(payment.admin || 0);
        return totals;
      },
      { retirement: 0, benefits: 0, admin: 0 }
    );
  }, [payments]);

  const reductionTotals = useMemo(() => {
    return fundEvents.reduce<Record<FundType, number>>(
      (totals, event) => {
        if (event.status !== "Cancelled") totals[event.fund_type] += Number(event.amount || 0);
        return totals;
      },
      { retirement: 0, benefits: 0, admin: 0 }
    );
  }, [fundEvents]);

  const availableTotals = useMemo(() => {
    return (Object.keys(fundLabels) as FundType[]).reduce<Record<FundType, number>>(
      (totals, fundType) => {
        totals[fundType] = paymentTotals[fundType] - reductionTotals[fundType];
        return totals;
      },
      { retirement: 0, benefits: 0, admin: 0 }
    );
  }, [paymentTotals, reductionTotals]);

  const totalPayments = Object.values(paymentTotals).reduce((sum, value) => sum + value, 0);
  const totalReductions = Object.values(reductionTotals).reduce((sum, value) => sum + value, 0);
  const totalAvailable = totalPayments - totalReductions;
  const committedPercent = totalPayments > 0 ? Math.min((totalReductions / totalPayments) * 100, 100) : 0;

  const filteredEvents = fundEvents.filter((event) => {
    const query = search.toLowerCase();
    return [event.event, event.description, event.fund_type, event.status, event.event_date]
      .some((value) => value.toLowerCase().includes(query));
  });

  const formatCurrency = (value: number) => `PHP ${Number(value || 0).toLocaleString()}`;

  const openForm = () => {
    setForm({ ...emptyForm, eventDate: new Date().toISOString().slice(0, 10) });
    setEditingEventId(null);
    setSaveError("");
    setShowForm(true);
  };

  const openEditForm = (fundEvent: FundEvent) => {
    setForm({
      fundType: fundEvent.fund_type,
      event: fundEvent.event,
      description: fundEvent.description,
      amount: String(fundEvent.amount),
      eventDate: fundEvent.event_date.slice(0, 10),
      status: fundEvent.status,
    });
    setEditingEventId(fundEvent.id);
    setSaveError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setEditingEventId(null);
    setSaveError("");
  };

  const saveEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const eventName = form.event.trim();
    const description = form.description.trim();

    if (!eventName || !description || !form.amount || !form.eventDate || saving) return;

    setSaving(true);
    setSaveError("");

    try {
      const eventData = {
        fundType: form.fundType,
        event: eventName,
        description,
        amount: Number(form.amount),
        eventDate: form.eventDate,
        status: form.status,
      };

      if (editingEventId) {
        await updateFundEventAPI(editingEventId, eventData);
      } else {
        await createFundEventAPI(eventData);
      }

      await loadFundEvents();
      closeForm();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save this fund event.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-success" aria-label="Loading fund tracker" /></div>;
  }

  return (
    <div className="container-fluid py-4 px-3 fund-tracker-page">
      <div className="fund-tracker-hero mb-4">
        <div>
          <span className="fund-tracker-eyebrow"><i className="bi bi-wallet2 me-2" />Financial control center</span>
          <h2 className="fw-bold mb-2">Fund Tracker</h2>
          <p className="mb-0">Keep every fund movement visible, accountable, and ready for review.</p>
        </div>
        <button className="btn btn-danger px-4 fund-tracker-action" onClick={openForm}><i className="bi bi-plus-lg me-2" />Add Fund Event</button>
      </div>

      <div className="row g-3 mb-4 fund-card-grid">
        {(Object.keys(fundLabels) as FundType[]).map((fundType) => (
          <div className="col-md-4" key={fundType}>
            <div className={`card border-0 h-100 fund-card ${fundMeta[fundType].tone}`}><div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div><small className="fund-card__label">{fundLabels[fundType]}</small><div className="fund-card__caption">Available balance</div></div>
                <span className="fund-card__icon"><i className={`bi ${fundMeta[fundType].icon}`} /></span>
              </div>
              <h3 className={`fw-bold mt-3 mb-2 ${availableTotals[fundType] < 0 ? "text-danger" : "text-dark"}`}>{formatCurrency(availableTotals[fundType])}</h3>
              <div className="fund-card__meter"><span style={{ width: `${paymentTotals[fundType] > 0 ? Math.max(0, Math.min((availableTotals[fundType] / paymentTotals[fundType]) * 100, 100)) : 0}%` }} /></div>
              <div className="d-flex justify-content-between mt-2 fund-card__details"><span>Inflow {formatCurrency(paymentTotals[fundType])}</span><span>Used {formatCurrency(reductionTotals[fundType])}</span></div>
            </div></div>
          </div>
        ))}
      </div>

      <div className="card border-0 shadow-sm mb-4 fund-overview">
        <div className="card-body">
          <div className="row align-items-center g-4">
            <div className="col-lg-5"><div className="fund-overview__label">Available funds</div><div className={`fund-overview__total ${totalAvailable < 0 ? "text-danger" : ""}`}>{formatCurrency(totalAvailable)}</div><div className="fund-overview__meta"><span>{fundEvents.length} total events</span></div></div>
            <div className="col-lg-7"><div className="d-flex justify-content-between small fw-semibold mb-2"><span>Funds committed</span><span>{committedPercent.toFixed(0)}%</span></div><div className="progress fund-overview__progress"><div className="progress-bar" style={{ width: `${committedPercent}%` }} /></div><div className="d-flex justify-content-between small text-muted mt-2"><span>Payments {formatCurrency(totalPayments)}</span><span>Reductions {formatCurrency(totalReductions)}</span></div></div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-lg overflow-hidden fund-events-panel">
        <div className="card-header bg-white border-0 p-4"><div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div><div className="d-flex align-items-center gap-2"><h5 className="fw-bold mb-0">Fund events</h5><span className="fund-events-count">{filteredEvents.length}</span></div><small className="text-muted">A running record of every allocation and release.</small></div>
          <div className="fund-search"><i className="bi bi-search" /><input className="form-control form-control-sm" placeholder="Search events, funds, or status" value={search} onChange={(event) => setSearch(event.target.value)} /><button type="button" className="fund-search__clear" onClick={() => setSearch("")} aria-label="Clear search" hidden={!search}><i className="bi bi-x-lg" /></button></div>
        </div></div>
        <div className="table-responsive"><table className="table align-middle mb-0">
          <thead className="table-light"><tr><th className="ps-4">Fund</th><th>Event</th><th>Description</th><th>Date</th><th className="text-end">Amount</th><th className="text-center pe-4">Edit</th></tr></thead>
          <tbody>
            {filteredEvents.map((event) => <tr key={event.id}><td className="ps-4"><span className={`fund-dot ${fundMeta[event.fund_type].tone}`} /> <span className="fw-semibold">{fundLabels[event.fund_type]}</span></td><td className="fw-semibold">{event.event}</td><td className="text-muted fund-event-description">{event.description}</td><td className="text-muted">{event.event_date.slice(0, 10)}</td><td className="text-end fw-bold">{formatCurrency(event.amount)}</td><td className="text-center pe-4"><button type="button" className="btn btn-sm fund-edit-button" onClick={() => openEditForm(event)}><i className="bi bi-pencil-square me-1" />Edit</button></td></tr>)}
            {filteredEvents.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-5">No fund events found.</td></tr>}
          </tbody>
        </table></div>
      </div>

      {showForm && <div className="modal d-block fund-event-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeForm()}><div className="modal-dialog modal-dialog-centered"><form className="modal-content p-3" onSubmit={saveEvent}>
        <div className="d-flex align-items-start justify-content-between mb-3"><div><span className="fund-tracker-eyebrow mb-1">Fund activity</span><h5 className="mb-0">{editingEventId ? "Edit Fund Event" : "Add Fund Event"}</h5></div><button type="button" className="btn-close" aria-label="Close" onClick={closeForm} disabled={saving} /></div>
        {saveError && <div className="alert alert-danger py-2" role="alert">{saveError}</div>}
        <label className="form-label">Fund</label>
        <select className="form-select mb-3" value={form.fundType} onChange={(event) => setForm({ ...form, fundType: event.target.value as FundType })}>{(Object.keys(fundLabels) as FundType[]).map((fundType) => <option key={fundType} value={fundType}>{fundLabels[fundType]}</option>)}</select>
        <label className="form-label">Event</label>
        <input className="form-control mb-3" placeholder="e.g. Funeral benefit release" value={form.event} onChange={(event) => setForm({ ...form, event: event.target.value })} />
        <label className="form-label">Description</label>
        <textarea className="form-control mb-3" rows={3} placeholder="Describe the fund activity" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <div className="row g-3 mb-4"><div className="col-sm-6"><label className="form-label">Amount</label><input type="number" min="0" className="form-control" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></div><div className="col-sm-6"><label className="form-label">Date</label><input type="date" className="form-control" value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} /></div></div>
        <div className="d-flex justify-content-end gap-2 mt-2"><button type="button" className="btn btn-secondary" onClick={closeForm} disabled={saving}>Cancel</button><button type="submit" className="btn btn-danger" disabled={!form.event.trim() || !form.description.trim() || !form.amount || !form.eventDate || saving}>{saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : editingEventId ? "Save Changes" : "Save Event"}</button></div>
      </form></div></div>}
    </div>
  );
}
