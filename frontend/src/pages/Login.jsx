import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in
    if (user) {
        const roleRoutes = {
            'Student': '/student',
            'Event Organizer': '/organizer',
            'Faculty Mentor': '/faculty',
            'College Admin': '/admin',
            'Super Admin': '/super-admin'
        };
        navigate(roleRoutes[user.role] || '/');
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            // Navigate based on role using fresh user data
            const roleRoutes = {
                'Student': '/student',
                'Event Organizer': '/organizer',
                'Faculty Mentor': '/faculty',
                'College Admin': '/admin',
                'Super Admin': '/super-admin'
            };
            navigate(roleRoutes[result.user.role] || '/');
        } else {
            setError(result.error || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container glass-card fade-in">
                <div className="login-header">
                    <h1 className="text-primary">Welcome to Schedly</h1>
                    <p className="text-gray">Smart College Event Management</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
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
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? <span className="spinner-small"></span> : 'Login'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Don't have an account? <Link to="/register" className="text-primary">Register here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
