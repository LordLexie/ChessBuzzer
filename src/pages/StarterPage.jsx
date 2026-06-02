import DashboardWrapper from '../components/layouts/DashboardWrapper';
import TopNav from '../components/layouts/TopNav';
import Sidebar from '../components/layouts/Sidebar';

function StarterPage() {
    return (
        <DashboardWrapper>
            <Sidebar />
            <div className="cb-main">
                <TopNav />
                <div className="cb-body">
                    <p className="cb-muted">Starter Page</p>
                </div>
            </div>
        </DashboardWrapper>
    );
}

export default StarterPage;
