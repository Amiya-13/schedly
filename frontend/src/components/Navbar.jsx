import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications?unreadOnly=true');
            setUnreadCount(response.data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch notifications');
        }
    };

    const getDashboardPath = () => {
        const paths = {
            'Student': '/student',
            'Event Organizer': '/organizer',
            'Faculty Mentor': '/faculty',
            'College Admin': '/admin',
            'Super Admin': '/super-admin'
        };
        return paths[user?.role] || '/';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar glass-card">
            <div className="navbar-container">
                <Link to={getDashboardPath()} className="navbar-logo">
                    <span className="logo-gradient">Schedly</span>
                </Link>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                    {showMobileMenu ? <FaTimes /> : <FaBars />}
                </button>

                {/* Navigation Links */}
                <div className={`navbar-menu ${showMobileMenu ? 'active' : ''}`}>
                    <div className="navbar-links">
                        <Link to={getDashboardPath()} className="nav-link">
                            Dashboard
                        </Link>

                        {user?.role === 'Student' && (
                            <>
                                <Link to="/student" className="nav-link">Recommendations</Link>
                                <Link to="/my-registrations" className="nav-link">My Events</Link>
                            </>
                        )}

                        {user?.role === 'Event Organizer' && (
                            <Link to="/organizer" className="nav-link">My Events</Link>
                        )}

                        {user?.role === 'Faculty Mentor' && (
                            <Link to="/faculty" className="nav-link">Approvals</Link>
                        )}

                        {(user?.role === 'College Admin' || user?.role === 'Super Admin') && (
                            <Link to="/admin" className="nav-link">Analytics</Link>
                        )}
                    </div>

                    <div className="navbar-actions">
                        {/* Notification Bell */}
                        <button className="notification-btn" onClick={() => navigate('/notifications')}>
                            <FaBell />
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                            )}
                        </button>

                        {/* Profile Dropdown */}
                        <div className="profile-dropdown">
                            <button
                                className="profile-btn"
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                            >
                                <div className="profile-avatar">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="profile-name">{user?.name}</span>
                            </button>

                            {showProfileMenu && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-header">
                                        <p className="dropdown-name">{user?.name}</p>
                                        <p className="dropdown-role">{user?.role}</p>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <Link to="/profile" className="dropdown-item">
                                        <FaUser /> Profile
                                    </Link>
                                    <button onClick={handleLogout} className="dropdown-item logout">
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
