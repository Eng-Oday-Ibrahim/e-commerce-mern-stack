import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { getDashboardAnalytics } from '../services/analytics.service';

export const analytics = asyncHandler(async (req: Request, res: Response) => {
  const from = typeof req.query.from === 'string' ? req.query.from : undefined;
  const to = typeof req.query.to === 'string' ? req.query.to : undefined;
  const data = await getDashboardAnalytics({ from, to });
  res.json({ ok: true, analytics: data });
});
