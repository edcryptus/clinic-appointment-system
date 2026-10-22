import { Router } from 'express';
import { asyncHandler } from '../middleware/errors.js';
import * as dataService from '../services/data.js';

const router = Router();

// Get all doctors
router.get('/', asyncHandler(async (req, res) => {
  const doctors = await dataService.getDoctors();
  res.json(doctors);
}));

// Get doctor by slug or ID
router.get('/:slugOrId', asyncHandler(async (req, res) => {
  const doctor = await dataService.getDoctorBySlugOrId(req.params.slugOrId);
  
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  
  res.json(doctor);
}));

export default router;
