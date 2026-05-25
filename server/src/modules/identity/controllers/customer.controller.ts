import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { AppError } from '../../../shared/middleware/errorHandler';
import { CustomerModel } from '../models/customer.model';
import {
  CustomerForgotPasswordSchema,
  CustomerLoginSchema,
  CustomerRegisterSchema,
  CustomerResetPasswordSchema,
} from '../validators/customer.validator';
import {
  authenticateCustomer,
  registerCustomer,
  requestCustomerPasswordReset,
  resetCustomerPassword,
} from '../services/customer.service';
import { createSession, deleteSession } from '../services/session.service';
import { clearSessionCookie, writeSessionCookie } from '../../../shared/utils/authTransport';
import { publishCustomerRegistered } from '../../../infrastructure/messaging/publisher';
import { sendEmail } from '../../../infrastructure/email/email.service';
import { passwordResetTemplate, welcomeEmailTemplate } from '../../../infrastructure/email/templates';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = CustomerRegisterSchema.parse(req.body);
  const customer = await registerCustomer(body);

  await publishCustomerRegistered({
    customerId: customer._id.toString(),
    email: customer.email,
    name: customer.name,
  });

  // Welcome email should not block account creation.
  try {
    const tpl = welcomeEmailTemplate({ name: customer.name });
    await sendEmail({ to: customer.email, ...tpl });
  } catch {
    /* ignore email failures */
  }

  const { sessionId, ttlSeconds } = await createSession({
    type: 'customer',
    id: customer._id.toString(),
  });

  writeSessionCookie(res, sessionId, ttlSeconds);

  res.status(201).json({ ok: true, sessionId, customer: customer.toJSON() });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = CustomerLoginSchema.parse(req.body);
  const customer = await authenticateCustomer(body);

  const { sessionId, ttlSeconds } = await createSession({
    type: 'customer',
    id: customer._id.toString(),
  });

  writeSessionCookie(res, sessionId, ttlSeconds);

  res.json({ ok: true, sessionId, customer: customer.toJSON() });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth || req.auth.subject.type !== 'customer') {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }

  const customer = await CustomerModel.findById(req.auth.subject.id);
  if (!customer) {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }

  res.json({ ok: true, customerId: req.auth.subject.id, customer: customer.toJSON() });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.auth?.sessionId) {
    await deleteSession(req.auth.sessionId);
  }

  clearSessionCookie(res);
  res.json({ ok: true });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const body = CustomerForgotPasswordSchema.parse(req.body);
  const reset = await requestCustomerPasswordReset(body.email);

  // In production, do not reveal whether email exists.
  if (reset) {
    try {
      const minutes = Math.max(1, Math.round((reset.expiresAt.getTime() - Date.now()) / 60_000));
      const tpl = passwordResetTemplate({ code: reset.token, minutes });
      await sendEmail({ to: body.email.toLowerCase().trim(), ...tpl });
    } catch {
      /* ignore email failures */
    }
  }

  // In production, do not reveal whether email exists.
  const response: any = { ok: true };
  if (process.env.NODE_ENV !== 'production' && reset) {
    response.dev = { resetToken: reset.token, expiresAt: reset.expiresAt };
  }

  res.json(response);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const body = CustomerResetPasswordSchema.parse(req.body);
  const customer = await resetCustomerPassword(body);

  // Reset invalidates old session(s) only if caller logs out; keep simple.
  const { sessionId, ttlSeconds } = await createSession({
    type: 'customer',
    id: customer._id.toString(),
  });

  writeSessionCookie(res, sessionId, ttlSeconds);

  res.json({ ok: true, sessionId, customer: customer.toJSON() });
});

export const wishlistList = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth || req.auth.subject.type !== 'customer') {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }
  const customer = await CustomerModel.findById(req.auth.subject.id).lean();
  if (!customer) throw new AppError('Unauthorized', 401, 'unauthorized');
  const wishlistProductIds = Array.isArray((customer as any).wishlistProductIds)
    ? (customer as any).wishlistProductIds.map((x: any) => x?.toString?.() ?? x)
    : [];
  res.json({ ok: true, wishlistProductIds });
});

export const wishlistAdd = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth || req.auth.subject.type !== 'customer') {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }
  const productId = String(req.params.productId || '');
  if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
    throw new AppError('Invalid product id', 400, 'validation_error');
  }
  const customer = await CustomerModel.findByIdAndUpdate(
    req.auth.subject.id,
    { $addToSet: { wishlistProductIds: new Types.ObjectId(productId) } },
    { new: true }
  ).lean();
  if (!customer) throw new AppError('Unauthorized', 401, 'unauthorized');
  const wishlistProductIds = Array.isArray((customer as any).wishlistProductIds)
    ? (customer as any).wishlistProductIds.map((x: any) => x?.toString?.() ?? x)
    : [];
  res.json({ ok: true, wishlistProductIds });
});

export const wishlistRemove = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth || req.auth.subject.type !== 'customer') {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }
  const productId = String(req.params.productId || '');
  if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
    throw new AppError('Invalid product id', 400, 'validation_error');
  }
  const customer = await CustomerModel.findByIdAndUpdate(
    req.auth.subject.id,
    { $pull: { wishlistProductIds: new Types.ObjectId(productId) } },
    { new: true }
  ).lean();
  if (!customer) throw new AppError('Unauthorized', 401, 'unauthorized');
  const wishlistProductIds = Array.isArray((customer as any).wishlistProductIds)
    ? (customer as any).wishlistProductIds.map((x: any) => x?.toString?.() ?? x)
    : [];
  res.json({ ok: true, wishlistProductIds });
});
