import Event from '../models/Event.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

// Helper function to create audit log
const createAuditLog = async (eventId, actorId, action, fromStatus, toStatus, remarks = '') => {
    await AuditLog.create({
        event: eventId,
        actor: actorId,
        action,
        fromStatus,
        toStatus,
        remarks
    });
};

// Helper function to create notification
const createNotification = async (userId, type, title, message, eventId = null, link = '') => {
    await Notification.create({
        user: userId,
        type,
        title,
        message,
        event: eventId,
        link
    });
};

// @desc    Create a new event (Draft)
// @route   POST /api/events
// @access  Private (Event Organizer only)
export const createEvent = async (req, res) => {
    try {
        const { title, description, category, tags, startDate, endDate, venue, capacity, bannerImage } = req.body;

        const event = await Event.create({
            title,
            description,
            category,
            tags,
            startDate,
            endDate,
            venue,
            capacity,
            bannerImage,
            organizer: req.user._id,
            status: 'Draft'
        });

        // Create audit log
        await createAuditLog(event._id, req.user._id, 'Create', null, 'Draft');

        res.status(201).json({
            status: 'success',
            data: { event }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Get all events (filtered by role)
// @route   GET /api/events
// @access  Private
export const getEvents = async (req, res) => {
    try {
        let query = {};

        // Role-based filtering
        switch (req.user.role) {
            case 'Student':
                // Students see only published events
                query.status = 'Published';
                break;
            case 'Event Organizer':
                // Organizers see only their own events
                query.organizer = req.user._id;
                break;
            case 'Faculty Mentor':
                // Faculty sees submitted events for review
                query.status = { $in: ['Submitted', 'Faculty Approved', 'Faculty Rejected'] };
                break;
            case 'College Admin':
                // Admin sees faculty-approved events
                query.status = { $in: ['Faculty Approved', 'Admin Approved', 'Published', 'Completed'] };
                break;
            case 'Super Admin':
                // Super admin sees everything (no filter)
                break;
        }

        const events = await Event.find(query)
            .populate('organizer', 'name email department')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: events.length,
            data: { events }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Private
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email department')
            .populate('facultyReview.reviewer', 'name email')
            .populate('adminApproval.approver', 'name email');

        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        // Get audit trail
        const auditTrail = await AuditLog.find({ event: event._id })
            .populate('actor', 'name role')
            .sort({ timestamp: -1 });

        res.status(200).json({
            status: 'success',
            data: { event, auditTrail }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Update event (Draft only)
// @route   PUT /api/events/:id
// @access  Private (Event Organizer)
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        // Check ownership
        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to update this event'
            });
        }

        // Only allow updates in Draft status
        if (event.status !== 'Draft') {
            return res.status(400).json({
                status: 'error',
                message: 'Only draft events can be edited'
            });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        await createAuditLog(event._id, req.user._id, 'Update', 'Draft', 'Draft');

        res.status(200).json({
            status: 'success',
            data: { event: updatedEvent }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Submit event for review
// @route   POST /api/events/:id/submit
// @access  Private (Event Organizer)
export const submitEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        // Check ownership
        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized'
            });
        }

        // Can only submit draft events
        if (event.status !== 'Draft') {
            return res.status(400).json({
                status: 'error',
                message: 'Only draft events can be submitted'
            });
        }

        event.status = 'Submitted';
        await event.save();

        await createAuditLog(event._id, req.user._id, 'Submit', 'Draft', 'Submitted');

        // TODO: Notify faculty mentors
        // await createNotification(facultyId, 'System', 'New Event Submission', `Event "${event.title}" submitted for review`, event._id);

        res.status(200).json({
            status: 'success',
            data: { event }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Faculty review (Approve/Reject)
// @route   POST /api/events/:id/faculty-review
// @access  Private (Faculty Mentor)
export const facultyReview = async (req, res) => {
    try {
        const { action, remarks } = req.body; // action: 'approve' or 'reject'

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        if (event.status !== 'Submitted') {
            return res.status(400).json({
                status: 'error',
                message: 'Event must be in Submitted status'
            });
        }

        const newStatus = action === 'approve' ? 'Faculty Approved' : 'Faculty Rejected';

        event.status = newStatus;
        event.facultyReview = {
            reviewer: req.user._id,
            reviewedAt: new Date(),
            remarks: remarks || ''
        };
        await event.save();

        await createAuditLog(event._id, req.user._id, action === 'approve' ? 'Approve' : 'Reject', 'Submitted', newStatus, remarks);

        // Notify organizer
        await createNotification(
            event.organizer,
            action === 'approve' ? 'Approval' : 'Rejection',
            `Event ${action === 'approve' ? 'Approved' : 'Rejected'} by Faculty`,
            `Your event "${event.title}" has been ${action === 'approve' ? 'approved' : 'rejected'} by faculty. ${remarks || ''}`,
            event._id
        );

        res.status(200).json({
            status: 'success',
            data: { event }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Admin final approval
// @route   POST /api/events/:id/admin-approve
// @access  Private (College Admin)
export const adminApprove = async (req, res) => {
    try {
        const { remarks } = req.body;

        const event = await Event.findById(req.params.id).populate('organizer', 'name email');

        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        if (event.status !== 'Faculty Approved') {
            return res.status(400).json({
                status: 'error',
                message: 'Event must be faculty-approved first'
            });
        }

        event.status = 'Published'; // Auto-publish on admin approval
        event.adminApproval = {
            approver: req.user._id,
            approvedAt: new Date(),
            remarks: remarks || ''
        };
        await event.save();

        await createAuditLog(event._id, req.user._id, 'Approve', 'Faculty Approved', 'Published', remarks);

        // Notify organizer
        await createNotification(
            event.organizer._id,
            'Publication',
            'Event Published!',
            `Your event "${event.title}" has been published and is now visible to students.`,
            event._id
        );

        res.status(200).json({
            status: 'success',
            data: { event }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Mark event as completed
// @route   POST /api/events/:id/complete
// @access  Private (Organizer/Admin)
export const completeEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        if (event.status !== 'Published') {
            return res.status(400).json({
                status: 'error',
                message: 'Only published events can be completed'
            });
        }

        event.status = 'Completed';
        event.completedAt = new Date();
        await event.save();

        await createAuditLog(event._id, req.user._id, 'Complete', 'Published', 'Completed');

        res.status(200).json({
            status: 'success',
            data: { event }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Archive event
// @route   POST /api/events/:id/archive
// @access  Private (Admin)
export const archiveEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        const oldStatus = event.status;
        event.status = 'Archived';
        event.archivedAt = new Date();
        await event.save();

        await createAuditLog(event._id, req.user._id, 'Archive', oldStatus, 'Archived');

        res.status(200).json({
            status: 'success',
            data: { event }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer/Super Admin)
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        // Only organizer or super admin can delete
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to delete this event'
            });
        }

        // Can only delete draft events
        if (event.status !== 'Draft' && req.user.role !== 'Super Admin') {
            return res.status(400).json({
                status: 'error',
                message: 'Only draft events can be deleted'
            });
        }

        await event.deleteOne();

        res.status(200).json({
            status: 'success',
            message: 'Event deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
