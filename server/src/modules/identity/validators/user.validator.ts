import { z } from 'zod';

const email = z.string().email().max(320);
const password = z.string().min(8).max(128);
const name = z.string().min(1).max(120);

export const UserLoginSchema = z.object({
  email,
  password,
});

export const UserForgotPasswordSchema = z.object({
  email,
});

export const UserResetPasswordSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Invalid reset code'),
  newPassword: password,
});

export const UserInviteSchema = z.object({
  email,
  name,
});

export const UserAcceptInviteSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Invalid invitation code'),
  password,
});

export const UserBootstrapSchema = z.object({
  email,
  name,
  password,
});

export const UserAdminPatchSchema = z.object({
  isActive: z.boolean().optional(),
});
