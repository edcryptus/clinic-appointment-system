import { Router } from 'express';
import { asyncHandler } from '../middleware/errors.js';
import * as dataService from '../services/data.js';

const router = Router();

// Get all services
router.get('/', asyncHandler(async (req, res) => {
  const services = await dataService.getServices();
  res.json(services);
}));

// Get service by slug or ID
router.get('/:slugOrId', asyncHandler(async (req, res) => {
  const service = await dataService.getServiceBySlugOrId(req.params.slugOrId);
  
  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }
  
  res.json(service);
}));

export default router;
