import { AlertCircle, ArrowRight, RotateCcw, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function PaymentResult() {
  const state = new URLSearchParams(window.location.search).get("state") || "verification_failed";
  const network = state === "payment_error";
  return <div className="aurelia-site payment-result-page"><SiteHeader /><main className="payment-result"><div className="payment-result__index">06</div><div className="payment-result__mark">{network ? <RotateCcw size={26} /> : <AlertCircle size={26} />}</div><p className="eyebrow">PAYMENT REGISTER · SERVICE NOTE</p><h1>{network ? <>The gateway is taking a <em>moment.</em></> : <>We could not verify that <em>payment.</em></>}</h1><p>{network ? "Your order is carefully held in the register. Return to its confirmation to retry the secure payment when the connection is available." : "No payment has been marked as successful. Return to the confirmation issued for this order to retry the secure payment; the original selection remains held."}</p><div><Link href="/account?tab=orders">Return to your order <ArrowRight size={16} /></Link><Link href="/shop">Collection index <ShieldCheck size={16} /></Link></div></main><SiteFooter /></div>;
}
