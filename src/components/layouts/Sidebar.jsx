function Sidebar() {
    return (
        <aside className="main-sidebar sidebar-dark-primary elevation-4">

                <span href="index3.html" className="brand-link">
                <img src="./assets/dist/img/AdminLTELogo.png" alt="AdminLTE Logo" className="brand-image img-circle elevation-3"  />
                <span className="brand-text font-weight-light">Chess Buzzer</span>
                </span>

                <div className="sidebar">

                <nav className="mt-2">
                <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                
                    <li className="nav-item">
                    <a href="#" className="nav-link">
                    <i className="nav-icon far fa-circle text-danger"></i>
                    <p className="text">Home</p>
                    </a>
                    </li>

                    <li class="nav-item">
                    <a href="#" className="nav-link">
                    <i className="nav-icon far fa-circle text-success"></i>
                    <p className="text">Transactions</p>
                    </a>
                    </li>
                    
                </ul>
                </nav>
                
                </div>

        </aside>
    )
}

export default Sidebar