"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PhoneInput from "react-phone-number-input";
import ar from "react-phone-number-input/locale/ar";
import "react-phone-number-input/style.css";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OrderService } from "@/lib/services/order.service";
import { ShippingService } from "@/lib/services/shipping.service";
import { PaymentService } from "@/lib/services/payment.service";
import { ProductService } from "@/lib/services/catalog/product.service";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatPrice } from "@/lib/utils/price";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { readCart } from "@/lib/utils/storeCart";
import type { ShippingCityDto, ShippingCountryDto } from "@/api/shipping";
import { FadeInSection, PageEnter } from "@/components/motion/Motion";
import { CheckoutTotalsSkeleton } from "@/components/ui/Skeletons";
import type { OrderDto } from "@/api/order";

export default function CheckoutPage() {
  const { lang, m } = useI18n();
  const [countries, setCountries] = useState<ShippingCountryDto[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderDto | null>(null);
  const [shippingCountryId, setShippingCountryId] = useState("");
  const [shippingCityId, setShippingCityId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string } | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState<string | undefined>("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const cart = useMemo(() => readCart(), []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [shippingRes, productsRes] = await Promise.all([
          ShippingService.listPublicCountries(),
          ProductService.listPublic(),
        ]);
        setCountries(shippingRes.countries);

        const productById = new Map(productsRes.products.map((p) => [p.id, p]));
        const nextSubtotal = cart.reduce((sum, line) => {
          const product = productById.get(line.productId);
          if (!product) return sum;
          return sum + (product.price ?? 0) * Math.max(1, Number(line.quantity) || 1);
        }, 0);
        setSubtotal(nextSubtotal);
      } finally {
        setLoading(false);
      }
    })();
  }, [cart]);

  const selectedCountry = countries.find((c) => c.id === shippingCountryId);
  const cities = (selectedCountry?.cities ?? []) as ShippingCityDto[];
  const selectedCity = cities.find((c) => c.id === shippingCityId);
  const shippingFee = selectedCity?.price ?? 0;

  // Tax is multiplicative: Final Price = Base Price × (1 + Tax Rate)
  // taxedSubtotal = subtotal × (1 + taxRate)  e.g. 300 × 1.17 = 351
  // taxAmount     = taxedSubtotal - subtotal   e.g. 351 - 300  = 51  (shown as info row)
  // total         = taxedSubtotal + shippingFee
  const taxRate = Math.max(0, selectedCountry?.taxFee ?? 0) / 100;
  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  const discountedTaxAmount = Math.round(discountedSubtotal * taxRate * 100) / 100;
  const displayDiscount = createdOrder?.discount ?? couponDiscount;
  const displayTaxAmount = createdOrder?.taxAmount ?? discountedTaxAmount;

  const isAr = lang === "ar";

  const canSubmit =
    cart.length > 0 &&
    !!shippingCountryId &&
    !!shippingCityId &&
    !!selectedCountry &&
    fullName.trim().length > 0 &&
    !!phone?.trim() &&
    line1.trim().length > 0;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Enter a coupon code");
      return;
    }
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const result = await OrderService.validateCoupon({
        couponCode: couponCode.trim(),
        items: cart.map((c) => ({
          productId: c.productId,
          quantity: c.quantity,
          selections: c.selections,
        })),
      });
      setAppliedCoupon({ code: result.couponCode });
      setCouponDiscount(result.discount);
    } catch (err) {
      setCouponError(getApiErrorMessage(err));
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setCouponDiscount(0);
  };

  const displayCurrencyCode = createdOrder?.currencyCode;
  const displaySubtotal = createdOrder?.subtotal ?? subtotal;
  const displayShippingFee = createdOrder?.shippingFee ?? shippingFee;
  const displayTotal = createdOrder?.total ?? Math.max(0, discountedSubtotal + displayTaxAmount + shippingFee);

  return (
    <PageEnter>
      <div className="mx-auto w-full max-w-3xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold">{m.pages.checkout.title}</h1>
        <p className="text-sm text-black/60">{m.pages.checkout.subtitle}</p>

        {cart.length === 0 ? (
          <Card className="p-6 text-sm">
            {m.pages.checkout.empty}{" "}
            <Link className="underline" href="/shop">
              {m.pages.checkout.browse}
            </Link>
            .
          </Card>
        ) : null}

       
        <FadeInSection>
          <Card className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm mb-1">{m.pages.checkout.fullName}</div>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm mb-1">{m.pages.checkout.phone}</div>
                <PhoneInput
                  international
                  defaultCountry="AE"
                  labels={isAr ? ar : undefined}
                  value={phone}
                  onChange={setPhone}
                  numberInputProps={{
                    className:
                      "w-full h-12 rounded border border-black/10 bg-white px-4 text-sm text-deep-black outline-none transition-all duration-300 focus:border-gold focus:ring-2 focus:ring-gold/15",
                  }}
                  countrySelectProps={{ className: "h-12 rounded border border-black/10 bg-white px-3 mx-2 text-sm" }}
                />
              </div>
              <div className="col-span-2">
                <div className="text-sm mb-1">{m.pages.checkout.line1}</div>
                <Input value={line1} onChange={(e) => setLine1(e.target.value)} />
              </div>
              <div className="col-span-2">
                <div className="text-sm mb-1">{m.pages.checkout.line2}</div>
                <Input value={line2} onChange={(e) => setLine2(e.target.value)} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm mb-1">{m.pages.checkout.state}</div>
                <Input value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm mb-1">{m.pages.checkout.postalCode}</div>
                <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm mb-1">{m.pages.checkout.country}</div>
                <select
                  className="h-11 w-full rounded border border-black/10 px-3 text-sm"
                  value={shippingCountryId}
                  onChange={(e) => {
                    const next = e.target.value;
                    setShippingCountryId(next);
                    setShippingCityId("");
                  }}
                  disabled={loading}
                >
                  <option value="">{m.pages.checkout.country}</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {(isAr ? c.name.ar : c.name.en) || c.name.en}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm mb-1">{m.pages.checkout.city}</div>
                <select
                  className="h-11 w-full rounded border border-black/10 px-3 text-sm"
                  value={shippingCityId}
                  onChange={(e) => setShippingCityId(e.target.value)}
                  disabled={loading || !shippingCountryId}
                >
                  <option value="">{m.pages.checkout.city}</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {(isAr ? c.name.ar : c.name.en) || c.name.en} ({formatPrice(c.price)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className="text-sm mb-1">{m.pages.checkout.coupon}</div>
                <div className="flex gap-2">
                  <Input 
                    value={couponCode} 
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError("");
                    }}
                    disabled={!!appliedCoupon}
                    placeholder={appliedCoupon ? appliedCoupon.code : "Enter code"}
                  />
                  {!appliedCoupon ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                    >
                      {applyingCoupon ? "..." : "Apply"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {couponError && <div className="text-xs text-red-600 mt-1">{couponError}</div>}
                {appliedCoupon && (
                  <div className="text-xs text-green-600 mt-1">✓ {appliedCoupon.code} applied</div>
                )}
              </div>
            </div>

            <div className="pt-2">
              {loading ? (
                <CheckoutTotalsSkeleton />
              ) : (
                <div className="mb-4 rounded border border-black/10 p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span>{m.pages.checkout.subtotal}</span>
                    <span>{formatPrice(displaySubtotal, { currencyCode: displayCurrencyCode })}</span>
                  </div>
                  {displayDiscount > 0 ? (
                    <div className="flex items-center justify-between">
                      <span>Discount</span>
                      <span>-{formatPrice(displayDiscount, { currencyCode: displayCurrencyCode })}</span>
                    </div>
                  ) : null}
                  {displayTaxAmount > 0 ? (
                    <div className="flex items-center justify-between">
                      <span>Tax ({Math.max(0, selectedCountry?.taxFee ?? 0)}%)</span>
                      <span>{formatPrice(displayTaxAmount, { currencyCode: displayCurrencyCode })}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span>{m.pages.checkout.delivery}</span>
                    <span>{formatPrice(displayShippingFee, { currencyCode: displayCurrencyCode })}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold pt-1 border-t border-black/10">
                    <span>{m.pages.checkout.total}</span>
                    <span>{formatPrice(displayTotal, { currencyCode: displayCurrencyCode })}</span>
                  </div>
                </div>
              )}
              <Button
                disabled={!canSubmit || placing}
                onClick={async () => {
                  if (!canSubmit) return;
                  setPlacing(true);
                  try {
                    const orderRes = await OrderService.create({
                      items: cart.map((c) => ({
                        productId: c.productId,
                        quantity: c.quantity,
                        selections: c.selections,
                      })),
                      shippingMethodId: shippingCityId,
                      shippingAddress: {
                        fullName,
                        phone: phone || "",
                        line1,
                        line2: line2 || undefined,
                        city: selectedCity?.name?.en || "",
                        state: state || undefined,
                        country: selectedCountry?.name?.en || "",
                        postalCode: postalCode || undefined,
                      },
                      couponCode: appliedCoupon?.code || undefined,
                    }, { silent: true });
                    setCreatedOrder(orderRes.order);
                    const session = await PaymentService.createCheckoutSession({
                      orderId: orderRes.order.id,
                      accessToken: orderRes.accessToken,
                    });
                    if (session.url) {
                      window.location.href = session.url;
                      return;
                    }
                    throw new Error("Failed to create Stripe checkout session");
                  } finally {
                    setPlacing(false);
                  }
                }}
              >
                {placing ? m.pages.checkout.redirecting : m.pages.checkout.payWithStripe}
              </Button>
            </div>
          </Card>
        </FadeInSection>
      </div>
    </PageEnter>
  );
}