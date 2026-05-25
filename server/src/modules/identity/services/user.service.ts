import { randomBytes } from 'crypto';
import { Types } from 'mongoose';
import { AppError } from '../../../shared/middleware/errorHandler';
import { randomNumericCode, sha256Hex } from '../../../shared/utils/crypto';
import { hashPassword, verifyPassword } from '../../../shared/utils/password';
import { sanitizeLeanArray } from '../../../shared/utils/sanitizeLean';
import { UserInvitationModel } from '../models/userInvitation.model';
import { UserModel } from '../models/user.model';

const RESET_TOKEN_TTL_MINUTES = 30;

function generateRandomPassword(length = 12) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i += 1) {
    password += charset[bytes[i] % charset.length];
  }
  return password;
}

export async function authenticateUser(input: { email: string; password: string }) {
  const email = input.email.toLowerCase().trim();

  const user = await UserModel.findOne({ email }).select('+passwordHash');
  if (!user || !user.passwordHash) {
    throw new AppError('Invalid credentials', 401, 'invalid_credentials');
  }
  if (!user.isActive) throw new AppError('User is not active', 403, 'inactive_user');

  const ok = verifyPassword(input.password, user.passwordHash);
  if (!ok) throw new AppError('Invalid credentials', 401, 'invalid_credentials');

  return user;
}

export async function requestUserPasswordReset(emailRaw: string): Promise<{
  token: string;
  expiresAt: Date;
} | null> {
  const email = emailRaw.toLowerCase().trim();
  const user = await UserModel.findOne({ email }).select('_id');
  if (!user) return null;

  const token = randomNumericCode(6);
  const tokenHash = sha256Hex(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000);

  await UserModel.updateOne(
    { _id: user._id },
    { $set: { resetPasswordTokenHash: tokenHash, resetPasswordExpiresAt: expiresAt } }
  );

  return { token, expiresAt };
}

export async function resetUserPassword(input: { token: string; newPassword: string }) {
  const tokenHash = sha256Hex(input.token);

  const user = await UserModel.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: { $gt: new Date() },
  }).select('+passwordHash +resetPasswordTokenHash +resetPasswordExpiresAt');

  if (!user) throw new AppError('Invalid or expired token', 400, 'invalid_token');

  user.passwordHash = hashPassword(input.newPassword);
  (user as any).resetPasswordTokenHash = undefined;
  (user as any).resetPasswordExpiresAt = undefined;
  await user.save();

  return user;
}

export async function inviteUser(input: {
  email: string;
  name: string;
}) {
  const email = input.email.toLowerCase().trim();

  const existingUser = await UserModel.findOne({ email }).lean();
  if (existingUser) throw new AppError('User already exists', 409, 'conflict');

  const password = generateRandomPassword(12);
  const user = await UserModel.create({
    email,
    name: input.name.trim(),
    passwordHash: hashPassword(password),
    isActive: true,
  });

  return { user, password };
}

export async function acceptInvitation(input: { token: string; password: string }) {
  const tokenHash = sha256Hex(input.token);

  const invitation = await UserInvitationModel.findOne({
    tokenHash,
    acceptedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  }).select('+tokenHash');

  if (!invitation) throw new AppError('Invalid or expired invitation', 400, 'invalid_token');

  const existingUser = await UserModel.findOne({ email: invitation.email }).lean();
  if (existingUser) throw new AppError('User already exists', 409, 'conflict');

  const user = await UserModel.create({
    email: invitation.email,
    name: invitation.name,
    passwordHash: hashPassword(input.password),
    isActive: true,
  });

  invitation.acceptedAt = new Date();
  await invitation.save();

  return { user, invitation };
}

export async function listAdminUsers() {
  const users = await UserModel.find({}).sort({ createdAt: -1 }).lean();
  return sanitizeLeanArray(users as any);
}

export async function updateAdminUser(params: {
  actorUserId: string;
  targetUserId: string;
  patch: { isActive?: boolean };
}) {
  const target = await UserModel.findById(params.targetUserId);
  if (!target) throw new AppError('User not found', 404, 'not_found');

  if (typeof params.patch.isActive === 'boolean') {
    if (params.actorUserId === params.targetUserId && params.patch.isActive === false) {
      throw new AppError('You cannot deactivate yourself', 400, 'validation_error');
    }
    target.isActive = params.patch.isActive;
  }

  await target.save();
  return target;
}

export async function bootstrapFirstUser(input: { email: string; name: string; password: string }) {
  const existingCount = await UserModel.countDocuments({});
  if (existingCount > 0) {
    throw new AppError('Bootstrap already completed', 409, 'conflict');
  }

  const email = input.email.toLowerCase().trim();
  const user = await UserModel.create({
    email,
    name: input.name.trim(),
    passwordHash: hashPassword(input.password),
    isActive: true,
  });

  return user;
}
