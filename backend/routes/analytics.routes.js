import express from 'express';
import {
    getDashboardStats,
    getEventsByDepartment,
    getParticipationTrends,
    getCategoryAnalytics
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(protect);
router.use(authorize('College Admin', 'Super Admin'));

router.get('/dashboard', getDashboardStats);
router.get('/by-department', getEventsByDepartment);
router.get('/participation', getParticipationTrends);
router.get('/categories', getCategoryAnalytics);

export default router;
