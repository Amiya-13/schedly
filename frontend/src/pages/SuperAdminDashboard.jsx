import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const SuperAdminDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="dashboard-page">
            <nav className="dashboard-nav glass-card">
                <h2>Schedly</h2>
                <div className="nav-actions">
                    <span>Welcome, {user?.name}!</span>
                    <button onClick={logout} className="btn btn-outline">Logout</button>
                </div>
            </nav>

            <div className="container">
                <div className="dashboard-content">
                    <div className="glass-card fade-in">
                        <h1>👑 Super Admin Dashboard</h1>
                        <p>Complete system control and user management.</p>

                        <div className="feature-grid">
                            <div className="feature-card">
                                <h3>👥 User Management</h3>
                                <p>Create, edit, and manage all users</p>
                                <span className="badge badge-draft">Coming Soon</span>
                            </div>

                            <div className="feature-card">
                                <h3>🎯 Override Approvals</h3>
                                <p>Approve/reject any event at any stage</p>
                                <span className="badge badge-draft">Coming Soon</span>
                            </div>

                            <div className="feature-card">
                                <h3>📊 System Analytics</h3>
                                <p>Comprehensive system-wide reports</p>
                                <span className="badge badge-draft">Coming Soon</span>
                            </div>

                            <div className="feature-card">
                                <h3>🔧 System Settings</h3>
                                <p>Configure system parameters</p>
                                <span className="badge badge-draft">Coming Soon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
