import DashboardWrapper from '../components/layouts/DashboardWrapper'
import TopNav from '../components/layouts/TopNav'
import Sidebar from '../components/layouts/Sidebar'
import Footer from '../components/layouts/Footer';
import Aside from '../components/layouts/Aside';
function StarterPage() {
    return(
  <DashboardWrapper>

    <TopNav></TopNav>
    <Sidebar></Sidebar>

<div className="content-wrapper">

<div className="content-header">
  <div className="container-fluid">
    <div className="row mb-2">
      <div className="col-sm-12">
        <h1 className="m-0">Starter Page</h1>
      </div>
    </div>
  </div>
</div>

<div className="content">
  <div className="container-fluid">
    <div className="row">

      <div className="col-lg-6">
      Page content goes here
      </div>
      
    </div>
    
  </div>
</div>

</div>

<Aside />
<Footer/>
</DashboardWrapper>
);
}

export default StarterPage