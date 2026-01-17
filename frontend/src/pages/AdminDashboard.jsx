import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import api from '../services/api';
import { FaChartLine, FaCalendar, FaUsers, FaClock } from 'react-icons/fa';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [activeTab, setActiveTab] = useState('pending');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [eventsRes, analyticsRes] = await Promise.all([
                api.get('/events'),
                api.get('/analytics/dashboard')
            ]);
            setEvents(eventsRes.data.events || []);
            setAnalytics(analyticsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (eventId) => {
        try {
            await api.post(`/events/${eventId}/admin-approve`);
            setMessage('✅ Event approved and published!');
            fetchData();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(`❌ ${error.message || 'Approval failed'}`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const pendingEvents = events.filter(e => e.status === 'Faculty Approved');
    const publishedEvents = events.filter(e => e.status === 'Published');
    const completedEvents = events.filter(e => e.status === 'Completed');

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="admin-dashboard">
                <div className="container">
                    {/* Header */}
                    <div className="admin-header glass-card fade-in">
                        <h1>🏛️ College Admin Dashboard</h1>
                        <p>Final approval and system analytics</p>
                    </div>

                    {message && (
                        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
                            {message}
                        </div>
                    )}

                    {/* Analytics Cards */}
                    {analytics && (
                        <div className="analytics-grid fade-in">
                            <div className="analytics-card glass-card">
                                <div className="analytics-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                    <FaCalendar />
                                </div>
                                <div className="analytics-content">
                                    <span className="analytics-value">{analytics.totalEvents}</span>
                                    <span className="analytics-label">Total Events</span>
                                </div>
                            </div>

                            <div className="analytics-card glass-card">
                                <div className="analytics-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                                    <FaUsers />
                                </div>
                                <div className="analytics-content">
                                    <span className="analytics-value">{analytics.totalRegistrations}</span>
                                    <span className="analytics-label">Total Registrations</span>
                                </div>
                            </div>

                            <div className="analytics-card glass-card">
                                <div className="analytics-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                                    <FaUsers />
                                </div>
                                <div className="analytics-content">
                                    <span className="analytics-value">{analytics.totalStudents}</span>
                                    <span className="analytics-label">Active Students</span>
                                </div>
                            </div>

                            <div className="analytics-card glass-card">
                                <div className="analytics-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                                    <FaClock />
                                </div>
                                <div className="analytics-content">
                                    <span className="analytics-value">{analytics.pendingApprovals}</span>
                                    <span className="analytics-label">Pending Approvals</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="dashboard-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            ⏳ Pending Approval ({pendingEvents.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'published' ? 'active' : ''}`}
                            onClick={() => setActiveTab('published')}
                        >
                            ✅ Published ({publishedEvents.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                            onClick={() => setActiveTab('completed')}
                        >
                            🏁 Completed ({completedEvents.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            📊 Analytics
                        </button>
                    </div>

                    {/* Pending Tab */}
                    {activeTab === 'pending' && (
                        <div className="tab-content fade-in">
                            {pendingEvents.length === 0 ? (
                                <div className="empty-state glass-card">
                                    <h3>⏳ No Pending Approvals</h3>
                                    <p>All faculty-approved events have been reviewed!</p>
                                </div>
                            ) : (
                                <div className="approval-list">
                                    {pendingEvents.map(event => (
                                        <div key={event._id} className="approval-card glass-card">
                                            <div className="approval-header">
                                                <div>
                                                    <h3>{event.title}</h3>
                                                    <p className="event-organizer">By {event.organizer?.name} - Approved by Faculty</p>
                                                </div>
                                                <button onClick={() => handleApprove(event._id)} className="btn btn-primary">
                                                    Approve & Publish
                                                </button>
                                            </div>
                                            <p className="event-description">{event.description.substring(0, 200)}...</p>
                                            <div className="event-details-row">
                                                <span className="badge badge-approved">{event.category}</span>
                                                <span>📅 {new Date(event.startDate).toLocaleDateString()}</span>
                                                <span>📍 {event.venue}</span>
                                                <span>👥 {event.capacity} capacity</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Published Tab */}
                    {activeTab === 'published' && (
                        <div className="tab-content fade-in">
                            <div className="events-grid">
                                {publishedEvents.map(event => (
                                    <EventCard key={event._id} event={event} showActions={false} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed Tab */}
                    {activeTab === 'completed' && (
                        <div className="tab-content fade-in">
                            <div className="events-grid">
                                {completedEvents.map(event => (
                                    <EventCard key={event._id} event={event} showActions={false} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && analytics && (
                        <div className="tab-content fade-in">
                            <div className="analytics-section glass-card">
                                <h2>📊 System Overview</h2>
                                <p>Comprehensive analytics coming soon with charts and detailed reports!</p>
                                <div className="analytics-placeholder">
                                    <FaChartLine size={80} color="var(--primary)" />
                                    <p>Charts will be integrated using Recharts library</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
