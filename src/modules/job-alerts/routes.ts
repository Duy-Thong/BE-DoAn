import { Router } from 'express';
import { JobAlertController } from './controller.js';
import { AuthMiddleware } from '../../middlewares/auth.js';

export const jobAlertsRouter = Router();
const jobAlertController = new JobAlertController();

// Tất cả routes đều cần authentication
jobAlertsRouter.use(AuthMiddleware.authenticate);

// Job Alert routes
jobAlertsRouter.get('/', jobAlertController.getUserJobAlerts.bind(jobAlertController));
jobAlertsRouter.get('/:id', jobAlertController.getJobAlertById.bind(jobAlertController));
jobAlertsRouter.post('/', jobAlertController.createJobAlert.bind(jobAlertController));
jobAlertsRouter.put('/:id', jobAlertController.updateJobAlert.bind(jobAlertController));
jobAlertsRouter.delete('/:id', jobAlertController.deleteJobAlert.bind(jobAlertController));
jobAlertsRouter.patch('/:id/toggle', jobAlertController.toggleJobAlert.bind(jobAlertController));
