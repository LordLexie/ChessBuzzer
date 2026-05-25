import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from 'recharts';

import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import Aside from '../../components/layouts/Aside';
import Footer from '../../components/layouts/Footer';

// ─── API instance ─────────────────────────────────────────────────────────────

const analyticsApi = axios.create({
    baseURL: import.meta.env.VITE_ANALYTICS_API_URL ?? 'http://localhost:8000',
    headers: { 'X-Service-Key': import.meta.env.VITE_ANALYTICS_SERVICE_KEY ?? '' },
});

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
    { key: 'all', label: 'All days' },
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' },
];

const RANGES = [
    { key: '30d', label: 'Last 30 days', days: 30 },
    { key: '90d', label: 'Last 90 days', days: 90 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatLabel(label) {
    return label.replace('am', ' AM').replace('pm', ' PM');
}

function fmtK(v) {
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return String(v);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DarkStatCard({ label, value }) {
    return (
        <div style={{
            background: '#161b22',
            borderRadius: '10px',
            padding: '16px 20px',
            color: '#fff',
            flex: 1,
            minWidth: 0,
        }}>
            <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '6px', letterSpacing: '0.03em' }}>
                {label}
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {value ?? <i className="fas fa-spinner fa-spin" style={{ fontSize: '18px', color: '#334155' }} />}
            </div>
        </div>
    );
}

function PillButton({ active, onClick, children, small }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: active ? '#3b82f6' : '#1e293b',
                color:      active ? '#fff'    : '#94a3b8',
                border: 'none',
                borderRadius: '20px',
                padding: small ? '5px 14px' : '6px 16px',
                cursor: 'pointer',
                fontSize: small ? '12px' : '13px',
                fontWeight: 500,
                transition: 'background 0.15s, color 0.15s',
                whiteSpace: 'nowrap',
            }}
        >
            {children}
        </button>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AdminTimeAnalytics() {
    const [selectedDay, setSelectedDay] = useState('all');
    const [range, setRange]             = useState('30d');

    // cache: { 30: DayBreakdown, 90: DayBreakdown }
    const [cache, setCache]   = useState({});
    const [loading, setLoading] = useState(false);

    // Fetch when range changes — skip if already cached
    useEffect(() => {
        const rangeDef = RANGES.find(r => r.key === range);
        const days = rangeDef.days;
        if (cache[days]) return;

        setLoading(true);
        analyticsApi
            .get(`/time-analytics?range=${days}`)
            .then(res => setCache(prev => ({ ...prev, [days]: res.data.data })))
            .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load time analytics.' }))
            .finally(() => setLoading(false));
    }, [range]); // eslint-disable-line react-hooks/exhaustive-deps

    // Derive current dataset
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
            <AdminTopNav />
            <AdminSidebar />

            <div className="content-wrapper" style={{ background: '#0f1117' }}>

                {/* ── Header ── */}
                <div className="content-header" style={{ borderBottom: '1px solid #1e293b' }}>
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0" style={{ color: '#f1f5f9' }}>
                                    <i className="fas fa-clock mr-2" style={{ color: '#3b82f6' }}></i>
                                    Time Analytics
                                </h1>
                            </div>
                            <div className="col-sm-6 text-right">
                                <small style={{ color: '#475569' }}>platform · game activity patterns</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="content">
                    <div className="container-fluid">

                        {/* ── Stat cards ── */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            <DarkStatCard
                                label="Peak hour"
                                value={peakEntry ? formatLabel(peakEntry.label) : null}
                            />
                            <DarkStatCard
                                label="Peak games/hr"
                                value={peakEntry ? peakEntry.games.toLocaleString() : null}
                            />
                            <DarkStatCard
                                label="Quiet hour"
                                value={quietEntry ? formatLabel(quietEntry.label) : null}
                            />
                            <DarkStatCard
                                label="Viewing"
                                value={viewingLabel}
                            />
                        </div>

                        {/* ── Chart card ── */}
                        <div style={{
                            background: '#0d1117',
                            borderRadius: '12px',
                            padding: '24px',
                            border: '1px solid #1e293b',
                        }}>

                            {/* Controls row */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '10px',
                                marginBottom: '24px',
                            }}>
                                {/* Day filter pills */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {DAYS.map(({ key, label }) => (
                                        <PillButton
                                            key={key}
                                            active={selectedDay === key}
                                            onClick={() => setSelectedDay(key)}
                                        >
                                            {label}
                                        </PillButton>
                                    ))}
                                </div>

                                {/* Range toggle */}
                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                    {RANGES.map(({ key, label }) => (
                                        <PillButton
                                            key={key}
                                            active={range === key}
                                            onClick={() => setRange(key)}
                                            small
                                        >
                                            {label}
                                        </PillButton>
                                    ))}
                                </div>
                            </div>

                            {/* Chart or spinner */}
                            {(loading || !hourlyData) ? (
                                <div style={{
                                    height: 375,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <i className="fas fa-spinner fa-spin fa-2x" style={{ color: '#3b82f6' }}></i>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={320}>
                                    <AreaChart
                                        data={hourlyData}
                                        margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                                    >
                                        <defs>
                                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>

                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

                                        <XAxis
                                            dataKey="label"
                                            interval={0}
                                            tick={{ fill: '#64748b', fontSize: 10, angle: -45, textAnchor: 'end' }}
                                            tickLine={false}
                                            axisLine={false}
                                            height={55}
                                        />
                                        <YAxis
                                            tickFormatter={fmtK}
                                            tick={{ fill: '#64748b', fontSize: 11 }}
                                            tickLine={false}
                                            axisLine={false}
                                            label={{
                                                value: 'Games played',
                                                angle: -90,
                                                position: 'insideLeft',
                                                fill: '#475569',
                                                fontSize: 11,
                                                dx: -4,
                                            }}
                                        />

                                        <Tooltip
                                            contentStyle={{
                                                background: '#1e293b',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                fontSize: '13px',
                                            }}
                                            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                            formatter={v => [v.toLocaleString(), 'Games']}
                                            labelFormatter={label => `Hour: ${formatLabel(label)}`}
                                            cursor={{ stroke: '#334155', strokeWidth: 1 }}
                                        />

                                        <Area
                                            type="monotone"
                                            dataKey="games"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fill="url(#areaGrad)"
                                            dot={{ fill: '#3b82f6', r: 3, strokeWidth: 0 }}
                                            activeDot={{ r: 5, fill: '#60a5fa', strokeWidth: 0 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}

                        </div>

                    </div>
                </div>
            </div>

            <Aside />
            <Footer />
        </DashboardWrapper>
    );
}

export default AdminTimeAnalytics;
