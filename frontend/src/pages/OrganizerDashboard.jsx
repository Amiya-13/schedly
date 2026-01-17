import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const OrganizerDashboard = () => {
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
                        <h1>🎪 Event Organizer Dashboard</h1>
                        <p>Create and manage your events through the approval workflow.</p>

                        <div className="feature-grid">
                            <div className="feature-card">
                                <h3>➕ Create Event</h3>
                                <p>Draft a new event proposal</p>
                                <span className="badge badge-draft">Coming Soon</span>
                            </div>

                            <div className="feature-card">
                                <h3>📋 My Events</h3>
                                <p>View and manage all your events</p>
                                <span className="badge badge-draft">Coming Soon</span>
                            </div>

                            <div className="feature-card">
                                <h3>👥 Registrations</h3>
                                <p>Track participant registrations</p>
                                <span className="badge badge-draft">Coming Soon</span>
                            </div>

                            <div className="feature-card">
                                <h3>✅ Mark Attendance</h3>
                                <p>Record participant attendance</p>
                                <span className="badge badge-draft">Coming Soon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;
