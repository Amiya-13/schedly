// @desc    Upload certificate URL for registration
// @route   POST /api/registrations/:id/upload-certificate
// @access  Private (Organizer/Admin)
export const uploadCertificate = async (req, res) => {
    try {
        const { certificateUrl } = req.body;

        const registration = await Registration.findById(req.params.id)
            .populate('student', 'name email')
            .populate('event', 'title organizer');

        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        // Check authorization (only organizer of the event or admins)
        if (req.user.role !== 'College Admin' &&
            req.user.role !== 'Super Admin' &&
            registration.event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to upload certificates for this event'
            });
        }

        if (!registration.attended) {
            return res.status(400).json({
                status: 'error',
                message: 'Certificate can only be issued to attendees'
            });
        }

        registration.certificateIssued = true;
        registration.certificateUrl = certificateUrl || `https://certificates.schedly.com/${registration._id}.pdf`;
        await registration.save();

        // Notify student
        await Notification.create({
            user: registration.student._id,
            type: 'Certificate',
            title: 'Certificate Available!',
            message: `Your certificate for "${registration.event.title}" is ready to download.`,
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

// @desc    Download certificate
// @route   GET /api/registrations/:id/certificate
// @access  Private (Student - own certificate only)
export const downloadCertificate = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id)
            .populate('student', 'name')
            .populate('event', 'title');

        if (!registration) {
            return res.status(404).json({
                status: 'error',
                message: 'Registration not found'
            });
        }

        // Check authorization
        if (req.user.role === 'Student' && registration.student._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized'
            });
        }

        if (!registration.certificateIssued) {
            return res.status(404).json({
                status: 'error',
                message: 'Certificate not yet issued'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                certificateUrl: registration.certificateUrl || `https://certificates.schedly.com/${registration._id}.pdf`,
                studentName: registration.student.name,
                eventTitle: registration.event.title
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
