import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

import useAuth from '../hooks/useAuth';
import DashboardWrapper from '../components/layouts/DashboardWrapper';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import TournamentForm from '../components/tournaments/TournamentForm';
import { Icons } from '../components/ui/Icons';

const EMPTY_FORM = {
    Name: '',
    Description: '',
    StartDate: '',
    Duration: '',
    TournamentType: 'arena',
    GameType: 'standard',
    TimeControl: '',
    EventLink: '',
    EntryFee: 0,
    PrizePool: 0,
    PrizeType: 'winner_takes_all',
    FundSourceCode: 'organizer',
};

function TournamentCreate() {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ ...EMPTY_FORM, OrganizerId: auth.user_id });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        setSubmitting(true);
        const payload = {
            ...form,
            OrganizerId: auth.user_id,
            Duration: parseInt(form.Duration),
            EntryFee: parseFloat(form.EntryFee),
            PrizePool: parseFloat(form.PrizePool),
            StartDate: new Date(form.StartDate).toISOString(),
            Description: form.Description || undefined,
            EventLink: form.EventLink || undefined,
        };
        axios.post('/api/v1/tournament', payload)
            .then(() => {
                toast.success('Tournament created');
                navigate('/tournaments');
            })
            .catch(err => toast.error(err.response?.data?.Data ?? 'Failed to create tournament'))
            .finally(() => setSubmitting(false));
    };

    return (
        <DashboardWrapper>
            <Sidebar />
            <div className="cb-main">
                <TopNav />
                <div className="cb-body">
                    <div style={{ maxWidth: 860 }}>
                        <div className="cb-card">
                            <div className="cb-card-head">
                                <Icons.grid size={20} />
                                <h2>New Tournament</h2>
                            </div>
                            <div className="cb-card-body">
                                <TournamentForm
                                    form={form}
                                    handleChange={handleChange}
                                    isEdit={false}
                                />
                            </div>
                            <div className="cb-card-foot" style={{ display: 'flex', gap: 10 }}>
                                <button className="cb-btn cb-btn-ghost" onClick={() => navigate('/tournaments')}>
                                    Cancel
                                </button>
                                <button className="cb-btn cb-btn-primary" onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? <span className="cb-spinner sm" /> : null}
                                    Create Tournament
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default TournamentCreate;
