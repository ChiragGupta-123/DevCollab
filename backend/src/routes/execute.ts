import { Router, Response } from 'express';
import { Server } from 'socket.io';
import { requireAuth } from '../security/securityMiddleware';
import { getSecurityLogs, getProjectMember, getProjectById } from '../db';
import { AuthenticatedRequest } from '../types';

/**
 * Creates the execute router.
 * Full sandbox code execution will be wired in Phase 5.
 * Phase 2 exposes the security-logs endpoint for the TelemetryBar.
 *
 * @param io - Socket.IO server instance (reserved for Phase 5 live execution events)
 */
export function createExecuteRouter(_io: Server): Router {
  const router = Router();

  /**
   * GET /security-logs/:projectId
   * Returns paginated security_logs rows for a project.
   * Caller must be a member of the project (any role).
   */
  router.get(
    '/security-logs/:projectId',
    requireAuth,
    (req: AuthenticatedRequest, res: Response): void => {
      try {
        const { projectId } = req.params;
        const userId = req.user!.userId;

        // Membership check — all roles (OWNER, EDITOR, VIEWER) may read security logs
        const member = getProjectMember(projectId, userId);
        const project = getProjectById(projectId);

        const isMember = !!member || (!!project && project.owner_id === userId);
        if (!isMember) {
          res.status(403).json({
            error: 'Forbidden: You are not a member of this project'
          });
          return;
        }

        // Optional ?limit= query param, capped at 200
        const rawLimit = parseInt(String(req.query.limit || '50'), 10);
        const limit = isNaN(rawLimit) || rawLimit < 1 ? 50 : Math.min(rawLimit, 200);

        const logs = getSecurityLogs(projectId, limit);

        res.status(200).json({
          projectId,
          total: logs.length,
          logs
        });
      } catch (error: any) {
        res.status(500).json({
          error: 'Failed to fetch security logs',
          details: error.message
        });
      }
    }
  );

  /**
   * GET /security-logs
   * Global security logs (no project filter) — for admin / telemetry dashboard.
   * Only accessible to authenticated users.
   */
  router.get(
    '/security-logs',
    requireAuth,
    (req: AuthenticatedRequest, res: Response): void => {
      try {
        const rawLimit = parseInt(String(req.query.limit || '50'), 10);
        const limit = isNaN(rawLimit) || rawLimit < 1 ? 50 : Math.min(rawLimit, 200);

        const logs = getSecurityLogs(undefined, limit);

        res.status(200).json({
          total: logs.length,
          logs
        });
      } catch (error: any) {
        res.status(500).json({
          error: 'Failed to fetch global security logs',
          details: error.message
        });
      }
    }
  );

  /**
   * POST /run
   * Placeholder for Phase 5 sandboxed code execution.
   * Returns a structured stub so frontend routing can be wired without breaking.
   */
  router.post(
    '/run',
    requireAuth,
    (req: AuthenticatedRequest, res: Response): void => {
      res.status(503).json({
        error: 'Sandbox execution engine not yet available.',
        info: 'Full code execution with security scanning will be enabled in Phase 5.',
        stdout: '',
        stderr: '',
        exitCode: -1,
        executionTimeMs: 0
      });
    }
  );

  return router;
}
