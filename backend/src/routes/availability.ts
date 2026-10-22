import { Router } from 'express';
import { asyncHandler } from '../middleware/errors.js';
import * as dataService from '../services/data.js';

const router = Router();

// Get all availability rules
router.get('/', asyncHandler(async (req, res) => {
  const availability = await dataService.getAvailabilityRules();
  res.json(availability);
}));

export default router;
