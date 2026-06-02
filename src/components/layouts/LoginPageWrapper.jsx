import PropTypes from 'prop-types';

function LoginPageWrapper({ children }) {
    return (
        <div className="cb-auth-page">
            {children}
        </div>
    );
}

LoginPageWrapper.propTypes = {
    children: PropTypes.node.isRequired,
};

export default LoginPageWrapper;
