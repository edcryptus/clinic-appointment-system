import { Request, Response } from 'express';
import validator from 'validator';

export function validateEmail(email: string): boolean {
  return validator.isEmail(email);
}

export function validatePhone(phone: string): boolean {
  // Basic phone validation - adjust regex for your region
  return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function validateDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
}

export function validateTime(time: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

export function validateReference(ref: string): boolean {
  return /^WM-[A-Z0-9]{6}$/.test(ref.toUpperCase());
}

export function sanitizeString(str: string, maxLength: number = 200): string {
  return validator.escape(str.trim()).substring(0, maxLength);
}
