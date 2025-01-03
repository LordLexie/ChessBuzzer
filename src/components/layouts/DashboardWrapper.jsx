import PropTypes from 'prop-types';

function DashboardWrapper({ children }) {

    return (
        <div className="hold-transition sidebar-mini" >
        <div className="wrapper">
            {children}
        </div>
        </div>
    )
}

DashboardWrapper.propTypes = {
    children: PropTypes.node.isRequired,
};

export default DashboardWrapper;
