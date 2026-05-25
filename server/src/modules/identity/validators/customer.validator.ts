import { z } from 'zod';

const email = z.string().email().max(320);
const password = z.string().min(8).max(128);
const name = z.string().min(1).max(120);

export const CustomerRegisterSchema = z.object({
  name,
  email,
  password,
});

export const CustomerLoginSchema = z.object({
  email,
  password,
});

export const CustomerForgotPasswordSchema = z.object({
  email,
});

export const CustomerResetPasswordSchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Invalid reset code'),
  newPassword: password,
});
