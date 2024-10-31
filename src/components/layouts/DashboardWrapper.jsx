function DashboardWrapper({ children }) {

    return (
        <div className="hold-transition sidebar-mini" >
        <div className="wrapper">
            {children}
        </div>
        </div>
    )
}

export default DashboardWrapper