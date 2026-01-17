import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const ROLES = ['Student', 'Event Organizer', 'Faculty Mentor', 'College Admin'];
const INTERESTS = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Competition', 'Social'];

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Student',
        department: '',
        year: '',
        interests: []
    });
    const [error, setError] = useState('');
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
        setError('');
        setLoading(true);

        // Prepare data based on role
        const userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
        };

        if (['Student', 'Event Organizer', 'Faculty Mentor'].includes(formData.role)) {
            userData.department = formData.department;
        }

        if (formData.role === 'Student') {
            userData.year = parseInt(formData.year);
            userData.interests = formData.interests;
        }

        const result = await register(userData);

        if (result.success) {
            navigate('/login');
        } else {
            setError(result.error || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container glass-card fade-in">
                <div className="register-header">
                    <h1 className="text-primary">Join Schedly</h1>
                    <p className="text-gray">Create your account to get started</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="your.email@college.edu"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="Minimum 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <select
                            name="role"
                            className="form-select"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            {ROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>

                    {['Student', 'Event Organizer', 'Faculty Mentor'].includes(formData.role) && (
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <input
                                type="text"
                                name="department"
                                className="form-input"
                                placeholder="Computer Science"
                                value={formData.department}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    {formData.role === 'Student' && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Year</label>
                                <select
                                    name="year"
                                    className="form-select"
                                    value={formData.year}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Interests (Select at least one)</label>
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

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? <span className="spinner-small"></span> : 'Create Account'}
                    </button>
                </form>

                <div className="register-footer">
                    <p>Already have an account? <Link to="/login" className="text-primary">Login here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
