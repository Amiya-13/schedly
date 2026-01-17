import { Link } from 'react-router-dom';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';
import './EventCard.css';

const EventCard = ({ event, showActions = true, onRegister, isRegistered = false }) => {
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'Draft': 'badge-draft',
            'Submitted': 'badge-submitted',
            'Faculty Approved': 'badge-approved',
            'Faculty Rejected': 'badge-rejected',
            'Admin Approved': 'badge-approved',
            'Published': 'badge-published',
            'Completed': 'badge-completed',
            'Archived': 'badge-archived'
        };
        return statusMap[status] || 'badge-draft';
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Technical': '💻',
            'Cultural': '🎭',
            'Sports': '⚽',
            'Workshop': '🛠️',
            'Seminar': '📚',
            'Competition': '🏆',
            'Social': '🤝',
            'Other': '📌'
        };
        return icons[category] || '📌';
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    const formatTime = (dateString) => {
        try {
            return format(new Date(dateString), 'h:mm a');
        } catch {
            return '';
        }
    };

    const getSpotsLeft = () => {
        const left = event.capacity - (event.registrationCount || 0);
        return left > 0 ? left : 0;
    };

    const isFull = event.registrationCount >= event.capacity;

    return (
        <div className="event-card glass-card">
            {/* Event Banner */}
            <div className="event-banner">
                {event.bannerImage ? (
                    <img src={event.bannerImage} alt={event.title} />
                ) : (
                    <div className="event-banner-placeholder">
                        <span className="category-icon">{getCategoryIcon(event.category)}</span>
                    </div>
                )}
                <span className={`event-status-badge badge ${getStatusBadgeClass(event.status)}`}>
                    {event.status}
                </span>
            </div>

            {/* Event Content */}
            <div className="event-content">
                <div className="event-category">
                    <span className="category-tag">{getCategoryIcon(event.category)} {event.category}</span>
                    {event.recommendationScore && (
                        <span className="recommendation-score">
                            {event.recommendationScore}% Match
                        </span>
                    )}
                </div>

                <Link to={`/events/${event._id}`} className="event-title">
                    {event.title}
                </Link>

                <p className="event-description">
                    {event.description?.substring(0, 120)}
                    {event.description?.length > 120 ? '...' : ''}
                </p>

                {/* Event Tags */}
                {event.tags && event.tags.length > 0 && (
                    <div className="event-tags">
                        {event.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="event-tag">{tag}</span>
                        ))}
                    </div>
                )}

                {/* Event Meta */}
                <div className="event-meta">
                    <div className="meta-item">
                        <FaCalendar />
                        <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="meta-item">
                        <FaClock />
                        <span>{formatTime(event.startDate)}</span>
                    </div>
                    <div className="meta-item">
                        <FaMapMarkerAlt />
                        <span>{event.venue}</span>
                    </div>
                    <div className="meta-item">
                        <FaUsers />
                        <span>{getSpotsLeft()} spots left</span>
                    </div>
                </div>

                {/* Event Actions */}
                {showActions && event.status === 'Published' && (
                    <div className="event-actions">
                        {isRegistered ? (
                            <button className="btn btn-outline" disabled>
                                ✓ Registered
                            </button>
                        ) : isFull ? (
                            <button className="btn btn-outline" disabled>
                                Event Full
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={() => onRegister && onRegister(event._id)}
                            >
                                Register Now
                            </button>
                        )}
                        <Link to={`/events/${event._id}`} className="btn btn-outline">
                            View Details
                        </Link>
                    </div>
                )}

                {showActions && event.status !== 'Published' && (
                    <div className="event-actions">
                        <Link to={`/events/${event._id}`} className="btn btn-primary">
                            View Details
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCard;
