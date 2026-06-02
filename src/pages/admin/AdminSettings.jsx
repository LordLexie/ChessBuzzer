import { useState } from 'react';
import DashboardWrapper from '../../components/layouts/DashboardWrapper';
import AdminTopNav from '../../components/layouts/AdminTopNav';
import AdminSidebar from '../../components/layouts/AdminSidebar';
import Aside from '../../components/layouts/Aside';
import Footer from '../../components/layouts/Footer';
import PaymentEngines from './settings/PaymentEngines';
import SmplypayRates from './settings/SmplypayRates';

const SECTIONS = [
    { key: 'payment-engines', label: 'Payment Engines', icon: 'fas fa-credit-card' },
    { key: 'smplypay-rates', label: 'Smplypay Rates', icon: 'fas fa-percentage' },
];

function AdminSettings() {
    const [activeSection, setActiveSection] = useState('payment-engines');

    return (
        <DashboardWrapper>
            <AdminTopNav />
            <AdminSidebar />

            <div className="content-wrapper">
                {/* Page Header */}
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            <div className="col-sm-6">
                                <h1 className="m-0">Settings</h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="content">
                    <div className="container-fluid">
                        <div className="row">

                            {/* Mini Sidebar */}
                            <div className="col-md-3">
                                <div className="card card-outline card-primary">
                                    <div className="card-header">
                                        <h3 className="card-title">Settings</h3>
                                    </div>
                                    <div className="card-body p-0">
                                        <ul className="list-group list-group-flush">
                                            {SECTIONS.map(section => (
                                                <li
                                                    key={section.key}
                                                    className={`list-group-item list-group-item-action p-0 ${activeSection === section.key ? 'active' : ''}`}
                                                >
                                                    <button
                                                        className="btn btn-link w-100 text-left px-3 py-2 text-decoration-none"
                                                        style={{ color: activeSection === section.key ? '#fff' : 'inherit' }}
                                                        onClick={() => setActiveSection(section.key)}
                                                    >
                                                        <i className={`${section.icon} mr-2`}></i>
                                                        {section.label}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Content Panel */}
                            <div className="col-md-9">
                                <div className="card">
                                    <div className="card-body">
                                        {activeSection === 'payment-engines' && <PaymentEngines />}
                                        {activeSection === 'smplypay-rates' && <SmplypayRates />}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <Aside />
            <Footer />
        </DashboardWrapper>
    );
}

export default AdminSettings;
