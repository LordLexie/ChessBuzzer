import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

export default function SmplypayRates() {
    const [rates, setRates]             = useState([]);
    const [loading, setLoading]         = useState(true);
    const [showCreate, setShowCreate]   = useState(false);
    const [editingRate, setEditingRate] = useState(null);
    const [createForm, setCreateForm]   = useState({ payment_engine_code: '', rate_code: '', rate: 0 });
    const [editForm, setEditForm]       = useState({ rate_code: '', rate: 0 });
    const [paymentEngines, setPaymentEngines] = useState([]);
    const [submitting, setSubmitting]   = useState(false);

    useEffect(() => { fetchRates(); fetchPaymentEngines(); }, []);

    function fetchRates() {
        setLoading(true);
        axios.get('/api/v1/smplypay-rates')
            .then(res => setRates(res.data.data ?? []))
            .catch(err => console.error('Error fetching smplypay rates:', err))
            .finally(() => setLoading(false));
    }

    function fetchPaymentEngines() {
        axios.get('/api/v1/payment-engine')
            .then(res => setPaymentEngines(res.data.data ?? []))
            .catch(err => console.error('Error fetching payment engines:', err));
    }

    function handleCreate(e) {
        e.preventDefault();
        setSubmitting(true);
        axios.post('/api/v1/smplypay-rates', createForm)
            .then(() => {
                toast.success('Rate added successfully.');
                setShowCreate(false);
                setCreateForm({ payment_engine_code: '', rate_code: '', rate: 0 });
                fetchRates();
            })
            .catch(err => toast.error(err.response?.data?.data ?? 'Failed to create rate.'))
            .finally(() => setSubmitting(false));
    }

    function handleUpdate(e) {
        e.preventDefault();
        setSubmitting(true);
        axios.patch(`/api/v1/smplypay-rates/${editingRate.id}`, editForm)
            .then(() => {
                toast.success('Rate updated successfully.');
                setEditingRate(null);
                fetchRates();
            })
            .catch(err => toast.error(err.response?.data?.data ?? 'Failed to update rate.'))
            .finally(() => setSubmitting(false));
    }

    function handleDelete(rate) {
        Swal.fire({
            title: 'Delete Rate?',
            text: `Are you sure you want to delete the rate for ${rate.payment_engine_code}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#FF6A3D',
            cancelButtonColor: '#243029',
            confirmButtonText: 'Yes, delete it!',
            background: '#121C18',
            color: '#E8F1EB',
        }).then(result => {
            if (result.isConfirmed) {
                axios.delete(`/api/v1/smplypay-rates/${rate.id}`)
                    .then(() => { toast.success('Rate deleted.'); fetchRates(); })
                    .catch(err => toast.error(err.response?.data?.data ?? 'Failed to delete rate.'));
            }
        });
    }

    function startEdit(rate) {
        setEditingRate(rate);
        setEditForm({ rate_code: rate.rate_code, rate: rate.rate });
        setShowCreate(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 18, margin: 0 }}>Smplypay Rates</h3>
                {!showCreate && !editingRate && (
                    <button className="cb-btn cb-btn-primary" style={{ fontSize: 13, padding: '7px 14px' }}
                        onClick={() => setShowCreate(true)}>
                        + Add Rate
                    </button>
                )}
            </div>

            {/* Create form */}
            {showCreate && (
                <div className="cb-card">
                    <div className="cb-card-head">
                        <h2>New Rate</h2>
                        <span className="cb-hint">
                            <button className="cb-btn cb-btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                                onClick={() => { setShowCreate(false); setCreateForm({ payment_engine_code: '', rate_code: '', rate: 0 }); }}>✕</button>
                        </span>
                    </div>
                    <form onSubmit={handleCreate}>
                        <div className="cb-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="cb-form-group">
                                <label className="cb-label">Payment Engine *</label>
                                <select className="cb-input cb-select" value={createForm.payment_engine_code}
                                    onChange={e => setCreateForm(f => ({ ...f, payment_engine_code: e.target.value }))} required>
                                    <option value="">— Select a payment engine —</option>
                                    {paymentEngines.filter(e => e.status === 'active').map(e => (
                                        <option key={e.id} value={e.code}>{e.name} ({e.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="cb-form-group">
                                <label className="cb-label">Rate Code *</label>
                                <input className="cb-input" placeholder="e.g. STK_PUSH" value={createForm.rate_code}
                                    onChange={e => setCreateForm(f => ({ ...f, rate_code: e.target.value }))} required />
                            </div>
                            <div className="cb-form-group">
                                <label className="cb-label">Rate</label>
                                <input className="cb-input" type="number" step="0.01" min="0" value={createForm.rate}
                                    onChange={e => setCreateForm(f => ({ ...f, rate: parseFloat(e.target.value) || 0 }))} />
                            </div>
                        </div>
                        <div className="cb-card-foot" style={{ display: 'flex', gap: 10 }}>
                            <button type="submit" className="cb-btn cb-btn-primary" disabled={submitting}>
                                {submitting ? <span className="cb-spinner sm" /> : null} Save
                            </button>
                            <button type="button" className="cb-btn cb-btn-ghost" disabled={submitting}
                                onClick={() => { setShowCreate(false); setCreateForm({ payment_engine_code: '', rate_code: '', rate: 0 }); }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit form */}
            {editingRate && (
                <div className="cb-card">
                    <div className="cb-card-head">
                        <h2>Edit — {editingRate.payment_engine_code}</h2>
                        <span className="cb-hint">
                            <button className="cb-btn cb-btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                                onClick={() => setEditingRate(null)}>✕</button>
                        </span>
                    </div>
                    <form onSubmit={handleUpdate}>
                        <div className="cb-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="cb-form-group">
                                <label className="cb-label">Rate Code</label>
                                <input className="cb-input" value={editForm.rate_code}
                                    onChange={e => setEditForm(f => ({ ...f, rate_code: e.target.value }))} />
                            </div>
                            <div className="cb-form-group">
                                <label className="cb-label">Rate</label>
                                <input className="cb-input" type="number" step="0.01" min="0" value={editForm.rate}
                                    onChange={e => setEditForm(f => ({ ...f, rate: parseFloat(e.target.value) || 0 }))} />
                            </div>
                        </div>
                        <div className="cb-card-foot" style={{ display: 'flex', gap: 10 }}>
                            <button type="submit" className="cb-btn cb-btn-primary" disabled={submitting}>
                                {submitting ? <span className="cb-spinner sm" /> : null} Update
                            </button>
                            <button type="button" className="cb-btn cb-btn-ghost" disabled={submitting}
                                onClick={() => setEditingRate(null)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="cb-card">
                <div className="cb-table-wrap">
                    {loading ? (
                        <div className="cb-center"><div className="cb-spinner" /></div>
                    ) : rates.length === 0 ? (
                        <div className="cb-empty">No rates found. Add one to get started.</div>
                    ) : (
                        <table className="cb-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Payment Engine</th>
                                    <th>Rate Code</th>
                                    <th>Rate</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {rates.map((rate, i) => (
                                    <tr key={rate.id}>
                                        <td className="cb-muted">{i + 1}</td>
                                        <td><span className="cb-mono" style={{ fontSize: 13, color: '#8A9D92' }}>{rate.payment_engine_code}</span></td>
                                        <td style={{ fontWeight: 700 }}>{rate.rate_code}</td>
                                        <td><span className="cb-mono gold" style={{ fontSize: 14 }}>{rate.rate}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="cb-btn cb-btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                                                    onClick={() => startEdit(rate)}>Edit</button>
                                                <button className="cb-btn cb-btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}
                                                    onClick={() => handleDelete(rate)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
