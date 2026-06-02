import PropTypes from 'prop-types';

function DashboardWrapper({ children }) {
    return (
        <div className="cb-layout">
            {children}
        </div>
    );
}

DashboardWrapper.propTypes = {
    children: PropTypes.node.isRequired,
};

export default DashboardWrapper;
