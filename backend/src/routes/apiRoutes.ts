import { Router } from 'express';
import * as apiController from '../controllers/apiController';

const router = Router();

router.get('/cases', apiController.getCases);
router.get('/entities', apiController.getEntities);
router.get('/evidence', apiController.getEvidence);
router.get('/network', apiController.getNetwork);
router.get('/locations', apiController.getLocations);
router.get('/alerts', apiController.getAlerts);
router.get('/ai', apiController.getAi);
router.post('/ai/analyze', apiController.analyzeAi);
router.get('/health', (req, res) => res.json({ status: 'OK', message: 'Backend is running' }));

export default router;
