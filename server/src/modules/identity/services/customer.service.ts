import { CustomerModel } from '../models/customer.model';
import { AppError } from '../../../shared/middleware/errorHandler';
import { randomNumericCode, sha256Hex } from '../../../shared/utils/crypto';
import { hashPassword, verifyPassword } from '../../../shared/utils/password';

const RESET_TOKEN_TTL_MINUTES = 30;

export async function registerCustomer(input: {
  name: string;
  email: string;
  password: string;
}) {
  const email = input.email.toLowerCase().trim();

  const existing = await CustomerModel.findOne({ email }).lean();
  if (existing) throw new AppError('Email already in use', 409, 'conflict');

  const customer = await CustomerModel.create({
    name: input.name.trim(),
    email,
    passwordHash: hashPassword(input.password),
  });

  return customer;
}

export async function authenticateCustomer(input: { email: string; password: string }) {
  const email = input.email.toLowerCase().trim();

  const customer = await CustomerModel.findOne({ email }).select('+passwordHash');
  if (!customer || !customer.passwordHash) {
    throw new AppError('Invalid credentials', 401, 'invalid_credentials');
  }

  const ok = verifyPassword(input.password, customer.passwordHash);
  if (!ok) throw new AppError('Invalid credentials', 401, 'invalid_credentials');

  return customer;
}

export async function requestCustomerPasswordReset(emailRaw: string): Promise<{
  token: string;
  expiresAt: Date;
} | null> {
  const email = emailRaw.toLowerCase().trim();
  const customer = await CustomerModel.findOne({ email }).select('_id');
  if (!customer) return null;

  const token = randomNumericCode(6);
  const tokenHash = sha256Hex(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000);

  await CustomerModel.updateOne(
    { _id: customer._id },
    { $set: { resetPasswordTokenHash: tokenHash, resetPasswordExpiresAt: expiresAt } }
  );

  return { token, expiresAt };
}

export async function resetCustomerPassword(input: { token: string; newPassword: string }) {
  const tokenHash = sha256Hex(input.token);

  const customer = await CustomerModel.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: { $gt: new Date() },
  }).select('+passwordHash +resetPasswordTokenHash +resetPasswordExpiresAt');

  if (!customer) throw new AppError('Invalid or expired token', 400, 'invalid_token');

  customer.passwordHash = hashPassword(input.newPassword);
  (customer as any).resetPasswordTokenHash = undefined;
  (customer as any).resetPasswordExpiresAt = undefined;
  await customer.save();

  return customer;
}
