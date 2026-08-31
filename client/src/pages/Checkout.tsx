/** The checkout only gathers delivery details; totals and payment authority remain server-owned. */
import { ArrowRight, CreditCard, MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useCart } from "@/contexts/CartContext";
import { productCatalog } from "@/data/catalog";
import { trpc } from "@/lib/trpc";

const money = new Intl.NumberFormat("en-BD");
type Zone = "inside_dhaka" | "outside_dhaka";
type PaymentMethod = "cash_on_delivery" | "gateway_pending";
type AddressDraft = { division: string; district: string; thana: string; detailedAddress: string; phone: string };
const blankAddress: AddressDraft = { division: "", district: "", thana: "", detailedAddress: "", phone: "" };

export default function Checkout() {
  const { lines, clearAfterCheckout } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const profile = trpc.customer.profile.useQuery(undefined, { enabled: isAuthenticated });
  const saved = trpc.customer.addresses.useQuery(undefined, { enabled: isAuthenticated });
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<AddressDraft>(blankAddress); const [addressId, setAddressId] = useState<number | undefined>();
  const [zone, setZone] = useState<Zone>("inside_dhaka"); const [payment, setPayment] = useState<PaymentMethod>("cash_on_delivery");
  const [instructions, setInstructions] = useState(""); const [couponEntry, setCouponEntry] = useState(""); const [couponCode, setCouponCode] = useState("");
  useEffect(() => { if (user) { setName((value) => value || user.name || ""); setEmail((value) => value || user.email || ""); setPhone((value) => value || profile.data?.profile?.phone || ""); } }, [profile.data?.profile?.phone, user]);
  useEffect(() => { if (phone.trim()) setAddress((current) => current.phone === phone ? current : { ...current, phone }); }, [phone]);
  const checkoutLines = useMemo(() => lines.map(({ productSlug, variantSize, quantity }) => ({ productSlug, variantSize, quantity })), [lines]);
  const quoteInput = useMemo(() => ({ deliveryZone: zone, couponCode: couponCode || undefined, lines: checkoutLines }), [checkoutLines, couponCode, zone]);
  const quote = trpc.checkout.quote.useQuery(quoteInput, { enabled: lines.length > 0, retry: false });
  const beginPayment = trpc.payment.start.useMutation();
  const create = trpc.checkout.create.useMutation({
    onSuccess: async (result) => {
      await clearAfterCheckout();
      const token = result.accessToken ? `?token=${encodeURIComponent(result.accessToken)}` : "";
      if (payment === "gateway_pending") {
        try {
          const session = await beginPayment.mutateAsync({ orderNumber: result.orderNumber, accessToken: result.accessToken ?? undefined });
          if (!session.gatewayUrl) throw new Error("The secure payment page was unavailable. Please retry from your confirmation.");
          window.location.assign(session.gatewayUrl);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "The order was preserved but the payment gateway could not be opened.");
          setLocation(`/order-confirmation/${result.orderNumber}${token}&payment=retry`);
        }
        return;
      }
      setLocation(`/order-confirmation/${result.orderNumber}${token}`);
    },
    onError: (error) => toast.error(error.message),
  });
  const chooseAddress = (id: number) => { const entry = saved.data?.find((item) => item.id === id); if (!entry) return; setAddressId(id); setAddress({ division: entry.division, district: entry.district, thana: entry.thana, detailedAddress: entry.detailedAddress, phone: entry.phone }); setPhone((current) => current || entry.phone); };
  const submit = (event: FormEvent) => { event.preventDefault(); const shippingAddress = { ...address, phone: address.phone.trim() || phone.trim() }; if (!lines.length) return toast.error("Your bag is empty."); if (!name.trim() || !email.trim() || !phone.trim()) return toast.error("Complete your customer information before continuing."); if (!addressId && Object.values(shippingAddress).some((value) => !value.trim())) return toast.error("Complete your delivery address before continuing."); create.mutate({ name, email, phone, addressId, address: addressId ? undefined : shippingAddress, deliveryZone: zone, deliveryInstructions: instructions || undefined, couponCode: couponCode || undefined, paymentMethod: payment, lines: checkoutLines }); };
  if (!lines.length) return <div className="aurelia-site checkout-page"><SiteHeader /><main className="checkout-empty"><PackageCheck size={32} /><p className="eyebrow">CHECKOUT REGISTER</p><h1>Your bag needs a <em>selection.</em></h1><p>Return to the collection and bring a fragrance study with you.</p><Link href="/shop">Browse the house <ArrowRight size={16} /></Link></main><SiteFooter /></div>;
  const busy = create.isPending || beginPayment.isPending || quote.isLoading || quote.isError;
  return <div className="aurelia-site checkout-page"><SiteHeader /><main><section className="checkout-hero"><p className="eyebrow">PRIVATE CHECKOUT · 02</p><h1>Complete the <em>register.</em></h1><p>Each detail is read once more before your selection is held for dispatch.</p><div className="checkout-stepper">{["Information", "Delivery", "Payment", "Review"].map((label, index) => <span key={label}><b>{String(index + 1).padStart(2, "0")}</b>{label}</span>)}</div></section><form className="checkout-layout" onSubmit={submit}><div className="checkout-form"><section><CheckoutHeading icon={<ShieldCheck size={18} />} number="01" title="Customer information" copy="A clear way to reach you about your delivery." /><div className="checkout-fields checkout-fields--two"><label>Full name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" /></label><label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><label>Phone<input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01XXXXXXXXX" /></label></div></section><section><CheckoutHeading icon={<MapPin size={18} />} number="02" title="Shipping address" copy="Choose a saved address or add an address for this delivery." />{saved.data?.length ? <div className="saved-address-picker"><button type="button" className={!addressId ? "is-active" : ""} onClick={() => setAddressId(undefined)}>Use a new address</button>{saved.data.map((item) => <button type="button" className={addressId === item.id ? "is-active" : ""} onClick={() => chooseAddress(item.id)} key={item.id}><span>{item.label}{item.isDefault ? " · Default" : ""}</span><small>{item.detailedAddress}, {item.thana}</small></button>)}</div> : null}<div className="checkout-fields checkout-fields--two"><label>Division<input required disabled={Boolean(addressId)} value={address.division} onChange={(event) => setAddress({ ...address, division: event.target.value })} /></label><label>District<input required disabled={Boolean(addressId)} value={address.district} onChange={(event) => setAddress({ ...address, district: event.target.value })} /></label><label>Thana / Upazila<input required disabled={Boolean(addressId)} value={address.thana} onChange={(event) => setAddress({ ...address, thana: event.target.value })} /></label><label>Detailed address<input required disabled={Boolean(addressId)} value={address.detailedAddress} onChange={(event) => setAddress({ ...address, detailedAddress: event.target.value })} placeholder="House, road, building, floor" /></label><label>Delivery instructions <small>Optional</small><input value={instructions} onChange={(event) => setInstructions(event.target.value)} placeholder="Landmark or preferred handover note" /></label></div></section><section><CheckoutHeading icon={<Truck size={18} />} number="03" title="Delivery method" copy="Charges and timing are calculated from the current dispatch settings." /><div className="checkout-choice-grid"><button type="button" className={zone === "inside_dhaka" ? "is-selected" : ""} onClick={() => setZone("inside_dhaka")}><span>Inside Dhaka</span><small>Local city delivery</small></button><button type="button" className={zone === "outside_dhaka" ? "is-selected" : ""} onClick={() => setZone("outside_dhaka")}><span>Outside Dhaka</span><small>Nationwide delivery</small></button></div></section><section><CheckoutHeading icon={<CreditCard size={18} />} number="04" title="Payment method" copy="Aurelia never receives card or wallet data; the provider hosts the secure payment page." /><div className="checkout-choice-grid"><button type="button" className={payment === "cash_on_delivery" ? "is-selected" : ""} onClick={() => setPayment("cash_on_delivery")}><span>Cash on delivery</span><small>Payment is collected at delivery</small></button><button type="button" className={payment === "gateway_pending" ? "is-selected" : ""} onClick={() => setPayment("gateway_pending")}><span>SSLCOMMERZ Sandbox</span><small>Hosted bKash, Nagad, Visa, Mastercard &amp; provider methods</small></button></div>{payment === "gateway_pending" && <p className="payment-provider-note">You will be redirected to SSLCOMMERZ’s encrypted sandbox checkout. Aurelia confirms payment only after server-side provider validation.</p>}</section></div><aside className="checkout-review"><p className="eyebrow">ORDER REVIEW</p><div className="checkout-review__items">{lines.map((line) => { const product = productCatalog.find((item) => item.slug === line.productSlug); const variant = product?.variants.find((item) => item.size === line.variantSize); if (!product || !variant) return null; return <article key={line.id}><img src={product.image} alt="" /><p><small>{product.brand}</small><strong>{product.name}</strong><span>{line.variantSize} · Qty {line.quantity}</span></p><b>৳ {money.format(variant.price * line.quantity)}</b></article>; })}</div><div className="checkout-coupon"><input value={couponEntry} onChange={(event) => setCouponEntry(event.target.value)} placeholder="Coupon code" /><button type="button" onClick={() => setCouponCode(couponEntry.trim().toUpperCase())}>Apply</button></div>{quote.isError && <p className="checkout-error">{quote.error.message}</p>}{quote.data ? <><div className="checkout-total"><p><span>Subtotal</span><strong>৳ {money.format(quote.data.subtotal)}</strong></p><p><span>Delivery</span><strong>৳ {money.format(quote.data.deliveryFee)}</strong></p>{quote.data.discount > 0 && <p className="is-discount"><span>{quote.data.couponCode} saving</span><strong>−৳ {money.format(quote.data.discount)}</strong></p>}<h3><span>Total</span><strong>৳ {money.format(quote.data.total)}</strong></h3></div><div className="checkout-arrival"><Truck size={15} /><span>Estimated arrival <b>{new Date(quote.data.estimatedDeliveryAt).toLocaleDateString("en-BD", { weekday: "short", month: "short", day: "numeric" })}</b></span></div></> : <p className="checkout-quote-loading">Reading current delivery and stock…</p>}<button className="checkout-submit" disabled={busy}>{create.isPending ? "Holding your selection…" : beginPayment.isPending ? "Opening secure payment…" : payment === "gateway_pending" ? <>Continue to payment <ArrowRight size={16} /></> : <>Place order <ArrowRight size={16} /></>}</button><small>Totals, coupons, prices, stock, and payment status are verified by the server.</small></aside></form></main><SiteFooter /></div>;
}

function CheckoutHeading({ icon, number, title, copy }: { icon: React.ReactNode; number: string; title: string; copy: string }) { return <header className="checkout-section-heading"><span>{number}</span><div>{icon}<h2>{title}</h2><p>{copy}</p></div></header>; }
