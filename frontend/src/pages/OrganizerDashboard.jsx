import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const OrganizerDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [events, setEvents] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        title: '', description: '', category: 'Technical',
        startDate: '', endDate: '', venue: '', capacity: 100, bannerImage: ''
    });

    useEffect(() => {
        if (activeTab === 'events' || activeTab === 'registrations') {
            fetchMyEvents();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'registrations' && selectedEventId) {
            fetchRegistrations(selectedEventId);
        }
    }, [selectedEventId, activeTab]);

    const fetchMyEvents = async () => {
        try {
            const res = await api.get('/events');
            const myEvents = res.data.events.filter(e => 
                (e.organizer?._id || e.organizer) === user._id
            );
            setEvents(myEvents);
        } catch (error) {
            console.error('Failed to fetch events');
        }
    };

    const fetchRegistrations = async (eventId) => {
        try {
            const res = await api.get(`/registrations/event/${eventId}`);
            setRegistrations(res.data.registrations || []);
        } catch (error) {
            console.error('Failed to fetch registrations');
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await api.post('/events', formData);
            setMessage('Event created successfully!');
            setFormData({ title: '', description: '', category: 'Technical', startDate: '', endDate: '', venue: '', capacity: 100, bannerImage: '' });
            setTimeout(() => { setMessage(''); setActiveTab('events'); }, 1500);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error creating event');
        } finally {
            setLoading(false);
        }
    };

    const submitForReview = async (id) => {
        try {
            await api.post(`/events/${id}/submit`);
            fetchMyEvents();
        } catch (error) {
            alert('Failed to submit event for review');
        }
    };

    const handleMarkAttendance = async (regId, attended) => {
        try {
            await api.put(`/registrations/${regId}/attendance`, { attended });
            fetchRegistrations(selectedEventId); // Refresh list
        } catch (error) {
            alert('Failed to update attendance');
        }
    };

    const renderDashboard = () => (
        <div className="glass-card fade-in">
            <h1>🎪 Event Organizer Dashboard</h1>
            <p>Create and manage your events through the approval workflow.</p>
            <div className="feature-grid">
                <div className="feature-card" onClick={() => setActiveTab('create')} style={{ cursor: 'pointer' }}>
                    <h3>➕ Create Event</h3>
                    <p>Draft a new event proposal</p>
                </div>
                <div className="feature-card" onClick={() => setActiveTab('events')} style={{ cursor: 'pointer' }}>
                    <h3>📋 My Events</h3>
                    <p>View and manage all your events</p>
                </div>
                <div className="feature-card" onClick={() => setActiveTab('registrations')} style={{ cursor: 'pointer' }}>
                    <h3>👥 Registrations & Attendance</h3>
                    <p>Track participant registrations and mark attendance</p>
                </div>
            </div>
        </div>
    );

    const renderCreateEvent = () => (
        <div className="glass-card fade-in">
            <button className="btn btn-outline mb-md" onClick={() => setActiveTab('dashboard')}>← Back</button>
            <h2>Create New Event</h2>
            {message && <p className={message.includes('successfully') ? 'text-success' : 'text-error'}>{message}</p>}
            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input className="form-input" required placeholder="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                <textarea className="form-input" required placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="4" />
                <select className="form-input" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Social', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{flex: 1}}><label>Start Date</label><input type="datetime-local" className="form-input" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
                    <div style={{flex: 1}}><label>End Date</label><input type="datetime-local" className="form-input" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} /></div>
                </div>
                <input className="form-input" required placeholder="Venue / Location" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} />
                <input className="form-input" required type="number" min="1" placeholder="Capacity" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} />
                <input className="form-input" placeholder="Banner Image URL (optional)" value={formData.bannerImage} onChange={e => setFormData({...formData, bannerImage: e.target.value})} />
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Event'}</button>
            </form>
        </div>
    );

    const renderMyEvents = () => (
        <div className="glass-card fade-in">
            <button className="btn btn-outline mb-md" onClick={() => setActiveTab('dashboard')}>← Back</button>
            <h2>My Events</h2>
            {events.length === 0 ? <p>No events found. Go draft one!</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {events.map(event => (
                        <div key={event._id} style={{ padding: '1rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3>{event.title}</h3>
                                    <p style={{ margin: '0.5rem 0' }}>Status: <strong>{event.status}</strong> | Capacity: {event.registrationCount}/{event.capacity}</p>
                                </div>
                                {event.status === 'Draft' && (
                                    <button className="btn btn-primary" onClick={() => submitForReview(event._id)}>
                                        Submit for Review
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderRegistrations = () => (
        <div className="glass-card fade-in">
            <button className="btn btn-outline mb-md" onClick={() => setActiveTab('dashboard')}>← Back</button>
            <h2>Registrations & Attendance</h2>
            <select className="form-input mb-md" value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
                <option value="">Select an Event...</option>
                {events.map(e => <option key={e._id} value={e._id}>{e.title} ({e.status})</option>)}
            </select>

            {selectedEventId && (
                <div>
                    {registrations.length === 0 ? <p>No registrations for this event yet.</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--gray-200)', textAlign: 'left' }}>
                                    <th style={{ padding: '0.5rem' }}>Student Name</th>
                                    <th style={{ padding: '0.5rem' }}>Email</th>
                                    <th style={{ padding: '0.5rem' }}>Status</th>
                                    <th style={{ padding: '0.5rem' }}>Attendance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.map(reg => (
                                    <tr key={reg._id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                        <td style={{ padding: '0.5rem' }}>{reg.student?.name || 'Unknown'}</td>
                                        <td style={{ padding: '0.5rem' }}>{reg.student?.email || 'N/A'}</td>
                                        <td style={{ padding: '0.5rem' }}>{reg.status}</td>
                                        <td style={{ padding: '0.5rem' }}>
                                            {reg.attended ? (
                                                <button className="btn btn-outline text-success" onClick={() => handleMarkAttendance(reg._id, false)}>Present (Click to Undo)</button>
                                            ) : (
                                                <button className="btn btn-outline" onClick={() => handleMarkAttendance(reg._id, true)}>Mark Present</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );

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
                    {activeTab === 'dashboard' && renderDashboard()}
                    {activeTab === 'create' && renderCreateEvent()}
                    {activeTab === 'events' && renderMyEvents()}
                    {activeTab === 'registrations' && renderRegistrations()}
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;
