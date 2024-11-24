import PropTypes from 'prop-types';

function LoginPageWrapper({ children }) {
    return (
        <div className="hold-transition login-page">
            <div className="login-box">
                {children}
            </div>
        </div>
    )
}

LoginPageWrapper.propTypes = {
    children: PropTypes.node.isRequired,
};

export default LoginPageWrapper
