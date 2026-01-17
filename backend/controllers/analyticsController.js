import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import User from '../models/User.js';

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private (Admin only)
export const getDashboardStats = async (req, res) => {
    try {
        const totalEvents = await Event.countDocuments();
        const publishedEvents = await Event.countDocuments({ status: 'Published' });
        const completedEvents = await Event.countDocuments({ status: 'Completed' });
        const pendingApprovals = await Event.countDocuments({ status: 'Submitted' });

        const totalRegistrations = await Registration.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'Student' });

        // Events by category
        const eventsByCategory = await Event.aggregate([
            { $match: { status: { $in: ['Published', 'Completed'] } } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Recent events
        const recentEvents = await Event.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('organizer', 'name department');

        res.status(200).json({
            status: 'success',
            data: {
                stats: {
                    totalEvents,
                    publishedEvents,
                    completedEvents,
                    pendingApprovals,
                    totalRegistrations,
                    totalStudents
                },
                eventsByCategory,
                recentEvents
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Get events by department
// @route   GET /api/analytics/by-department
// @access  Private (Admin only)
export const getEventsByDepartment = async (req, res) => {
    try {
        const eventsByDepartment = await Event.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'organizer',
                    foreignField: '_id',
                    as: 'organizerInfo'
                }
            },
            { $unwind: '$organizerInfo' },
            {
                $group: {
                    _id: '$organizerInfo.department',
                    count: { $sum: 1 },
                    events: { $push: { title: '$title', status: '$status' } }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            status: 'success',
            data: { eventsByDepartment }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Get participation trends
// @route   GET /api/analytics/participation
// @access  Private (Admin only)
export const getParticipationTrends = async (req, res) => {
    try {
        const participationByMonth = await Registration.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$registeredAt' },
                        month: { $month: '$registeredAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        res.status(200).json({
            status: 'success',
            data: { participationByMonth }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Get category analytics
// @route   GET /api/analytics/categories
// @access  Private (Admin only)
export const getCategoryAnalytics = async (req, res) => {
    try {
        const categoryStats = await Event.aggregate([
            {
                $group: {
                    _id: '$category',
                    totalEvents: { $sum: 1 },
                    avgCapacity: { $avg: '$capacity' },
                    totalRegistrations: { $sum: '$registrationCount' }
                }
            },
            { $sort: { totalEvents: -1 } }
        ]);

        res.status(200).json({
            status: 'success',
            data: { categoryStats }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
