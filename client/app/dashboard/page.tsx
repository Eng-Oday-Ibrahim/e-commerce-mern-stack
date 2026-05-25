/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DashboardApi, type DashboardAnalytics } from "@/lib/api/dashboard";
import { formatPrice } from "@/lib/utils/price";

const MS_DAY = 86_400_000;

type RangeOption = "last7" | "last30" | "last365" | "custom";

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getRangeDates(option: RangeOption) {
  const today = new Date();
  const end = new Date(today.getTime());
  const start = new Date(today.getTime());

  switch (option) {
    case "last7":
      start.setDate(today.getDate() - 6);
      break;
    case "last365":
      start.setDate(today.getDate() - 364);
      break;
    case "last30":
      start.setDate(today.getDate() - 29);
      break;
    default:
      start.setDate(today.getDate() - 29);
      break;
  }

  return {
    from: formatDateInput(start),
    to: formatDateInput(end),
  };
}

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: React.ReactNode;
}) {
  return (
    <Card className="p-4 space-y-1">
      <div className="text-xs font-medium uppercase tracking-wide text-black/50">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {hint ? <div className="text-xs text-black/50">{hint}</div> : null}
    </Card>
  );
}

function TrendBar({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
      <div className="h-full rounded-full bg-gradient-to-r from-slate-900 to-slate-500" style={{ width: `${width}%` }} />
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [rangeOption, setRangeOption] = useState<RangeOption>("last30");
  const [from, setFrom] = useState(() => getRangeDates("last30").from);
  const [to, setTo] = useState(() => getRangeDates("last30").to);

  const rangeLabel = useMemo(() => {
    switch (rangeOption) {
      case "last7":
        return "Last 7 days";
      case "last30":
        return "Last 30 days";
      case "last365":
        return "Last year";
      default:
        return `Custom: ${from} → ${to}`;
    }
  }, [from, rangeOption, to]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await DashboardApi.analytics({ from, to });
      setData(res.analytics);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    if (rangeOption !== "custom") {
      const next = getRangeDates(rangeOption);
      setFrom(next.from);
      setTo(next.to);
    }
  }, [rangeOption]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const ordersCount = useMemo(
    () => (data ? Object.values(data.ordersByStatus).reduce((acc, cur) => acc + cur, 0) : 0),
    [data]
  );

  const recentOrders = useMemo(() => data?.recentOrders.slice(0, 5) ?? [], [data]);
  const latestTrend = useMemo(() => data?.trend.slice(-10) ?? [], [data]);
  const maxTrendOrders = useMemo(
    () => Math.max(1, ...(latestTrend.map((item) => item.orders) ?? [1])),
    [latestTrend]
  );

  if (loading) {
    return <div className="text-sm text-black/60">Loading overview…</div>;
  }

  if (!data) {
    return <div className="text-sm text-black/60">Could not load analytics.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Overview</h1>
            {rangeOption === 'custom' ? (
              <p className="text-sm text-black/60 mt-1">Track real store performance over a custom date range.</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded border border-black/10 bg-white px-3 py-2 text-sm text-black/60">{rangeLabel}</div>
            <select
              className="h-10 rounded border border-black/10 bg-white px-3 text-sm"
              value={rangeOption}
              onChange={(e) => setRangeOption(e.target.value as RangeOption)}
            >
              <option value="last7">Last 7 days</option>
              <option value="last30">Last 30 days</option>
              <option value="last365">Last year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
        </div>

            {rangeOption === 'custom' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[220px_1fr] gap-3 mt-4">
          <label className="space-y-1 text-sm">
            From
            <input
              type="date"
              className="h-10 w-full rounded border border-black/10 bg-white px-3 text-sm"
              value={from}
              onChange={(e) => {
                setRangeOption("custom");
                setFrom(e.target.value);
              }}
            />
          </label>
          <label className="space-y-1 text-sm">
            To
            <input
              type="date"
              className="h-10 w-full rounded border border-black/10 bg-white px-3 text-sm"
              value={to}
              onChange={(e) => {
                setRangeOption("custom");
                setTo(e.target.value);
              }}
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="button"
              className="h-10 rounded bg-slate-900 px-4 text-sm font-semibold text-white"
              onClick={loadAnalytics}
            >
              Refresh
            </button>
          </div>
        </div>
 ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Orders" value={String(ordersCount)} />
        <StatCard title="Revenue" value={formatPrice(data.revenueTotal)} hint="Paid & shipped orders" />
        <StatCard
          title="New customers"
          value={String(data.newCustomersCount)}
          hint={data.pendingReviews > 0 ? `${data.pendingReviews} pending review${data.pendingReviews === 1 ? "" : "s"}` : undefined}
        />
        <StatCard title="Low stock SKUs" value={String(data.lowStockCount)} hint={`Below ${data.lowStockThreshold} units available`} />
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="font-medium text-sm">Recent orders</div>
          <Link href="/dashboard/orders" className="text-sm text-slate-900 underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-black/10">
          {recentOrders.length === 0 ? (
            <div className="text-sm text-black/60 py-2">No recent orders.</div>
          ) : (
            recentOrders.map((o) => (
              <div key={o.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                <span>
                  #{o.orderNumber} <span className="text-black/50 capitalize">{o.status}</span>
                </span>
                <span>{formatPrice(o.total)}</span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
