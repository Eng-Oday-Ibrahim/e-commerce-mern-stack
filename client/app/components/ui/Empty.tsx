"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Package,
  Search,
  Users,
  Inbox,
  ClipboardList,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { Button } from "./Button";

type EmptyVariant = "cart" | "wishlist" | "orders" | "search" | "customers" | "messages" | "products" | "reviews" | "generic";

interface EmptyProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

const iconMap: Record<EmptyVariant, { icon: LucideIcon; title: string; description: string }> = {
  cart: {
    icon: ShoppingCart,
    title: "Your cart is empty",
    description: "Start shopping to add items to your cart",
  },
  wishlist: {
    icon: Heart,
    title: "Your wishlist is empty",
    description: "Add items to your wishlist to save them for later",
  },
  orders: {
    icon: Package,
    title: "No orders yet",
    description: "You haven't placed any orders. Start shopping to make your first purchase",
  },
  search: {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search terms or filters",
  },
  customers: {
    icon: Users,
    title: "No customers",
    description: "Customers will appear here when they join",
  },
  messages: {
    icon: Inbox,
    title: "No messages",
    description: "You don't have any messages yet",
  },
  products: {
    icon: ClipboardList,
    title: "No products",
    description: "Add products to get started",
  },
  reviews: {
    icon: Eye,
    title: "No reviews",
    description: "Reviews will appear here when customers leave feedback",
  },
  generic: {
    icon: Inbox,
    title: "Nothing here",
    description: "Start creating content to populate this section",
  },
};

export default function Empty({
  variant = "generic",
  title,
  description,
  icon: CustomIcon,
  actionLabel,
  actionHref,
  onAction,
  className = "",
}: EmptyProps) {
  const config = iconMap[variant];
  const Icon = CustomIcon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      {/* Animated Icon Background */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6"
      >
        <div className="relative">
          {/* Background glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-gold/20 to-transparent rounded-full blur-2xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ width: "120px", height: "120px", left: "-40px", top: "-40px" }}
          />

          {/* Icon container */}
          <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20">
            <Icon className="w-10 h-10 text-gold" strokeWidth={1.5} />
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="text-xl font-semibold text-deep-black mb-2"
      >
        {displayTitle}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-sm text-black/60 max-w-md mb-6"
      >
        {displayDescription}
      </motion.p>

      {/* Action Button */}
      {(actionLabel || onAction || actionHref) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {actionHref ? (
            <Button
              href={actionHref}
              variant="primary"
              size="sm"
              className="mt-2"
            >
              {actionLabel || "Browse Now"}
            </Button>
          ) : (
            <Button
              onClick={onAction}
              variant="primary"
              size="sm"
              className="mt-2"
            >
              {actionLabel || "Try Again"}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
