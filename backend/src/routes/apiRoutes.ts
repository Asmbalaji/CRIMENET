import { Router } from 'express';
import * as apiController from '../controllers/apiController';

const router = Router();

router.get('/cases', apiController.getCases);
router.get('/entities', apiController.getEntities);
router.get('/evidence', apiController.getEvidence);
router.get('/network', apiController.getNetwork);
router.get('/locations', apiController.getLocations);
router.get('/alerts', apiController.getAlerts);
router.get('/dashboard', apiController.getDashboardMetrics);

router.post('/cases', apiController.createCase);
router.delete('/cases/:id', apiController.deleteCase);
router.post('/entities', apiController.createEntity);
router.post('/evidence', apiController.createEvidence);
router.post('/locations', apiController.createLocation);

router.get('/cross-case-links', apiController.getCrossCaseLinks);
router.post('/cases/:id/analyze-links', apiController.detectCrossCaseLinks);
router.put('/cross-case-links/:id/verify', apiController.verifyCrossCaseLink);

router.get('/ai', apiController.getAi);
router.post('/ai/analyze', apiController.analyzeAi);
router.post('/ai/chat', apiController.chatAi);
router.get('/health', (req, res) => res.json({ status: 'OK', message: 'Backend is running' }));
import multer from 'multer';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  storage: multer.memoryStorage(),
});

router.post('/cases/extract', upload.single('file'), apiController.extractCaseInformation);

export default router;
