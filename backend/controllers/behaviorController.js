import UserBehavior from '../models/UserBehavior.js';

// @desc    Track user behavior
// @route   POST /api/behavior/track
// @access  Private
export const trackBehavior = async (req, res) => {
    try {
        const { eventId, action, metadata } = req.body;

        await UserBehavior.create({
            user: req.user._id,
            event: eventId,
            action,
            metadata: metadata || {}
        });

        res.status(201).json({
            status: 'success',
            message: 'Behavior tracked'
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Get event analytics
// @route   GET /api/behavior/event/:eventId
// @access  Private (Organizer/Admin)
export const getEventBehavior = async (req, res) => {
    try {
        const { eventId } = req.params;

        const views = await UserBehavior.countDocuments({ event: eventId, action: 'view' });
        const clicks = await UserBehavior.countDocuments({ event: eventId, action: 'click' });
        const registrations = await UserBehavior.countDocuments({ event: eventId, action: 'register' });

        const uniqueUsers = await UserBehavior.distinct('user', { event: eventId });

        res.status(200).json({
            status: 'success',
            data: {
                views,
                clicks,
                registrations,
                uniqueUsers: uniqueUsers.length,
                engagementRate: uniqueUsers.length > 0 ? ((registrations / uniqueUsers.length) * 100).toFixed(2) : 0
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
