import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const MyRegistrations = () => {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyRegistrations();
    }, []);

    const fetchMyRegistrations = async () => {
        try {
            const res = await api.get('/registrations/my');
            setRegistrations(res.data.registrations || []);
        } catch (error) {
            console.error('Failed to fetch registrations', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this registration?')) return;
        try {
            await api.delete(`/registrations/${id}`);
            fetchMyRegistrations();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cancel registration');
        }
    };

    return (
        <div className="dashboard-page">
            <div className="container mt-xl">
                <div className="glass-card fade-in">
                    <h2>🎟️ My Registrations</h2>
                    <p className="mb-lg">Track your event enrollments and download certificates.</p>

                    {loading ? <div className="spinner"></div> : registrations.length === 0 ? (
                        <p>You haven't registered for any events yet. Go discover some!</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {registrations.map(reg => (
                                <div key={reg._id} style={{ padding: '1rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ margin: 0 }}>{reg.event?.title || 'Unknown Event'}</h3>
                                            <p style={{ margin: '0.25rem 0 0.5rem 0', color: 'var(--gray-600)' }}>
                                                {new Date(reg.event?.startDate).toLocaleDateString()} at {reg.event?.venue}
                                            </p>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <span className="badge" style={{ background: 'var(--gray-200)' }}>Status: {reg.status}</span>
                                                <span className="badge" style={{ background: reg.attended ? 'var(--success)' : 'var(--warning)', color: reg.attended ? 'white' : 'black' }}>
                                                    {reg.attended ? 'Attended' : 'Pending Attendance'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            {reg.certificateUrl ? (
                                                <a href={reg.certificateUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginRight: '0.5rem' }}>
                                                    Download Certificate
                                                </a>
                                            ) : (
                                                <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginRight: '1rem' }}>No Certificate Yet</span>
                                            )}
                                            <button className="btn btn-outline" style={{ borderColor: 'var(--error)', color: 'var(--error)' }} onClick={() => handleCancel(reg._id)}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyRegistrations;
