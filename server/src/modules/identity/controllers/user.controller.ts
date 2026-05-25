import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/utils/asyncHandler';
import { AppError } from '../../../shared/middleware/errorHandler';
import { UserModel } from '../models/user.model';
import {
  UserAcceptInviteSchema,
  UserAdminPatchSchema,
  UserBootstrapSchema,
  UserForgotPasswordSchema,
  UserInviteSchema,
  UserLoginSchema,
  UserResetPasswordSchema,
} from '../validators/user.validator';
import {
  acceptInvitation,
  authenticateUser,
  bootstrapFirstUser,
  inviteUser,
  listAdminUsers,
  requestUserPasswordReset,
  resetUserPassword,
  updateAdminUser,
} from '../services/user.service';
import { createSession, deleteSession } from '../services/session.service';
import { clearSessionCookie, writeSessionCookie } from '../../../shared/utils/authTransport';
import { publishUserRegistered } from '../../../infrastructure/messaging/publisher';
import { sendEmail } from '../../../infrastructure/email/email.service';
import {
  passwordResetTemplate,
  welcomeEmailTemplate,
  invitePasswordTemplate,
} from '../../../infrastructure/email/templates';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = UserLoginSchema.parse(req.body);
  const user = await authenticateUser(body);

  const { sessionId, ttlSeconds } = await createSession({
    type: 'user',
    id: user._id.toString(),
  });

  writeSessionCookie(res, sessionId, ttlSeconds);

  res.json({ ok: true, sessionId, user: user.toJSON() });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth || req.auth.subject.type !== 'user') {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }

  const user = await UserModel.findById(req.auth.subject.id);
  if (!user) {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }

  res.json({
    ok: true,
    userId: req.auth.subject.id,
    user: user.toJSON(),
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.auth?.sessionId) {
    await deleteSession(req.auth.sessionId);
  }

  clearSessionCookie(res);
  res.json({ ok: true });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const body = UserForgotPasswordSchema.parse(req.body);
  const reset = await requestUserPasswordReset(body.email);

  if (reset) {
    try {
      const minutes = Math.max(1, Math.round((reset.expiresAt.getTime() - Date.now()) / 60_000));
      const tpl = passwordResetTemplate({ code: reset.token, minutes });
      await sendEmail({ to: body.email.toLowerCase().trim(), ...tpl });
    } catch {
      /* ignore email failures */
    }
  }

  const response: any = { ok: true };
  if (process.env.NODE_ENV !== 'production' && reset) {
    response.dev = { resetToken: reset.token, expiresAt: reset.expiresAt };
  }

  res.json(response);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const body = UserResetPasswordSchema.parse(req.body);
  const user = await resetUserPassword(body);

  const { sessionId, ttlSeconds } = await createSession({
    type: 'user',
    id: user._id.toString(),
  });

  writeSessionCookie(res, sessionId, ttlSeconds);

  res.json({ ok: true, sessionId, user: user.toJSON() });
});

export const createInvitation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth || req.auth.subject.type !== 'user') {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }

  const body = UserInviteSchema.parse(req.body);
  const { user, password } = await inviteUser({
    ...body,
  });

  // Email generated password (best effort).
  try {
    const tpl = invitePasswordTemplate({ name: body.name, password });
    await sendEmail({ to: body.email.toLowerCase().trim(), ...tpl });
  } catch {
    /* ignore email failures */
  }

  const response: any = { ok: true, user: user.toJSON() };
  if (process.env.NODE_ENV !== 'production') {
    response.dev = { password };
  }

  res.status(201).json(response);
});

export const acceptInvite = asyncHandler(async (req: Request, res: Response) => {
  const body = UserAcceptInviteSchema.parse(req.body);
  const { user, invitation } = await acceptInvitation(body);

  await publishUserRegistered({
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
  });

  // Welcome email (best effort).
  try {
    const tpl = welcomeEmailTemplate({ name: user.name });
    await sendEmail({ to: user.email, ...tpl });
  } catch {
    /* ignore email failures */
  }

  const { sessionId, ttlSeconds } = await createSession({
    type: 'user',
    id: user._id.toString(),
  });

  writeSessionCookie(res, sessionId, ttlSeconds);

  res.status(201).json({ ok: true, sessionId, user: user.toJSON(), invitation: invitation.toJSON() });
});

export const listTeamUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await listAdminUsers();
  res.json({ ok: true, users });
});

export const patchTeamUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth || req.auth.subject.type !== 'user') {
    throw new AppError('Unauthorized', 401, 'unauthorized');
  }
  const targetUserId = req.params.id as string;
  const body = UserAdminPatchSchema.parse(req.body);
  const user = await updateAdminUser({
    actorUserId: req.auth.subject.id,
    targetUserId,
    patch: body,
  });
  res.json({ ok: true, user: user.toJSON() });
});

export const bootstrap = asyncHandler(async (req: Request, res: Response) => {
  const token = req.header('x-bootstrap-token');
  if (!process.env.BOOTSTRAP_USER_TOKEN) {
    throw new AppError('Bootstrap disabled', 403, 'forbidden');
  }
  if (!token || token !== process.env.BOOTSTRAP_USER_TOKEN) {
    throw new AppError('Forbidden', 403, 'forbidden');
  }

  const body = UserBootstrapSchema.parse(req.body);
  const user = await bootstrapFirstUser(body);

  await publishUserRegistered({
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
  });

  // Welcome email (best effort).
  try {
    const tpl = welcomeEmailTemplate({ name: user.name });
    await sendEmail({ to: user.email, ...tpl });
  } catch {
    /* ignore email failures */
  }

  const { sessionId, ttlSeconds } = await createSession({
    type: 'user',
    id: user._id.toString(),
  });

  writeSessionCookie(res, sessionId, ttlSeconds);

  res.status(201).json({ ok: true, sessionId, user: user.toJSON() });
});
