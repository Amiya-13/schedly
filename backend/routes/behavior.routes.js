import express from 'express';
import { trackBehavior, getEventBehavior } from '../controllers/behaviorController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

router.post('/track', trackBehavior);
router.get('/event/:eventId', authorize('Event Organizer', 'College Admin', 'Super Admin'), getEventBehavior);

export default router;
