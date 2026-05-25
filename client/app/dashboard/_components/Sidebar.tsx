"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Home, ShoppingCart, List, Package, Badge, Users, Megaphone, Truck, UserPlus, Grid, Stars, X, Currency } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/categories", label: "Categories", icon: List },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/options", label: "Options", icon:  Badge},
  { href: "/dashboard/collections", label: "Collections", icon: Grid },
  { href: "/dashboard/reviews", label: "Reviews", icon: Stars },
  { href: "/dashboard/stock", label: "Stock", icon: Package },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/marketing", label: "Marketing", icon: Megaphone },
  { href: "/dashboard/shipping", label: "Shipping", icon: Truck },
  { href: "/dashboard/team", label: "Team", icon: UserPlus },
  { href: "/dashboard/currencies", label: "Currencies", icon: Currency },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-black/10 bg-white transform transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between">
          <div className="text-sm font-semibold tracking-[0.08em] uppercase">Dashboard</div>
          <button className="md:hidden p-1" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="h-[calc(100vh-65px)] overflow-y-auto px-3 py-2 space-y-1">
          {links.map((l) => {
            const active =
              pathname === l.href ||
              (l.href !== "/dashboard" && pathname?.startsWith(l.href));

            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={onClose}
                className={cn(
                  "block rounded group px-3 py-2 text-sm transition-colors",
                  active ? "bg-gray-100 font-medium" : "hover:bg-gray-100"
                )}
              >
                <p className={`group-hover:text-gold ${active ? "text-gold" : "text-gray-600"}`}>
                  <l.icon size={16} className="inline mr-3" />
                  {l.label}
                </p>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>

  );
}
