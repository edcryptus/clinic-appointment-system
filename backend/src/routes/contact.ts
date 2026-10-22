import { Router } from 'express';
import { asyncHandler } from '../middleware/errors.js';
import { query } from '../db/index.js';
import { validateEmail, sanitizeString } from '../middleware/validation.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Submit contact message
router.post('/', asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Missing required fields');
  }

  if (!validateEmail(email)) {
    res.status(400);
    throw new Error('Invalid email address');
  }

  // Sanitize inputs
  const sanitizedData = {
    name: sanitizeString(name, 200),
    email: email.trim().toLowerCase(),
    subject: sanitizeString(subject, 300),
    message: sanitizeString(message, 5000)
  };

  // Insert into database
  const result = await query(
    `INSERT INTO contact_messages (name, email, subject, message)
     VALUES ($1, $2, $3, $4)
     RETURNING id, created_at`,
    [sanitizedData.name, sanitizedData.email, sanitizedData.subject, sanitizedData.message]
  );

  // Audit log
  await logAudit(
    'CONTACT_MESSAGE',
    'contact_message',
    result.rows[0].id.toString(),
    sanitizedData.email,
    req.ip,
    req.get('user-agent')
  );

  res.status(201).json({
    success: true,
    id: result.rows[0].id,
    createdAt: result.rows[0].created_at
  });
}));

export default router;
