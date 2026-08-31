/**
 * Design reminder — Aurelia Scent House:
 * The footer acts as a useful endcap to the shop, with service links and contact details arranged as a refined colophon.
 */
import { ArrowUp, Facebook, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { footerGroups } from "@/data/catalog";

export function SiteFooter() {
  return (
    <footer className="aurelia-footer">
      <div className="aurelia-footer__top">
        <div className="aurelia-footer__brand">
          <img className="ukiz-footer-logo" src="/manus-storage/ukiz-logo_b0f17e09.jpg" alt="UKIZ logo, since 2026" />
          <p>Fragrance for a more personal kind of presence.</p>
          <div className="footer-socials"><button onClick={() => toast("Instagram will be available shortly.")} aria-label="Instagram"><Instagram size={17} /></button><button onClick={() => toast("Facebook will be available shortly.")} aria-label="Facebook"><Facebook size={17} /></button><button onClick={() => toast("WhatsApp will be available shortly.")} aria-label="WhatsApp"><MessageCircle size={17} /></button></div>
        </div>
        {footerGroups.map((group) => <div className="footer-nav-group" key={group.title}><span>{group.title}</span>{group.links.map((link) => <button onClick={() => toast(`${link} will be available shortly.`)} key={link}>{link}</button>)}</div>)}
        <div className="footer-contact"><span>House details</span><a href="tel:+8801700000000"><Phone size={14} />+880 1700 000 000</a><a href="mailto:hello@aurelia.house">hello@aurelia.house</a><p><MapPin size={14} />Gulshan Avenue<br />Dhaka, Bangladesh</p></div>
      </div>
      <div className="aurelia-footer__base"><span>© 2026 UKIZ</span><span>Privacy-minded commerce</span><button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top <ArrowUp size={14} /></button></div>
    </footer>
  );
}
