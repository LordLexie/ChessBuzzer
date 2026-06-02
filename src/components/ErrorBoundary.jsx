import { Component } from 'react';

/**
 * ErrorBoundary — catches unexpected React render errors so a single
 * bad component can't crash the entire app.
 *
 * Usage: wrap <Router> (or any subtree) with <ErrorBoundary>.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in development; swap for a real logger in production
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            background: '#f4f6f9',
          }}
        >
          <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
          <h2 className="mb-2">Something went wrong</h2>
          <p className="text-muted mb-4" style={{ maxWidth: 420 }}>
            An unexpected error occurred. Your data is safe — please refresh and try again.
          </p>
          <button className="btn btn-primary" onClick={this.handleReload}>
            <i className="fas fa-redo mr-2"></i>Back to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
