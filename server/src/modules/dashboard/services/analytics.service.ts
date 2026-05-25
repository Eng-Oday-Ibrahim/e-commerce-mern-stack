import { CustomerModel } from '../../identity/models/customer.model';
import { OrderModel } from '../../orders/models/order.model';
import { ReviewModel } from '../../reviews/models/review.model';
import { StockItemModel } from '../../stock/models/stock.model';

const LOW_STOCK_THRESHOLD = 5;
const MS_DAY = 86_400_000;

type DashboardAnalyticsOptions = {
  from?: string;
  to?: string;
};

function parseDateForRange(value?: string, defaultValue?: Date) {
  if (!value) return defaultValue;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) ? parsed : defaultValue;
}

function parseDateEndOfDay(value?: string, defaultValue?: Date) {
  if (!value) return defaultValue;
  const parsed = new Date(`${value}T23:59:59.999Z`);
  return Number.isFinite(parsed.getTime()) ? parsed : defaultValue;
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getDashboardAnalytics(opts: DashboardAnalyticsOptions = {}) {
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * MS_DAY);
  const rangeStart = parseDateForRange(opts.from, defaultFrom) as Date;
  const rangeEnd = parseDateEndOfDay(opts.to, now) as Date;

  const [
    ordersByStatus,
    revenueAgg,
    pendingReviews,
    lowStockCount,
    newCustomers,
    ordersRecent,
    dailyTrend,
  ] = await Promise.all([
    OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: rangeStart, $lte: rangeEnd },
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } },
    ]),
    OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: rangeStart, $lte: rangeEnd },
          paymentStatus: { $in: ['paid'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    ReviewModel.countDocuments({ status: 'pending' }),
    StockItemModel.countDocuments({ availableQty: { $lt: LOW_STOCK_THRESHOLD } }),
    CustomerModel.countDocuments({ createdAt: { $gte: rangeStart, $lte: rangeEnd } }),
    OrderModel.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select({ orderNumber: 1, status: 1, total: 1, currencyCode: 1, createdAt: 1 })
      .lean(),
    OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: rangeStart, $lte: rangeEnd },
        },
      },
      {
        $project: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] },
        },
      },
      {
        $group: {
          _id: '$date',
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const revenueTotal = Number(revenueAgg[0]?.total?.toString?.() ?? revenueAgg[0]?.total ?? 0) || 0;

  const statusCounts: Record<string, number> = {};
  for (const row of ordersByStatus as any[]) {
    statusCounts[row.status] = row.count;
  }

  const trendMap = new Map<string, { orders: number; revenue: number }>();
  for (const row of dailyTrend as any[]) {
    trendMap.set(row._id, {
      orders: row.orders,
      revenue: Number(row.revenue?.toString?.() ?? row.revenue ?? 0) || 0,
    });
  }

  const trend: Array<{ date: string; orders: number; revenue: number }> = [];
  for (let dt = new Date(rangeStart); dt <= rangeEnd; dt.setUTCDate(dt.getUTCDate() + 1)) {
    const key = formatDateKey(dt);
    const entry = trendMap.get(key);
    trend.push({ date: key, orders: entry?.orders ?? 0, revenue: entry?.revenue ?? 0 });
  }

  return {
    ordersByStatus: statusCounts,
    revenueTotal,
    pendingReviews,
    lowStockCount,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    newCustomersCount: newCustomers,
    recentOrders: (ordersRecent as any[]).map((o) => ({
      id: o._id?.toString?.() ?? String(o._id),
      orderNumber: o.orderNumber,
      status: o.status,
      total: Number(o.total?.toString?.() ?? o.total ?? 0) || 0,
      currencyCode: o.currencyCode,
      createdAt: o.createdAt,
    })),
    trend,
    rangeStart: formatDateKey(rangeStart),
    rangeEnd: formatDateKey(rangeEnd),
  };
}
