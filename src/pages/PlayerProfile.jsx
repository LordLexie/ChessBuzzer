import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import DashboardWrapper from '../components/layouts/DashboardWrapper';
import { Icons } from '../components/ui/Icons';

function PlayerProfile() {
    const { auth } = useAuth();
    const userId = auth.user_id;

    const [profile, setProfile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ email: '', phone: '' });

    const fetchProfile = () => {
        axios.get(`api/v1/user/${userId}`).then(res => {
            if (res.data.status === 'Ok') {
                const data = res.data.data;
                setProfile(data);
                setForm({ email: data.email ?? '', phone: data.phone ?? '' });
            }
        });
    };

    useEffect(() => { fetchProfile(); }, []);

    const handleInput = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);
        axios.patch('api/v1/user/profile', { email: form.email, phone: form.phone || null })
            .then(res => {
                if (res.data.status === 'Ok') {
                    toast.success('Profile updated successfully.');
                    fetchProfile();
                } else {
                    toast.error(res.data.data || 'Could not update profile.');
                }
            })
            .catch(err => toast.error(err.response?.data?.data || 'An unexpected error occurred.'))
            .finally(() => setSaving(false));
    };

    const initial = (auth.username || 'U')[0].toUpperCase();

    return (
        <DashboardWrapper>
            <Sidebar />
            <div className="cb-main">
                <TopNav />
                <div className="cb-body">
                    <div style={{ maxWidth: 520 }}>
                        <div className="cb-card">
                            <div className="cb-card-head">
                                <Icons.user size={20} />
                                <h2>My Profile</h2>
                            </div>

                            {profile ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="cb-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6 }}>
                                            <div className="cb-avatar lg">{initial}</div>
                                            <div>
                                                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 20 }}>
                                                    {profile.username}
                                                </div>
                                                <div className="cb-muted" style={{ fontSize: 13, marginTop: 2 }}>
                                                    {profile.status === 'active'
                                                        ? <span className="cb-green">● Verified</span>
                                                        : <span style={{ color: '#F2C14E' }}>● Unverified</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="cb-form-group">
                                            <label className="cb-label">Username</label>
                                            <input className="cb-input" type="text" value={profile.username} readOnly disabled />
                                        </div>

                                        <div className="cb-form-group">
                                            <label className="cb-label">Email</label>
                                            <input
                                                className="cb-input"
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleInput}
                                                required
                                            />
                                        </div>

                                        <div className="cb-form-group">
                                            <label className="cb-label">Phone</label>
                                            <input
                                                className="cb-input"
                                                type="text"
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleInput}
                                                placeholder="254XXXXXXXXX"
                                            />
                                            <span className="cb-form-hint">International format, e.g. 254719671440</span>
                                        </div>
                                    </div>

                                    <div className="cb-card-foot">
                                        <button type="submit" className="cb-btn cb-btn-primary" disabled={saving}>
                                            {saving ? <><span className="cb-spinner sm" /> Saving…</> : 'Save changes'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="cb-center">
                                    <div className="cb-spinner" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default PlayerProfile;
