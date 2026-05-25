import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { getCustomerAdminDetail, listCustomersAdmin } from '../services/customer.admin.service';

export const listAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const customers = await listCustomersAdmin();
  res.json({ ok: true, customers });
});

export const getAdminById = asyncHandler(async (req: Request, res: Response) => {
  const customerId = req.params.customerId as string;
  const detail = await getCustomerAdminDetail(customerId);
  res.json({ ok: true, ...detail });
});
