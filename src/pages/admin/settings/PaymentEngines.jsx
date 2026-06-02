import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function PaymentEngines() {
    const [paymentEngines, setPaymentEngines] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [editingEngine, setEditingEngine] = useState(null);
    const [createForm, setCreateForm] = useState({ name: '', status: 'active' });
    const [editForm, setEditForm]   = useState({ name: '', status: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchEngines(); }, []);

    function fetchEngines() {
        setLoading(true);
        axios.get('/api/v1/payment-engine')
            .then(res => setPaymentEngines(res.data.data ?? []))
            .catch(err => console.error('Error fetching payment engines:', err))
            .finally(() => setLoading(false));
    }

    function handleCreate(e) {
        e.preventDefault();
        setSubmitting(true);
        axios.post('/api/v1/payment-engine', createForm)
            .then(() => {
                toast.success('Payment engine added successfully.');
                setShowCreate(false);
                setCreateForm({ name: '', status: 'active' });
                fetchEngines();
            })
            .catch(err => toast.error(err.response?.data?.data ?? 'Failed to create payment engine.'))
            .finally(() => setSubmitting(false));
    }

    function handleUpdate(e) {
        e.preventDefault();
        setSubmitting(true);
        axios.patch(`/api/v1/payment-engine/${editingEngine.id}`, editForm)
            .then(() => {
                toast.success('Payment engine updated successfully.');
                setEditingEngine(null);
                fetchEngines();
            })
            .catch(err => toast.error(err.response?.data?.data ?? 'Failed to update payment engine.'))
            .finally(() => setSubmitting(false));
    }

    function startEdit(engine) {
        setEditingEngine(engine);
        setEditForm({ name: engine.name, status: engine.status });
        setShowCreate(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Section header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 18, margin: 0 }}>Payment Engines</h3>
                {!showCreate && !editingEngine && (
                    <button className="cb-btn cb-btn-primary" style={{ fontSize: 13, padding: '7px 14px' }}
                        onClick={() => setShowCreate(true)}>
                        + Add Payment Engine
                    </button>
                )}
            </div>

            {/* Create form */}
            {showCreate && (
                <div className="cb-card">
                    <div className="cb-card-head">
                        <h2>New Payment Engine</h2>
                        <span className="cb-hint">
                            <button className="cb-btn cb-btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                                onClick={() => { setShowCreate(false); setCreateForm({ name: '', status: 'active' }); }}>
                                ✕
                            </button>
                        </span>
                    </div>
                    <form onSubmit={handleCreate}>
                        <div className="cb-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="cb-form-group">
                                <label className="cb-label">Name *</label>
                                <input className="cb-input" placeholder="e.g. M-Pesa" value={createForm.name}
                                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} required />
                            </div>
                            <div className="cb-form-group">
                                <label className="cb-label">Status *</label>
                                <select className="cb-input cb-select" value={createForm.status}
                                    onChange={e => setCreateForm(f => ({ ...f, status: e.target.value }))} required>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="cb-card-foot" style={{ display: 'flex', gap: 10 }}>
                            <button type="submit" className="cb-btn cb-btn-primary" disabled={submitting}>
                                {submitting ? <span className="cb-spinner sm" /> : null} Save
                            </button>
                            <button type="button" className="cb-btn cb-btn-ghost" disabled={submitting}
                                onClick={() => { setShowCreate(false); setCreateForm({ name: '', status: 'active' }); }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit form */}
            {editingEngine && (
                <div className="cb-card">
                    <div className="cb-card-head">
                        <h2>Edit — {editingEngine.code}</h2>
                        <span className="cb-hint">
                            <button className="cb-btn cb-btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }}
                                onClick={() => setEditingEngine(null)}>✕</button>
                        </span>
                    </div>
                    <form onSubmit={handleUpdate}>
                        <div className="cb-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="cb-form-group">
                                <label className="cb-label">Name</label>
                                <input className="cb-input" value={editForm.name}
                                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                            </div>
                            <div className="cb-form-group">
                                <label className="cb-label">Status</label>
                                <select className="cb-input cb-select" value={editForm.status}
                                    onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="cb-card-foot" style={{ display: 'flex', gap: 10 }}>
                            <button type="submit" className="cb-btn cb-btn-primary" disabled={submitting}>
                                {submitting ? <span className="cb-spinner sm" /> : null} Update
                            </button>
                            <button type="button" className="cb-btn cb-btn-ghost" disabled={submitting}
                                onClick={() => setEditingEngine(null)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="cb-card">
                <div className="cb-table-wrap">
                    {loading ? (
                        <div className="cb-center"><div className="cb-spinner" /></div>
                    ) : paymentEngines.length === 0 ? (
                        <div className="cb-empty">No payment engines found. Add one to get started.</div>
                    ) : (
                        <table className="cb-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentEngines.map((engine, i) => (
                                    <tr key={engine.id}>
                                        <td className="cb-muted">{i + 1}</td>
                                        <td><span className="cb-mono" style={{ fontSize: 13, color: '#8A9D92' }}>{engine.code}</span></td>
                                        <td style={{ fontWeight: 700 }}>{engine.name}</td>
                                        <td>
                                            <span className={`cb-pill ${engine.status === 'active' ? 'green' : 'coral'}`}>
                                                <span className="dot" />{engine.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="cb-btn cb-btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }}
                                                onClick={() => startEdit(engine)}>
                                                Edit
                                            </button>
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
