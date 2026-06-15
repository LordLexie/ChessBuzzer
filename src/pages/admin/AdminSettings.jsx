import { useState } from 'react';
import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import { Icons } from '../../components/ui/Icons';
import PaymentEngines from './settings/PaymentEngines';
import SmplypayRates from './settings/SmplypayRates';

const SECTIONS = [
    { key: 'payment-engines', label: 'Payment Engines', icon: 'coins' },
    { key: 'smplypay-rates',  label: 'Smplypay Rates',  icon: 'swap'  },
];

function AdminSettings() {
    const [activeSection, setActiveSection] = useState('payment-engines');

    return (
        <DashboardWrapper>
            <AdminSidebar />
            <div className="cb-main">
                <AdminTopNav />
                <div className="cb-body">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
                        <h1 style={{ flex: 1, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: '-.02em' }}>
                            Settings
                        </h1>
                    </div>

                    {/* Section tabs */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                        {SECTIONS.map(s => {
                            const Icon = Icons[s.icon];
                            return (
                                <button
                                    key={s.key}
                                    className={'cb-btn ' + (activeSection === s.key ? 'cb-btn-primary' : 'cb-btn-ghost')}
                                    style={{ fontSize: 13, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                                    onClick={() => setActiveSection(s.key)}
                                >
                                    <Icon size={15} />
                                    {s.label}
                                </button>
                            );
                        })}
                    </div>

                    {activeSection === 'payment-engines' && <PaymentEngines />}
                    {activeSection === 'smplypay-rates'  && <SmplypayRates />}
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default AdminSettings;
