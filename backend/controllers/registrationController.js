import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private (Student)
export const registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.body;

        // Check if event exists and is published
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        if (event.status !== 'Published') {
            return res.status(400).json({
                status: 'error',
                message: 'Event is not open for registration'
            });
        }

        // Check if event is full
        if (event.isFull) {
            return res.status(400).json({
                status: 'error',
                message: 'Event is full'
            });
        }

        // Check if already registered
        const existingRegistration = await Registration.findOne({
            student: req.user._id,
            event: eventId
        });

        if (existingRegistration) {
            return res.status(400).json({
                status: 'error',
                message: 'Already registered for this event'
            });
        }

        // Create registration
        const registration = await Registration.create({
            student: req.user._id,
            event: eventId
        });

        // Increment registration count
        event.registrationCount += 1;
        await event.save();

        // Create notification
        await Notification.create({
            user: req.user._id,
            type: 'System',
            title: 'Registration Successful',
            message: `You have successfully registered for "${event.title}"`,
            event: eventId,
            link: `/events/${eventId}`
        });

        res.status(201).json({
            status: 'success',
            data: { registration }
        });
    } catch (error) {
        // Handle duplicate registration error
        if (error.code === 11000) {
            return res.status(400).json({
                status: 'error',
                message: 'Already registered for this event'
            });
        }

        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Get my registrations
// @route   GET /api/registrations/my
// @access  Private (Student)
export const getMyRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({ student: req.user._id })
            .populate({
                path: 'event',
                select: 'title description category startDate endDate venue bannerImage status'
            })
            .sort({ registeredAt: -1 });

        res.status(200).json({
            status: 'success',
            results: registrations.length,
            data: { registrations }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Get all registrations for an event
// @route   GET /api/registrations/event/:eventId
// @access  Private (Organizer/Admin)
export const getEventRegistrations = async (req, res) => {
    try {
        const { eventId } = req.params;

        const registrations = await Registration.find({ event: eventId })
            .populate('student', 'name email department year')
            .sort({ registeredAt: -1 });

        res.status(200).json({
            status: 'success',
            results: registrations.length,
            data: { registrations }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Mark attendance
// @route   PUT /api/registrations/:id/attendance
// @access  Private (Organizer/Admin)
export const markAttendance = async (req, res) => {
    try {
        const { attended } = req.body;

        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        registration.attended = attended;
        await registration.save();

        res.status(200).json({
            status: 'success',
            data: { registration }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Issue certificate
// @route   POST /api/registrations/:id/certificate
// @access  Private (Organizer/Admin)
export const issueCertificate = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id)
            .populate('student', 'name email')
            .populate('event', 'title');

        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        if (!registration.attended) {
            return res.status(400).json({
                status: 'error',
                message: 'Certificate can only be issued to attendees'
            });
        }

        registration.certificateIssued = true;
        await registration.save();

        // Notify student
        await Notification.create({
            user: registration.student._id,
            type: 'Certificate',
            title: 'Certificate Available',
            message: `Your certificate for "${registration.event.title}" is ready to download`,
            event: registration.event._id,
            link: `/my-registrations`
        });

        res.status(200).json({
            status: 'success',
            data: { registration }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Cancel registration
// @route   DELETE /api/registrations/:id
// @access  Private (Student)
export const cancelRegistration = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        // Check ownership
        if (registration.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized'
            });
        }

        // Get event to decrement count
        const event = await Event.findById(registration.event);
        if (event) {
            event.registrationCount -= 1;
            await event.save();
        }

        await registration.deleteOne();

        res.status(200).json({
            status: 'success',
            message: 'Registration cancelled successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
