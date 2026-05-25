import { Types } from 'mongoose';
import { AppError } from '../../../shared/middleware/errorHandler';
import { OrderModel } from '../../orders/models/order.model';
import { CouponModel } from '../models/coupon.model';

function decToNum(v: any): number {
  const raw = v?.toString?.() ?? v;
  const n = typeof raw === 'string' ? Number(raw) : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export async function computeCouponDiscount(input: {
  code: string;
  customerId?: string;
  currencyCode: string;
  subtotal: number;
}): Promise<{ discount: number; couponId: string; normalizedCode: string }> {
  const normalized = input.code.trim().toUpperCase();
  if (!normalized) throw new AppError('Coupon required', 400, 'validation_error');

  const coupon = await CouponModel.findOne({ code: normalized, isActive: true });
  if (!coupon) throw new AppError('Invalid coupon code', 400, 'validation_error');

  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) throw new AppError('Coupon not active yet', 400, 'validation_error');
  if (coupon.endsAt && now > coupon.endsAt) throw new AppError('Coupon expired', 400, 'validation_error');

  if (coupon.currencyCode && coupon.currencyCode !== input.currencyCode) {
    throw new AppError('Coupon does not apply to this currency', 400, 'validation_error');
  }

  if (input.subtotal < decToNum(coupon.minSubtotal)) {
    throw new AppError('Order subtotal below coupon minimum', 400, 'validation_error');
  }

  if (coupon.maxRedemptions != null && coupon.redemptionsCount >= coupon.maxRedemptions) {
    throw new AppError('Coupon usage limit reached', 400, 'validation_error');
  }

  if (input.customerId) {
    const customerOid = new Types.ObjectId(input.customerId);
    const used = await OrderModel.countDocuments({
      customerId: customerOid,
      couponCode: normalized,
      status: { $nin: ['canceled'] },
    });
    if (coupon.perCustomerMax != null && used >= coupon.perCustomerMax) {
      throw new AppError('You have already used this coupon', 400, 'validation_error');
    }
  }

  let discount = 0;
  if (coupon.type === 'percent') {
    const p = coupon.percentOff ?? 0;
    discount = Math.round(((input.subtotal * p) / 100 + Number.EPSILON) * 100) / 100;
  } else {
    discount = decToNum(coupon.fixedOff);
  }

  discount = Math.min(discount, input.subtotal);
  if (discount < 0) discount = 0;

  return {
    discount,
    couponId: coupon._id.toString(),
    normalizedCode: normalized,
  };
}

export async function incrementCouponUsage(couponId: string) {
  await CouponModel.updateOne({ _id: new Types.ObjectId(couponId) }, { $inc: { redemptionsCount: 1 } });
}
