/**
 * Design reminder — Signature Fragrance replica:
 * The hero uses the source hierarchy: a compact category rail beside a burgundy perfume campaign.
 */
import { ChevronLeft, ChevronRight, Sparkles, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { categoryLinks } from "@/data/catalog";

const heroMessages = [
  ["BE DIFFERENT", "SMELL DIFFERENT"],
  ["FIND YOUR", "SIGNATURE SCENT"],
];

export function PromoHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [days, hours, minutes, seconds] = [0, 0, 0, 0];
  const headline = heroMessages[currentSlide];

  const shiftSlide = (direction: 1 | -1) => {
    setCurrentSlide((current) => (current + direction + heroMessages.length) % heroMessages.length);
  };

  return (
    <>
      <section className="promotional-top" aria-label="Seasonal fragrance promotion">
        <nav className="category-rail" aria-label="Fragrance categories">
          <div className="category-rail__head">
            <span>YOUR SIGNATURE CHOICE</span>
            <Sparkles size={15} fill="#f59ab0" color="#f59ab0" />
          </div>
          <div className="category-rail__list">
            {categoryLinks.map((category) => (
              <button key={category} onClick={() => toast(`${category} collection is coming soon.`)}>
                {category}
              </button>
            ))}
          </div>
        </nav>

        <div className="hero-column">
          <div className="hero-frame">
            <img src="/manus-storage/signature-hero_76e6ea79.jpg" alt="Curated fragrance collection on warm sandstone" />
            <div className="hero-frame__overlay" />
            <div className="hero-frame__brand">SIGNATURE <span>FRAGRANCE</span></div>
            <div className="hero-frame__headline" aria-live="polite">
              <span>{headline[0]}</span>
              <strong>{headline[1]}</strong>
            </div>
            <button className="hero-arrow hero-arrow--left" onClick={() => shiftSlide(-1)} aria-label="Previous campaign">
              <ChevronLeft size={30} />
            </button>
            <button className="hero-arrow hero-arrow--right" onClick={() => shiftSlide(1)} aria-label="Next campaign">
              <ChevronRight size={30} />
            </button>
          </div>
          <div className="delivery-ticker" aria-label="Delivery information">
            <div className="delivery-ticker__track">
              {[0, 1].map((loop) => (
                <span key={loop}>
                  Cash On Delivery All Over Bangladesh <Truck size={13} fill="currentColor" /> Cash On Delivery All Over Bangladesh <Truck size={13} fill="currentColor" /> Cash On Delivery All Over Bangladesh <Truck size={13} fill="currentColor" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="countdown-band" aria-label="Limited-time offer">
        <div className="countdown-band__shadow" />
        <div className="timer-grid">
          {[
            [days, "Days"],
            [String(hours).padStart(2, "0"), "Hr"],
            [String(minutes).padStart(2, "0"), "Min"],
            [String(seconds).padStart(2, "0"), "Sc"],
          ].map(([value, label]) => (
            <div className="timer-box" key={label as string}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
