function LoginPageWrapper({ children }) {
    return (
        <div className="hold-transition login-page">
            <div className="login-box">
                {children}
            </div>
        </div>
    )
}

export default LoginPageWrapper