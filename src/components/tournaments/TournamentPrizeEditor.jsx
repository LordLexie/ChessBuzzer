import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ordinal = n => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const positionIcon = pos => {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return null;
};

function TournamentPrizeEditor({ tournamentId, prizes, onPrizesChange, disabled }) {
    const [newPosition, setNewPosition] = useState('');
    const [newPercentage, setNewPercentage] = useState('');
    const [adding, setAdding] = useState(false);

    const total = prizes.reduce((sum, p) => sum + (p.percentage ?? 0), 0);
    const roundedTotal = Math.round(total * 10) / 10;
    const remaining = Math.round((100 - roundedTotal) * 10) / 10;
    const hasWinner = prizes.some(p => p.position === 1);
    const sumMatches = roundedTotal === 100;

    const barColor = sumMatches ? '#3BE089' : roundedTotal >= 75 ? '#F2C14E' : '#5BB4F8';

    const handleAdd = () => {
        const pos = parseInt(newPosition);
        const pct = parseFloat(newPercentage);
        if (!pos || pos < 1 || isNaN(pct) || pct <= 0 || pct > 100) {
            toast.error('Enter a valid position (≥ 1) and percentage (0–100)');
            return;
        }
        if (prizes.some(p => p.position === pos)) { toast.error(`Position ${pos} already exists`); return; }
        if (Math.round((total + pct) * 10) / 10 > 100) {
            toast.error(`Adding ${pct}% would exceed 100% (currently at ${roundedTotal}%)`); return;
        }
        setAdding(true);
        axios.post(`/api/v1/tournament/${tournamentId}/prizes`, {
            TournamentID: parseInt(tournamentId), Position: pos, Percentage: pct,
        })
            .then(() => axios.get(`/api/v1/tournament/${tournamentId}/prizes`))
            .then(res => { onPrizesChange(res.data?.data ?? []); setNewPosition(''); setNewPercentage(''); })
            .catch(err => toast.error(err.response?.data?.Data ?? 'Failed to add prize'))
            .finally(() => setAdding(false));
    };

    const handleDelete = (prize) => {
        axios.delete(`/api/v1/tournament-prize/${prize.id ?? prize.ID}`)
            .then(() => onPrizesChange(prizes.filter(p => (p.id ?? p.ID) !== (prize.id ?? prize.ID))))
            .catch(err => toast.error(err.response?.data?.Data ?? 'Failed to delete prize'));
    };

    const sorted = [...prizes].sort((a, b) => a.position - b.position);

    return (
        <div style={{ marginTop: 26 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{ flex: 1, height: 1, background: '#243029' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#8A9D92', letterSpacing: '.12em', textTransform: 'uppercase' }}>Prize Distribution</span>
                <div style={{ flex: 1, height: 1, background: '#243029' }} />
            </div>

            {prizes.length > 0 && !hasWinner && (
                <div style={{ background: '#2a160f', border: '1px solid #4a2010', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#FF6A3D', marginBottom: 14 }}>
                    A 1st place prize is required before opening registration.
                </div>
            )}

            {sorted.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                    {sorted.map(p => {
                        const icon = positionIcon(p.position);
                        const pct = p.percentage ?? 0;
                        return (
                            <div key={p.id ?? p.ID} style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                background: '#16221C', border: '1px solid #2E3C34',
                                borderRadius: 11, padding: '10px 16px',
                            }}>
                                <span style={{ fontWeight: 700, minWidth: 80, fontSize: 14, color: p.position <= 3 ? '#F2C14E' : '#E8F1EB' }}>
                                    {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
                                    {ordinal(p.position)}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div className="cb-pctbar" style={{ gap: 8 }}>
                                        <div className="track" style={{ flex: 1 }}>
                                            <div className="fill" style={{ width: `${pct}%`, background: barColor }} />
                                        </div>
                                    </div>
                                </div>
                                <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 14, minWidth: 52, textAlign: 'right', color: '#F2C14E' }}>
                                    {pct.toFixed(1)}%
                                </span>
                                {!disabled && (
                                    <button type="button"
                                        style={{ background: 'none', border: 'none', color: '#FF6A3D', cursor: 'pointer', fontSize: 15, padding: 4, lineHeight: 1 }}
                                        onClick={() => handleDelete(p)} title="Remove">
                                        ✕
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    <div style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                            <span className="cb-muted" style={{ fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Total Allocated</span>
                            <span style={{ fontWeight: 700, fontFamily: "'Space Mono',monospace", color: sumMatches ? '#3BE089' : '#FF6A3D' }}>
                                {roundedTotal.toFixed(1)}% / 100%
                            </span>
                        </div>
                        <div style={{ background: '#16221C', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                            <div style={{
                                width: `${Math.min(roundedTotal, 100)}%`, height: '100%',
                                background: barColor, borderRadius: 99, transition: 'width .4s ease',
                            }} />
                        </div>
                        {sumMatches && (
                            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: '#3BE089' }}>
                                ✓ Distribution complete
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!disabled && !sumMatches && (
                <div style={{ background: '#16221C', border: '1px dashed #2E3C34', borderRadius: 11, padding: '16px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                        <div className="cb-form-group" style={{ minWidth: 80 }}>
                            <label className="cb-label">Position</label>
                            <input className="cb-input" type="number" placeholder="1" value={newPosition}
                                onChange={e => setNewPosition(e.target.value)} min="1" style={{ padding: '8px 12px' }} />
                        </div>
                        <div className="cb-form-group" style={{ minWidth: 160 }}>
                            <label className="cb-label">
                                Percentage {remaining > 0 && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({remaining.toFixed(1)}% remaining)</span>}
                            </label>
                            <input className="cb-input" type="number" placeholder={remaining > 0 ? remaining.toFixed(1) : '0.0'}
                                step="0.1" value={newPercentage} onChange={e => setNewPercentage(e.target.value)}
                                min="0.1" max={remaining} style={{ padding: '8px 12px' }} />
                        </div>
                        <button type="button" className="cb-btn cb-btn-primary" onClick={handleAdd} disabled={adding}>
                            {adding ? <span className="cb-spinner sm" /> : '+'}
                            Add Prize
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TournamentPrizeEditor;
