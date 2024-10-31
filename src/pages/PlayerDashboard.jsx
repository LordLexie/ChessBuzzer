import DashboardWrapper from '../components/layouts/DashboardWrapper'
import TopNav from '../components/layouts/TopNav'
import Sidebar from '../components/layouts/Sidebar'
import Footer from '../components/layouts/Footer';
import Aside from '../components/layouts/Aside';
function PlayerDashboard() {
    return(
  <DashboardWrapper>

    <TopNav></TopNav>
    <Sidebar></Sidebar>

<div className="content-wrapper">

<div class="content-header">
      <div class="container-fluid">
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0">Dashboard</h1>
          </div>
        </div>
      </div>
    </div>

<div className="content">
  <div className="container-fluid">
    <div className="row">

          <div class="col-md-4">

            <div class="card card-widget widget-user shadow">

              <div class="widget-user-header bg-info">
                <h3 class="widget-user-username">Alexie254</h3>
                <h5 class="widget-user-desc">Francis Alexie</h5>
              </div>

              <div class="widget-user-image">
                <img class="img-circle elevation-2" src="../assets/dist/img/user1-128x128.jpg" alt="User Avatar"/>
              </div>

              <div class="card-footer"> </div>
              
            </div>

            <div class="small-box bg-info">
              <div class="inner">
                <h3>KES 1,500</h3>

                <p>Account Balance</p>
              </div>
              <div class="icon">
                <i class="ion ion-bag"></i>
              </div>

              <div className="row" style={{paddingBottom:'5px'}}>
                <div style={{width:'50%'}}>
                <span  class="small-box-footer" style={{padding:'5px'}}>
                  <span className='btn btn-default btn-sm'>
                  Deposit <span className='fas fa-arrow-up'></span>
                  </span>
                </span>
                </div>

                <div style={{width:'50%'}}>
                <span  class="small-box-footer" style={{padding:'5px'}}>
                  <span className='btn btn-default btn-sm'>
                  Withdraw <span className='fas fa-arrow-down'></span>
                  </span>
                </span>
                </div>

              </div>
            </div> 

            <div class="small-box bg-info">
              <div class="inner">
                <h3>150</h3>

                <p>Buzz Games</p>
              </div>
              <div class="icon">
                <i class="ion ion-bag"></i>
              </div>
              
            </div>         

      </div>

      <div class="col-md-8">

      <div class="card">
              <div className="card-header">
                <h3 className="card-title">Buzz History</h3>

                <div className="card-tools">

                <span  className="btn btn-success btn-sm">
                        <i class="fas fa-plus"></i> New challenge
                      </span>
                </div>
              </div>
              
              <div class="card-body table-responsive p-0">
                <table class="table table-hover text-nowrap">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Opponent</th>
                      <th>Amount</th>                  
                      <th>Results</th>
                      <th>Action</th>                      
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>11-7-2014</td>
                      <td>Alexander Pierce</td>
                      <td>1,200</td>                    
                      <td><span class="tag tag-warning">Pending</span></td>
                      <td>Edit</td>                     
                    </tr>
                  </tbody>
                </table>
              </div>
              
            </div>

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

export default PlayerDashboard