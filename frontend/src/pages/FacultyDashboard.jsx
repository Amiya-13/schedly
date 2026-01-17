import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import api from '../services/api';
import './FacultyDashboard.css';

const FacultyDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [message, setMessage] = useState('');
    const [reviewingEvent, setReviewingEvent] = useState(null);
    const [reviewRemarks, setReviewRemarks] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/events');
            setEvents(response.data.events || []);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (eventId) => {
        try {
            await api.post(`/events/${eventId}/faculty-review`, {
                approve: true,
                remarks: reviewRemarks || 'Approved'
            });
            setMessage('✅ Event approved successfully!');
            setReviewingEvent(null);
            setReviewRemarks('');
            fetchEvents();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(`❌ ${error.message || 'Approval failed'}`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleReject = async (eventId) => {
        if (!reviewRemarks.trim()) {
            setMessage('❌ Please provide remarks for rejection');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        try {
            await api.post(`/events/${eventId}/faculty-review`, {
                approve: false,
                remarks: reviewRemarks
            });
            setMessage('✅ Event rejected');
            setReviewingEvent(null);
            setReviewRemarks('');
            fetchEvents();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(`❌ ${error.message || 'Rejection failed'}`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const pendingEvents = events.filter(e => e.status === 'Submitted');
    const approvedEvents = events.filter(e => ['Faculty Approved', 'Admin Approved', 'Published'].includes(e.status));
    const rejectedEvents = events.filter(e => e.status === 'Faculty Rejected');

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
            <div className="faculty-dashboard">
                <div className="container">
                    {/* Header */}
                    <div className="dashboard-header glass-card fade-in">
                        <div>
                            <h1>👨‍🏫 Faculty Mentor Dashboard</h1>
                            <p>Review and approve student event proposals</p>
                        </div>
                        <div className="stats-row">
                            <div className="stat-box">
                                <span className="stat-num">{pendingEvents.length}</span>
                                <span className="stat-label">Pending</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-num">{approvedEvents.length}</span>
                                <span className="stat-label">Approved</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-num">{rejectedEvents.length}</span>
                                <span className="stat-label">Rejected</span>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
                            {message}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="dashboard-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                            onClick={() => setActiveTab('pending')}
                        >
                            ⏳ Pending Review ({pendingEvents.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
                            onClick={() => setActiveTab('approved')}
                        >
                            ✅ Approved ({approvedEvents.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'rejected' ? 'active' : ''}`}
                            onClick={() => setActiveTab('rejected')}
                        >
                            ❌ Rejected ({rejectedEvents.length})
                        </button>
                    </div>

                    {/* Pending Tab */}
                    {activeTab === 'pending' && (
                        <div className="tab-content fade-in">
                            {pendingEvents.length === 0 ? (
                                <div className="empty-state glass-card">
                                    <h3>⏳ No Pending Reviews</h3>
                                    <p>All submitted events have been reviewed!</p>
                                </div>
                            ) : (
                                <div className="review-list">
                                    {pendingEvents.map(event => (
                                        <div key={event._id} className="review-card glass-card">
                                            <div className="review-card-content">
                                                <div className="event-info">
                                                    <h3>{event.title}</h3>
                                                    <p className="event-desc">{event.description.substring(0, 150)}...</p>
                                                    <div className="event-meta-row">
                                                        <span className="badge badge-submitted">{event.category}</span>
                                                        <span className="organizer-info">
                                                            📅 By {event.organizer?.name} ({event.organizer?.department})
                                                        </span>
                                                    </div>
                                                </div>

                                                {reviewingEvent === event._id ? (
                                                    <div className="review-form">
                                                        <textarea
                                                            className="form-textarea"
                                                            placeholder="Enter your remarks (required for rejection)"
                                                            value={reviewRemarks}
                                                            onChange={(e) => setReviewRemarks(e.target.value)}
                                                            rows={3}
                                                        />
                                                        <div className="review-actions">
                                                            <button onClick={() => handleApprove(event._id)} className="btn btn-primary">
                                                                ✓ Approve
                                                            </button>
                                                            <button onClick={() => handleReject(event._id)} className="btn btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
                                                                ✗ Reject
                                                            </button>
                                                            <button onClick={() => { setReviewingEvent(null); setReviewRemarks(''); }} className="btn btn-outline">
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="review-actions">
                                                        <button onClick={() => setReviewingEvent(event._id)} className="btn btn-primary">
                                                            Review Event
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Approved Tab */}
                    {activeTab === 'approved' && (
                        <div className="tab-content fade-in">
                            {approvedEvents.length === 0 ? (
                                <div className="empty-state glass-card">
                                    <h3>✅ No Approved Events</h3>
                                    <p>You haven't approved any events yet.</p>
                                </div>
                            ) : (
                                <div className="events-grid">
                                    {approvedEvents.map(event => (
                                        <EventCard key={event._id} event={event} showActions={false} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rejected Tab */}
                    {activeTab === 'rejected' && (
                        <div className="tab-content fade-in">
                            {rejectedEvents.length === 0 ? (
                                <div className="empty-state glass-card">
                                    <h3>❌ No Rejected Events</h3>
                                    <p>You haven't rejected any events.</p>
                                </div>
                            ) : (
                                <div className="events-grid">
                                    {rejectedEvents.map(event => (
                                        <EventCard key={event._id} event={event} showActions={false} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FacultyDashboard;
