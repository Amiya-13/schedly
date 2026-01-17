const Unauthorized = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <div className="glass-card">
                <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</h1>
                <h2>Access Denied</h2>
                <p style={{ color: 'var(--gray-600)' }}>
                    You don't have permission to access this page.
                </p>
                <button onClick={() => window.history.back()} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;
