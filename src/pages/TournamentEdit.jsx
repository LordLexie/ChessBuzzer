import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import DashboardWrapper from '../components/layouts/DashboardWrapper';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';
import TournamentForm from '../components/tournaments/TournamentForm';
import TournamentPrizeEditor from '../components/tournaments/TournamentPrizeEditor';
import { Icons } from '../components/ui/Icons';

function TournamentEdit() {
    const { tournamentId } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [prizes, setPrizes] = useState([]);

    useEffect(() => {
        Promise.all([
            axios.get(`/api/v1/tournament/${tournamentId}`),
            axios.get(`/api/v1/tournament/${tournamentId}/prizes`),
        ])
            .then(([tRes, pRes]) => {
                const t = tRes.data?.data;
                setTournament(t);
                setForm({
                    Name: t.name ?? '',
                    Description: t.description ?? '',
                    StartDate: t.start_date ? t.start_date.substring(0, 16) : '',
                    Duration: t.duration ?? '',
                    TournamentType: t.tournament_type ?? 'arena',
                    GameType: t.game_type ?? 'standard',
                    TimeControl: t.time_control ?? '',
                    EventLink: t.event_link ?? '',
                    EntryFee: t.entry_fee ?? 0,
                    PrizePool: t.prize_pool ?? 0,
                    PrizeType: t.prize_type ?? 'winner_takes_all',
                    FundSourceCode: t.fund_source_code ?? 'organizer',
                    Status: t.status ?? 'draft',
                });
                setPrizes(pRes.data?.data ?? []);
            })
            .catch(() => {
                toast.error('Failed to load tournament');
                navigate('/tournaments');
            })
            .finally(() => setLoading(false));
    }, [tournamentId]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = e => {
        e.preventDefault();

        const doSubmit = () => {
            setSubmitting(true);
            const payload = {
                ID: tournament.ID,
                ...form,
                Duration: parseInt(form.Duration),
                EntryFee: parseFloat(form.EntryFee),
                PrizePool: parseFloat(form.PrizePool),
                StartDate: new Date(form.StartDate).toISOString(),
                Description: form.Description || undefined,
                EventLink: form.EventLink || undefined,
            };
            axios.patch(`/api/v1/tournament/${tournamentId}`, payload)
                .then(() => {
                    toast.success('Tournament updated');
                    navigate('/tournaments');
                })
                .catch(err => toast.error(err.response?.data?.data ?? 'Failed to update tournament'))
                .finally(() => setSubmitting(false));
        };

        const statusChanged = form.Status !== tournament.status;
        if (statusChanged) {
            const fmt = s => s.replace(/_/g, ' ');
            Swal.fire({
                title: 'Change Status?',
                text: `This will move the tournament from "${fmt(tournament.status)}" to "${fmt(form.Status)}".`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3BE089',
                cancelButtonColor: '#243029',
                confirmButtonText: 'Yes, change it',
                background: '#121C18',
                color: '#E8F1EB',
            }).then(result => {
                if (result.isConfirmed) doSubmit();
            });
        } else {
            doSubmit();
        }
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
                                <Icons.edit size={20} />
                                <h2>Edit Tournament</h2>
                            </div>
                            <div className="cb-card-body">
                                {loading ? (
                                    <div className="cb-center"><div className="cb-spinner" /></div>
                                ) : (
                                    <>
                                        <TournamentForm
                                            form={form}
                                            handleChange={handleChange}
                                            isEdit={true}
                                            locked={form.Status !== 'draft'}
                                        />
                                        {form.PrizeType === 'fixed' && (
                                            <TournamentPrizeEditor
                                                tournamentId={tournamentId}
                                                prizes={prizes}
                                                onPrizesChange={setPrizes}
                                                disabled={form.Status !== 'draft'}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                            {!loading && (
                                <div className="cb-card-foot" style={{ display: 'flex', gap: 10 }}>
                                    <button className="cb-btn cb-btn-ghost" onClick={() => navigate('/tournaments')}>
                                        Cancel
                                    </button>
                                    <button className="cb-btn cb-btn-primary" onClick={handleSubmit} disabled={submitting}>
                                        {submitting ? <span className="cb-spinner sm" /> : null}
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default TournamentEdit;
