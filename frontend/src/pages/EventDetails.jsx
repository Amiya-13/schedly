import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaClock, FaUser, FaArrowLeft } from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../services/api';
import './EventDetails.css';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [auditTrail, setAuditTrail] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const response = await api.get(`/events/${id}`);
            setEvent(response.data.event);
            setAuditTrail(response.data.auditTrail || []);

            // Check if already registered
            if (user?.role === 'Student') {
                try {
                    const regsResponse = await api.get('/registrations/my');
                    const isReg = regsResponse.data.registrations.some(r => r.event._id === id);
                    setIsRegistered(isReg);
                } catch (err) {
                    console.error('Failed to check registration status');
                }
            }
        } catch (error) {
            console.error('Failed to fetch event:', error);
            setMessage('Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        try {
            await api.post('/registrations', { eventId: id });
            setMessage('✅ Successfully registered!');
            setIsRegistered(true);
            fetchEventDetails(); // Refresh data
        } catch (error) {
            setMessage(`❌ ${error.message || 'Registration failed'}`);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            </>
        );
    }

    if (!event) {
        return (
            <>
                <Navbar />
                <div className="container">
                    <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <h2>Event Not Found</h2>
                        <button onClick={() => navigate(-1)} className="btn btn-primary">
                            Go Back
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const isFull = event.registrationCount >= event.capacity;
    const canRegister = user?.role === 'Student' && event.status === 'Published' && !isFull && !isRegistered;

    return (
        <>
            <Navbar />
            <div className="event-details-page">
                <div className="container">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <FaArrowLeft /> Back
                    </button>

                    {message && (
                        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
                            {message}
                        </div>
                    )}

                    <div className="event-details-container">
                        {/* Event Header */}
                        <div className="event-header glass-card">
                            <div className="event-banner-large">
                                {event.bannerImage ? (
                                    <img src={event.bannerImage} alt={event.title} />
                                ) : (
                                    <div className="banner-placeholder">
                                        <span style={{ fontSize: '5rem' }}>🎯</span>
                                    </div>
                                )}
                            </div>

                            <div className="event-header-content">
                                <div className="event-meta-row">
                                    <span className={`badge ${event.status === 'Published' ? 'badge-published' : 'badge-draft'}`}>
                                        {event.status}
                                    </span>
                                    <span className="event-category-badge">{event.category}</span>
                                </div>

                                <h1 className="event-title-large">{event.title}</h1>

                                <div className="event-info-grid">
                                    <div className="info-item">
                                        <FaCalendar className="info-icon" />
                                        <div>
                                            <span className="info-label">Date</span>
                                            <span className="info-value">{format(new Date(event.startDate), 'MMMM dd, yyyy')}</span>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <FaClock className="info-icon" />
                                        <div>
                                            <span className="info-label">Time</span>
                                            <span className="info-value">
                                                {format(new Date(event.startDate), 'h:mm a')} - {format(new Date(event.endDate), 'h:mm a')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <FaMapMarkerAlt className="info-icon" />
                                        <div>
                                            <span className="info-label">Venue</span>
                                            <span className="info-value">{event.venue}</span>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <FaUsers className="info-icon" />
                                        <div>
                                            <span className="info-label">Capacity</span>
                                            <span className="info-value">
                                                {event.registrationCount || 0} / {event.capacity} registered
                                            </span>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <FaUser className="info-icon" />
                                        <div>
                                            <span className="info-label">Organizer</span>
                                            <span className="info-value">{event.organizer?.name}</span>
                                        </div>
                                    </div>
                                </div>

                                {canRegister && (
                                    <button onClick={handleRegister} className="btn btn-primary btn-large">
                                        Register Now
                                    </button>
                                )}

                                {isRegistered && (
                                    <button className="btn btn-outline btn-large" disabled>
                                        ✓ Registered
                                    </button>
                                )}

                                {isFull && event.status === 'Published' && (
                                    <button className="btn btn-outline btn-large" disabled>
                                        Event Full
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Event Description */}
                        <div className="event-section glass-card">
                            <h2>About This Event</h2>
                            <p className="event-description-full">{event.description}</p>

                            {event.tags && event.tags.length > 0 && (
                                <div className="event-tags-section">
                                    <h3>Tags</h3>
                                    <div className="tags-list">
                                        {event.tags.map(tag => (
                                            <span key={tag} className="tag-pill">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Audit Trail */}
                        {auditTrail.length > 0 && (
                            <div className="event-section glass-card">
                                <h2>Approval History</h2>
                                <div className="audit-timeline">
                                    {auditTrail.map((log, index) => (
                                        <div key={log._id} className="audit-item">
                                            <div className="audit-marker"></div>
                                            <div className="audit-content">
                                                <div className="audit-header">
                                                    <span className="audit-action">{log.action}</span>
                                                    <span className="audit-time">
                                                        {format(new Date(log.timestamp), 'MMM dd, yyyy h:mm a')}
                                                    </span>
                                                </div>
                                                <div className="audit-actor">{log.actor?.name} ({log.actor?.role})</div>
                                                {log.remarks && <div className="audit-remarks">"{log.remarks}"</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default EventDetails;
