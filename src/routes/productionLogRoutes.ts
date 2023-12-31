import { Router } from 'express';
import { ProductionLogController } from '../controllers/productionLogController';
import { protect } from '../middleware/auth';

const router = Router();

const productionLogController = new ProductionLogController();

router.post('/logs', protect, productionLogController.createProductionLog);

router.get('/logs', protect, productionLogController.getProductionLogs);

router.get('/logs/:productionLogId', protect, productionLogController.getProductionLog);

export default router;
