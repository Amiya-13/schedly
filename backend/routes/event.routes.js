import express from 'express';
import {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    submitEvent,
    facultyReview,
    adminApprove,
    completeEvent,
    archiveEvent,
    deleteEvent
} from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Event CRUD
router.post('/', authorize('Event Organizer'), createEvent);
router.get('/', getEvents); // All authenticated users
router.get('/:id', getEventById);
router.put('/:id', authorize('Event Organizer'), updateEvent);
router.delete('/:id', authorize('Event Organizer', 'Super Admin'), deleteEvent);

// Event workflow
router.post('/:id/submit', authorize('Event Organizer'), submitEvent);
router.post('/:id/faculty-review', authorize('Faculty Mentor'), facultyReview);
router.post('/:id/admin-approve', authorize('College Admin', 'Super Admin'), adminApprove);
router.post('/:id/complete', authorize('Event Organizer', 'College Admin', 'Super Admin'), completeEvent);
router.post('/:id/archive', authorize('College Admin', 'Super Admin'), archiveEvent);

export default router;
