import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';
import api from '../services/api';
import './StudentDashboard.css';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('recommendations');
    const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch recommendations
            const recsResponse = await api.get('/recommendations');
            setRecommendations(recsResponse.data.recommendations || []);

            // Fetch my registrations
            const regsResponse = await api.get('/registrations/my');
            const myRegs = regsResponse.data.registrations || [];
            setRegisteredEvents(myRegs);
            setRegisteredEventIds(new Set(myRegs.map(r => r.event._id)));

            // Fetch all events
            const eventsResponse = await api.get('/recommendations/browse');
            setAllEvents(eventsResponse.data.events || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (eventId) => {
        try {
            await api.post('/registrations', { eventId });
            setMessage('✅ Successfully registered for event!');
            setTimeout(() => setMessage(''), 3000);
            fetchData(); // Refresh data
        } catch (error) {
            setMessage(`❌ ${error.message || 'Registration failed'}`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading your personalized dashboard...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="student-dashboard">
                <div className="container">
                    {/* Welcome Section */}
                    <div className="welcome-section glass-card fade-in">
                        <div className="welcome-content">
                            <h1>Welcome back, {user?.name}! 🎓</h1>
                            <p>Discover events tailored to your interests and passions</p>
                            {user?.interests && user.interests.length > 0 && (
                                <div className="interests-display">
                                    <span className="interests-label">Your Interests:</span>
                                    {user.interests.map(interest => (
                                        <span key={interest} className="interest-pill">{interest}</span>
                                    ))}
                                    <Link to="/profile" className="edit-interests-link">Edit</Link>
                                </div>
                            )}
                        </div>
                        <div className="quick-stats">
                            <div className="stat-card">
                                <span className="stat-number">{registeredEvents.length}</span>
                                <span className="stat-label">Registered Events</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-number">{recommendations.length}</span>
                                <span className="stat-label">Recommendations</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-number">{allEvents.length}</span>
                                <span className="stat-label">Available Events</span>
                            </div>
                        </div>
                    </div>

                    {/* Message Alert */}
                    {message && (
                        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
                            {message}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="dashboard-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
                            onClick={() => setActiveTab('recommendations')}
                        >
                            🎯 For You ({recommendations.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'registered' ? 'active' : ''}`}
                            onClick={() => setActiveTab('registered')}
                        >
                            📅 My Events ({registeredEvents.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
                            onClick={() => setActiveTab('browse')}
                        >
                            🔍 Browse All ({allEvents.length})
                        </button>
                    </div>

                    {/* Recommendations Tab */}
                    {activeTab === 'recommendations' && (
                        <div className="tab-content fade-in">
                            {recommendations.length === 0 ? (
                                <div className="empty-state glass-card">
                                    <h3>🤖 No Recommendations Yet</h3>
                                    <p>We need to know your interests to show personalized recommendations!</p>
                                    <Link to="/profile" className="btn btn-primary">
                                        Add Your Interests
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="section-header">
                                        <h2>🎯 Recommended For You</h2>
                                        <p>AI-powered suggestions based on your interests</p>
                                    </div>
                                    <div className="events-grid">
                                        {recommendations.map(event => (
                                            <EventCard
                                                key={event._id}
                                                event={event}
                                                onRegister={handleRegister}
                                                isRegistered={registeredEventIds.has(event._id)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Registered Events Tab */}
                    {activeTab === 'registered' && (
                        <div className="tab-content fade-in">
                            {registeredEvents.length === 0 ? (
                                <div className="empty-state glass-card">
                                    <h3>📅 No Registered Events</h3>
                                    <p>You haven't registered for any events yet. Explore recommendations or browse all events!</p>
                                    <button onClick={() => setActiveTab('recommendations')} className="btn btn-primary">
                                        View Recommendations
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="section-header">
                                        <h2>📅 Your Registered Events</h2>
                                        <p>Events you've signed up for</p>
                                    </div>
                                    <div className="events-grid">
                                        {registeredEvents.map(reg => (
                                            <EventCard
                                                key={reg._id}
                                                event={reg.event}
                                                showActions={true}
                                                isRegistered={true}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Browse All Tab */}
                    {activeTab === 'browse' && (
                        <div className="tab-content fade-in">
                            {allEvents.length === 0 ? (
                                <div className="empty-state glass-card">
                                    <h3>🔍 No Events Available</h3>
                                    <p>There are no published events at the moment. Check back later!</p>
                                </div>
                            ) : (
                                <>
                                    <div className="section-header">
                                        <h2>🔍 All Available Events</h2>
                                        <p>Browse all published events</p>
                                    </div>
                                    <div className="events-grid">
                                        {allEvents.map(event => (
                                            <EventCard
                                                key={event._id}
                                                event={event}
                                                onRegister={handleRegister}
                                                isRegistered={registeredEventIds.has(event._id)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default StudentDashboard;
