import express from 'express';
import {
    registerForEvent,
    getMyRegistrations,
    getEventRegistrations,
    markAttendance,
    issueCertificate,
    cancelRegistration
} from '../controllers/registrationController.js';

import { uploadCertificate, downloadCertificate } from '../controllers/certificateController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', authorize('Student'), registerForEvent);
router.get('/my', authorize('Student'), getMyRegistrations);
router.get('/event/:eventId', authorize('Event Organizer', 'College Admin', 'Super Admin'), getEventRegistrations);
router.put('/:id/attendance', authorize('Event Organizer', 'College Admin', 'Super Admin'), markAttendance);
router.post('/:id/certificate', authorize('Event Organizer', 'College Admin', 'Super Admin'), issueCertificate);
router.post('/:id/upload-certificate', authorize('Event Organizer', 'College Admin', 'Super Admin'), uploadCertificate);
router.get('/:id/certificate', downloadCertificate);
router.delete('/:id', authorize('Student'), cancelRegistration);

export default router;
