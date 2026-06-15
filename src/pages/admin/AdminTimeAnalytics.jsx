import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from 'recharts';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';

const DAYS = [
    { key: 'all', label: 'All days' },
    { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' }, { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' },
];

const RANGES = [
    { key: '30d', label: 'Last 30 days', days: 30 },
    { key: '90d', label: 'Last 90 days', days: 90 },
];

const GRID = '#243029';
const TICK = '#8A9D92';
const TOOLTIP_STYLE = { background: '#121C18', border: '1px solid #243029', color: '#E8F1EB', borderRadius: 10, fontSize: 13 };

function formatLabel(label) {
    return label.replace('am', ' AM').replace('pm', ' PM');
}

function fmtK(v) {
    return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);
}

function AdminTimeAnalytics() {
    const [selectedDay, setSelectedDay] = useState('all');
    const [range, setRange]             = useState('30d');
    const [cache, setCache]             = useState({});
    const [loading, setLoading]         = useState(false);

    useEffect(() => {
        const rangeDef = RANGES.find(r => r.key === range);
        const days = rangeDef.days;
        if (cache[days]) return;

        setLoading(true);
        axios.get(`/api/v1/admin/analytics/time?range=${days}`)
            .then(res => setCache(prev => ({ ...prev, [days]: res.data.data })))
            .catch(() => toast.error('Failed to load time analytics.'))
            .finally(() => setLoading(false));
    }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

    const days       = RANGES.find(r => r.key === range).days;
    const rangeData  = cache[days];
    const hourlyData = rangeData ? rangeData[selectedDay] : null;

    const peakEntry  = hourlyData ? hourlyData.reduce((a, b) => b.games > a.games ? b : a) : null;
    const quietEntry = hourlyData ? hourlyData.reduce((a, b) => b.games < a.games ? b : a) : null;
    const viewingLabel = selectedDay === 'all'
        ? 'All days'
        : selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1);

    return (
        <DashboardWrapper>
            <AdminSidebar />
            <div className="cb-main">
                <AdminTopNav />
                <div className="cb-body">
                    {/* KPI mini-stats */}
                    <div className="cb-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                        <div className="cb-stat s-green">
                            <div className="cb-stat ic"><Icons.clock size={22} /></div>
                            <div className="lab">Peak Hour</div>
                            <div className="big" style={{ fontSize: 20 }}>
                                {peakEntry ? formatLabel(peakEntry.label) : '—'}
                            </div>
                        </div>
                        <div className="cb-stat s-gold">
                            <div className="cb-stat ic"><Icons.trophy size={22} /></div>
                            <div className="lab">Peak Games/hr</div>
                            <div className="big">{peakEntry ? peakEntry.games.toLocaleString() : '—'}</div>
                        </div>
                        <div className="cb-stat s-coral">
                            <div className="cb-stat ic"><Icons.clock size={22} /></div>
                            <div className="lab">Quiet Hour</div>
                            <div className="big" style={{ fontSize: 20 }}>
                                {quietEntry ? formatLabel(quietEntry.label) : '—'}
                            </div>
                        </div>
                        <div className="cb-stat s-green">
                            <div className="cb-stat ic"><Icons.calendar size={22} /></div>
                            <div className="lab">Viewing</div>
                            <div className="big" style={{ fontSize: 20 }}>{viewingLabel}</div>
                        </div>
                    </div>

                    {/* Chart card */}
                    <div className="cb-card">
                        <div className="cb-card-head">
                            <Icons.chart size={18} />
                            <h2>Game Activity — {range === '30d' ? 'Last 30 Days' : 'Last 90 Days'} (EAT)</h2>
                            <span className="cb-hint">
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {RANGES.map(({ key, label }) => (
                                        <button key={key} className={`cb-tab ${range === key ? 'active' : ''}`} onClick={() => setRange(key)}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </span>
                        </div>
                        <div className="cb-card-body">
                            <div className="cb-tabs" style={{ padding: '0 0 18px' }}>
                                {DAYS.map(({ key, label }) => (
                                    <button key={key} className={`cb-tab ${selectedDay === key ? 'active' : ''}`} onClick={() => setSelectedDay(key)}>
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {(loading || !hourlyData) ? (
                                <div className="cb-center"><div className="cb-spinner" /></div>
                            ) : (
                                <ResponsiveContainer width="100%" height={320}>
                                    <AreaChart data={hourlyData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#3BE089" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#3BE089" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                                        <XAxis dataKey="label" interval={0} tick={{ fill: TICK, fontSize: 10, angle: -45, textAnchor: 'end' }} tickLine={false} axisLine={false} height={55} />
                                        <YAxis tickFormatter={fmtK} tick={{ fill: TICK, fontSize: 11 }} tickLine={false} axisLine={false}
                                            label={{ value: 'Games played', angle: -90, position: 'insideLeft', fill: TICK, fontSize: 11, dx: -4 }} />
                                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [v.toLocaleString(), 'Games']} labelFormatter={l => `Hour: ${formatLabel(l)}`} cursor={{ stroke: GRID, strokeWidth: 1 }} />
                                        <Area type="monotone" dataKey="games" stroke="#3BE089" strokeWidth={2} fill="url(#areaGrad)"
                                            dot={{ fill: '#3BE089', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#5BE09A', strokeWidth: 0 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default AdminTimeAnalytics;
