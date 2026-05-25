import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Megaphone, ShoppingCart, PercentCircle, TicketPercent, Bell, Tag, ImageIcon } from 'lucide-react';
const tiles = [
  { href: "/dashboard/marketing/Announcement-bar", title: "Announcement bar", desc: "Site-wide banner messages.", icon: Bell  },
  { href: "/dashboard/marketing/coupons", title: "Coupons", desc: "Discount codes applied at checkout.", icon: TicketPercent },
  { href: "/dashboard/marketing/offers", title: "Offers", desc: "Discounts by product, collection, or category.", icon: PercentCircle },
 // { href: "/dashboard/marketing/campaigns", title: "Campaigns", desc: "Group coupons and offers.", icon: Tag  },
  { href: "/dashboard/marketing/hero", title: "Hero slides", desc: "Configure homepage hero images and localized text.", icon: ImageIcon },
  { href: "/dashboard/marketing/lookbooks", title: "Lookbooks", desc: "Editorial outfit stories and campaigns.", icon: Megaphone },
  { href: "/dashboard/marketing/abandoned-carts", title: "Abandoned carts", desc: "Recover dropped checkouts.", icon: ShoppingCart },
];

export default function DashboardMarketingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Marketing</h1>
        <p className="text-sm text-black/60 mt-1">
          Manage promotions, announcements, and cart recovery from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card className="relative px-4 py-8 h-full bg-white space-y-1">
              <t.icon size={100} className="absolute z-0 inset-0 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-14 text-off-white" />
              <div className="relative z-10 font-medium">{t.title}</div>
              <div className="relative z-10 text-sm text-black/60">{t.desc}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
