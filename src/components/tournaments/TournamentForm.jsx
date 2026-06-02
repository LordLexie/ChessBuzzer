const VALID_TRANSITIONS = {
    draft:                ['registration_open', 'cancelled'],
    registration_open:    ['registration_closed', 'in_progress', 'cancelled'],
    registration_closed:  ['registration_open', 'in_progress'],
    paused:               ['in_progress', 'cancelled'],
    in_progress:          ['paused', 'completed', 'cancelled'],
    completed:            [],
    cancelled:            [],
};

const STATUS_LABELS = {
    draft:                'Draft',
    registration_open:    'Registration Open',
    registration_closed:  'Registration Closed',
    in_progress:          'In Progress',
    paused:               'Paused',
    completed:            'Completed',
    cancelled:            'Cancelled',
};

function TournamentForm({ form, handleChange, isEdit, locked }) {
    const nextStatuses = VALID_TRANSITIONS[form.Status] ?? [];
    const isTerminal = nextStatuses.length === 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {locked && (
                <div style={{ background: '#0d1e2e', border: '1px solid #1a3a5c', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#5BB4F8' }}>
                    This tournament is past draft — only the status can be changed.
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="cb-form-group">
                    <label className="cb-label">Name *</label>
                    <input className="cb-input" name="Name" value={form.Name} onChange={handleChange} required disabled={locked} />
                </div>
                <div className="cb-form-group">
                    <label className="cb-label">Start Date *</label>
                    <input className="cb-input" type="datetime-local" name="StartDate" value={form.StartDate} onChange={handleChange} required disabled={locked} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="cb-form-group">
                    <label className="cb-label">Duration (mins) *</label>
                    <input className="cb-input" type="number" name="Duration" value={form.Duration} onChange={handleChange} required disabled={locked} />
                </div>
                <div className="cb-form-group">
                    <label className="cb-label">Type *</label>
                    <select className="cb-input cb-select" name="TournamentType" value={form.TournamentType} onChange={handleChange} disabled={locked}>
                        <option value="arena">Arena</option>
                        <option value="swiss">Swiss</option>
                    </select>
                </div>
                <div className="cb-form-group">
                    <label className="cb-label">Time Control *</label>
                    <input className="cb-input" name="TimeControl" placeholder="e.g. 5+0" value={form.TimeControl} onChange={handleChange} required disabled={locked} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                <div className="cb-form-group">
                    <label className="cb-label">Entry Fee</label>
                    <input className="cb-input" type="number" step="0.01" name="EntryFee" value={form.EntryFee} onChange={handleChange} disabled={locked} />
                </div>
                <div className="cb-form-group">
                    <label className="cb-label">Prize Pool</label>
                    <input className="cb-input" type="number" step="0.01" name="PrizePool" value={form.PrizePool} onChange={handleChange} disabled={locked} />
                </div>
                <div className="cb-form-group">
                    <label className="cb-label">Prize Type</label>
                    <select className="cb-input cb-select" name="PrizeType" value={form.PrizeType} onChange={handleChange} disabled={locked}>
                        <option value="winner_takes_all">Winner Takes All</option>
                        <option value="fixed">Fixed Distribution</option>
                    </select>
                </div>
                <div className="cb-form-group">
                    <label className="cb-label">Fund Source</label>
                    <select className="cb-input cb-select" name="FundSourceCode" value={form.FundSourceCode} onChange={handleChange} disabled={locked}>
                        <option value="organizer">Organizer</option>
                        <option value="collections">Collections</option>
                    </select>
                </div>
            </div>

            {isEdit && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="cb-form-group">
                        <label className="cb-label">Status</label>
                        <select className="cb-input cb-select" name="Status" value={form.Status} onChange={handleChange} disabled={isTerminal}>
                            <option value={form.Status}>{STATUS_LABELS[form.Status] ?? form.Status}</option>
                            {nextStatuses.map(s => (
                                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="cb-form-group">
                <label className="cb-label">Event Link</label>
                <input className="cb-input" name="EventLink" value={form.EventLink} onChange={handleChange} disabled={locked} />
            </div>

            <div className="cb-form-group">
                <label className="cb-label">Description</label>
                <textarea className="cb-input cb-textarea" name="Description" value={form.Description} onChange={handleChange} disabled={locked} rows={3} />
            </div>
        </div>
    );
}

export default TournamentForm;
