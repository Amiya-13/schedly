import express from 'express';
import { getRecommendedEvents, browseEvents } from '../controllers/recommendationController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('Student'), getRecommendedEvents);
router.get('/browse', authorize('Student'), browseEvents);

export default router;
