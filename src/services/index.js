/**
 * services/index.js
 *
 * FIX: Added missing `auditService` export.
 * Without this, importing `logAudit` from '../services' (barrel) fails silently
 * and callers must import directly from '../services/auditService' — inconsistent
 * with the barrel pattern used everywhere else.
 */
export * from './residentsService';
export * from './householdsService';
export * from './analyticsService';
export * from './qrverificationService';
export * from './auditService';