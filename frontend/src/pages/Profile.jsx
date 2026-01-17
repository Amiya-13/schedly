import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Profile.css';

const INTERESTS = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Social'];

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        department: user?.department || '',
        year: user?.year || '',
        interests: user?.interests || []
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleInterestToggle = (interest) => {
        const currentInterests = formData.interests;
        const updatedInterests = currentInterests.includes(interest)
            ? currentInterests.filter(i => i !== interest)
            : [...currentInterests, interest];

        setFormData({ ...formData, interests: updatedInterests });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await api.put('/auth/profile', formData);
            updateUser(response.data.user);
            setMessage('Profile updated successfully!');
            setEditing(false);
        } catch (error) {
            setMessage(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-container glass-card">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <h1>{user?.name}</h1>
                        <span className="badge badge-published">{user?.role}</span>
                    </div>

                    {message && (
                        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
                            {message}
                        </div>
                    )}

                    {!editing ? (
                        <div className="profile-info">
                            <div className="info-row">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{user?.email}</span>
                            </div>
                            {user?.department && (
                                <div className="info-row">
                                    <span className="info-label">Department:</span>
                                    <span className="info-value">{user?.department}</span>
                                </div>
                            )}
                            {user?.year && (
                                <div className="info-row">
                                    <span className="info-label">Year:</span>
                                    <span className="info-value">{user?.year}</span>
                                </div>
                            )}
                            {user?.interests && user.interests.length > 0 && (
                                <div className="info-row">
                                    <span className="info-label">Interests:</span>
                                    <div className="interests-display">
                                        {user.interests.map(interest => (
                                            <span key={interest} className="badge badge-draft">{interest}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <button onClick={() => setEditing(true)} className="btn btn-primary">
                                Edit Profile
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {['Student', 'Event Organizer', 'Faculty Mentor'].includes(user?.role) && (
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        className="form-input"
                                        value={formData.department}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}

                            {user?.role === 'Student' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Year</label>
                                        <select
                                            name="year"
                                            className="form-select"
                                            value={formData.year}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Year</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Interests</label>
                                        <div className="interests-grid">
                                            {INTERESTS.map(interest => (
                                                <button
                                                    key={interest}
                                                    type="button"
                                                    className={`interest-tag ${formData.interests.includes(interest) ? 'active' : ''}`}
                                                    onClick={() => handleInterestToggle(interest)}
                                                >
                                                    {interest}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" onClick={() => setEditing(false)} className="btn btn-outline">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
