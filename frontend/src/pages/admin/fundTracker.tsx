import { useEffect, useMemo, useState } from "react";

import {
  createFundEventAPI,
  getFundEventsAPI,
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

  const filteredEvents = fundEvents.filter((event) => {
    const query = search.toLowerCase();
    return [event.event, event.description, event.fund_type, event.status, event.event_date]
      .some((value) => value.toLowerCase().includes(query));
  });

  const formatCurrency = (value: number) => `PHP ${Number(value || 0).toLocaleString()}`;

  const openForm = () => {
    setForm({ ...emptyForm, eventDate: new Date().toISOString().slice(0, 10) });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
  };

  const saveEvent = async () => {
    if (!form.event || !form.description || !form.amount || !form.eventDate) return;

    await createFundEventAPI({
      fundType: form.fundType,
      event: form.event,
      description: form.description,
      amount: Number(form.amount),
      eventDate: form.eventDate,
      status: form.status,
    });

    await loadFundEvents();
    closeForm();
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-success" /></div>;
  }

  return (
    <div className="container-fluid py-4 px-3">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Fund Tracker</h2>
          <p className="text-muted mb-0">Manage retirement, benefits, and administrative funds from one view.</p>
        </div>
        <button className="btn btn-danger rounded-pill px-4" onClick={openForm}><i className="bi bi-plus-lg me-2" />Add Fund Event</button>
      </div>

      <div className="row g-3 mb-4">
        {(Object.keys(fundLabels) as FundType[]).map((fundType) => (
          <div className="col-md-4" key={fundType}>
            <div className="card border-0 shadow-sm h-100"><div className="card-body">
              <small className="text-uppercase text-muted fw-semibold">{fundLabels[fundType]}</small>
              <h3 className={`fw-bold mt-2 mb-0 ${availableTotals[fundType] < 0 ? "text-danger" : "text-success"}`}>{formatCurrency(availableTotals[fundType])}</h3>
              <small className="text-muted">Payments {formatCurrency(paymentTotals[fundType])} - Events {formatCurrency(reductionTotals[fundType])}</small>
            </div></div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4"><div className="card border-0 shadow-sm"><div className="card-body"><small className="text-muted">Total From Payments</small><h4 className="text-primary mb-0 mt-2">{formatCurrency(totalPayments)}</h4></div></div></div>
        <div className="col-md-4"><div className="card border-0 shadow-sm"><div className="card-body"><small className="text-muted">Total Event Reductions</small><h4 className="text-danger mb-0 mt-2">{formatCurrency(totalReductions)}</h4></div></div></div>
        <div className="col-md-4"><div className="card border-0 shadow-sm"><div className="card-body"><small className="text-muted">Total Available Funds</small><h4 className={`${totalAvailable < 0 ? "text-danger" : "text-success"} mb-0 mt-2`}>{formatCurrency(totalAvailable)}</h4></div></div></div>
      </div>

      <div className="card border-0 shadow-lg overflow-hidden">
        <div className="card-header bg-white border-0 p-4"><div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div><h5 className="fw-bold mb-1">Fund Events</h5><small className="text-muted">Record fund activity with an event, description, amount, and date.</small></div>
          <input className="form-control form-control-sm" style={{ maxWidth: 260 }} placeholder="Search fund events..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div></div>
        <div className="table-responsive"><table className="table align-middle mb-0">
          <thead className="table-light"><tr><th className="ps-4">Fund</th><th>Event</th><th>Description</th><th>Date</th><th className="text-end">Amount</th><th className="text-center pe-4">Status</th></tr></thead>
          <tbody>
            {filteredEvents.map((event) => <tr key={event.id}><td className="ps-4 fw-semibold">{fundLabels[event.fund_type]}</td><td>{event.event}</td><td className="text-muted">{event.description}</td><td>{event.event_date.slice(0, 10)}</td><td className="text-end fw-bold">{formatCurrency(event.amount)}</td><td className="text-center pe-4"><span className="badge bg-secondary">{event.status}</span></td></tr>)}
            {filteredEvents.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-5">No fund events found.</td></tr>}
          </tbody>
        </table></div>
      </div>

      {showForm && <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}><div className="modal-dialog modal-dialog-centered"><div className="modal-content p-3">
        <h5 className="mb-3">Add Fund Event</h5>
        <label className="form-label">Fund</label>
        <select className="form-select mb-3" value={form.fundType} onChange={(event) => setForm({ ...form, fundType: event.target.value as FundType })}>{(Object.keys(fundLabels) as FundType[]).map((fundType) => <option key={fundType} value={fundType}>{fundLabels[fundType]}</option>)}</select>
        <label className="form-label">Event</label>
        <input className="form-control mb-3" placeholder="e.g. Funeral benefit release" value={form.event} onChange={(event) => setForm({ ...form, event: event.target.value })} />
        <label className="form-label">Description</label>
        <textarea className="form-control mb-3" rows={3} placeholder="Describe the fund activity" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <div className="row g-3 mb-4"><div className="col-sm-6"><label className="form-label">Amount</label><input type="number" min="0" className="form-control" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></div><div className="col-sm-6"><label className="form-label">Date</label><input type="date" className="form-control" value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} /></div></div>
        <label className="form-label">Status</label>
        <select className="form-select mb-4" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as FundEvent["status"] })}><option>Recorded</option><option>Approved</option><option>Cancelled</option></select>
        <div className="d-flex justify-content-end gap-2"><button className="btn btn-secondary" onClick={closeForm}>Cancel</button><button className="btn btn-danger" onClick={saveEvent} disabled={!form.event || !form.description || !form.amount || !form.eventDate}>Save Event</button></div>
      </div></div></div>}
    </div>
  );
}
