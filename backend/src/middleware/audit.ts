import { query } from '../db/index.js';

export async function logAudit(
  action: string,
  resourceType: string,
  resourceId: string | null,
  patientEmail: string | null,
  ipAddress: string | null,
  userAgent: string | null,
  details?: any
) {
  try {
    await query(
      `INSERT INTO audit_log (action, resource_type, resource_id, patient_email, ip_address, user_agent, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [action, resourceType, resourceId, patientEmail, ipAddress, userAgent, details ? JSON.stringify(details) : null]
    );
  } catch (error) {
    console.error('Failed to log audit entry:', error);
  }
}
