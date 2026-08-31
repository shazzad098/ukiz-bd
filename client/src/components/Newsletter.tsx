/**
 * Design reminder — Aurelia Scent House:
 * Newsletter capture should feel like joining a private mailing list, with disciplined feedback and no aggressive persuasion.
 */
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";

type Status = "idle" | "success" | "error";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const subscribe = (event: FormEvent) => {
    event.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setStatus("success");
    setMessage("Thank you. Your invitation to the next Aurelia release is reserved.");
    setEmail("");
    setPhone("");
  };

  return (
    <section className="newsletter-section" aria-labelledby="newsletter-title">
      <div className="newsletter-section__copy">
        <p className="eyebrow eyebrow--rose">PRIVATE NOTES FROM THE HOUSE</p>
        <h2 id="newsletter-title">A quieter kind of <em>inbox.</em></h2>
        <p>New editions, scent studies, and early access to small-batch releases — sent only when there is something worth opening.</p>
      </div>
      <form className="newsletter-form" onSubmit={subscribe} noValidate>
        <div className="newsletter-form__fields">
          <label><span>Email address</span><Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" autoComplete="email" /></label>
          <label><span>Phone <i>optional</i></span><Input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" placeholder="01XXXXXXXXX" autoComplete="tel" /></label>
        </div>
        <button type="submit">Join the list <ArrowRight size={17} /></button>
        {status !== "idle" && <p className={`newsletter-form__message newsletter-form__message--${status}`} role="status">{status === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}{message}</p>}
      </form>
    </section>
  );
}
