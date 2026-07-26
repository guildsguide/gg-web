import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Star, Wifi, Coffee, Waves, ParkingCircle, BadgeCheck, Tag, SlidersHorizontal, ExternalLink, Loader2, AlertCircle } from "lucide-react";

// Points at wherever gg-backend is running. Locally that's the Express
// server started with `npm run dev` (http://localhost:4000). In production
// (Vercel), set NEXT_PUBLIC_API_BASE in the project's environment variables
// to your deployed backend's URL (e.g. your Render URL) — see gg-web/README.md.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

const AMENITY_ICON = {
  wifi: Wifi,
  breakfast: Coffee,
  "beach-access": Waves,
  "river-view": Waves,
  parking: ParkingCircle,
};

const SOURCE_LABEL = {
  "booking.com": "Booking.com",
  expedia: "Expedia",
  hotelbeds: "Hotelbeds",
};

function Seal() {
  return (
    <div className="relative w-14 h-14 shrink-0" title="GG verified best deal">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="46" fill="#2F6659" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="#EDEEE7" strokeWidth="2" strokeDasharray="4 3" />
        <text x="50" y="45" textAnchor="middle" fontSize="13" fontWeight="700" fill="#EDEEE7" fontFamily="serif">GG</text>
        <text x="50" y="62" textAnchor="middle" fontSize="8" fill="#B7CFC7" fontFamily="serif" letterSpacing="1">BEST DEAL</text>
      </svg>
    </div>
  );
}

function StarRow({ n }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={13} fill="#A6763B" stroke="#A6763B" />
      ))}
    </div>
  );
}

function HotelCard({ hotel }) {
  const cheapestOffer = hotel.offers.find((o) => o.source === hotel.bestEffectiveSource) || hotel.offers[0];
  return (
    <div className="flex gap-4 bg-white border border-stone-200 rounded-lg p-4">
      <Seal />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg text-[#1B2A41] leading-tight">{hotel.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <StarRow n={hotel.stars} />
              <span className="text-xs text-stone-500">{hotel.rating.toFixed(1)} rating</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-stone-400 line-through">₹{cheapestOffer?.price.toLocaleString("en-IN")}</div>
            <div className="text-xl font-semibold text-[#1B2A41]">₹{hotel.bestEffectivePrice.toLocaleString("en-IN")}</div>
            <div className="text-xs text-stone-500">per night, via {SOURCE_LABEL[hotel.bestEffectiveSource] || hotel.bestEffectiveSource}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {hotel.amenities.map((a) => {
            const Icon = AMENITY_ICON[a] || Wifi;
            return (
              <span key={a} className="flex items-center gap-1 text-xs text-stone-600 bg-stone-100 px-2 py-1 rounded">
                <Icon size={12} />
                {a.replace("-", " ")}
              </span>
            );
          })}
        </div>

        {hotel.bestEffectiveCoupon && (
          <div className="flex items-center gap-1.5 mt-3 text-sm text-[#2F6659]">
            <Tag size={14} />
            <span>{hotel.bestEffectiveCoupon.label}</span>
          </div>
        )}

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-stone-100 flex-wrap">
          <span className="text-xs text-stone-400">Also on:</span>
          {hotel.offers
            .filter((o) => o.source !== hotel.bestEffectiveSource)
            .map((o) => (
              <span key={o.source} className="flex items-center gap-1 text-xs text-stone-500">
                {SOURCE_LABEL[o.source] || o.source} ₹{o.price.toLocaleString("en-IN")}
              </span>
            ))}
          <button className="ml-auto flex items-center gap-1 text-xs font-medium text-[#1B2A41] hover:underline">
            View deal <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GGSearchPrototype() {
  const [areaInput, setAreaInput] = useState("Rishikesh");
  const [area, setArea] = useState("Rishikesh"); // committed search term (Enter / blur)
  const [budget, setBudget] = useState(15000);
  const [minStars, setMinStars] = useState(0);
  const [amenities, setAmenities] = useState([]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);

  useEffect(() => {
    if (!area) return;

    // Debounce: filters can change fast (dragging the budget slider), don't
    // fire a request per pixel of drag.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams({
        area,
        maxPrice: String(budget),
      });
      if (minStars > 0) params.set("minStars", String(minStars));
      if (amenities.length > 0) params.set("amenities", amenities.join(","));

      setLoading(true);
      setError(null);

      fetch(`${API_BASE}/api/search?${params.toString()}`)
        .then((res) => {
          if (!res.ok) throw new Error(`Backend returned ${res.status}`);
          return res.json();
        })
        .then((data) => setResults(data.results || []))
        .catch((err) => {
          setError(
            err.message === "Failed to fetch"
              ? "Can't reach the GG backend — make sure it's running (npm run dev in gg-backend) at " + API_BASE
              : err.message
          );
          setResults([]);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [area, budget, minStars, amenities]);

  const toggleAmenity = (a) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const submitSearch = () => {
    if (areaInput.trim()) setArea(areaInput.trim());
  };

  return (
    <div className="min-h-screen bg-[#EDEEE7] font-sans">
      <div className="bg-[#1B2A41] px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-[#EDEEE7] tracking-tight">Guilds Guide</h1>
            <p className="text-xs text-[#A6763B] tracking-widest uppercase mt-0.5">Verified best deals, every stay</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded px-3 py-2 w-72">
            <Search size={16} className="text-[#EDEEE7]/70" />
            <input
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitSearch()}
              onBlur={submitSearch}
              placeholder="Search an area, e.g. Rishikesh"
              className="bg-transparent text-sm text-[#EDEEE7] outline-none w-full placeholder:text-[#EDEEE7]/50"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 flex gap-6">
        <aside className="w-60 shrink-0">
          <div className="bg-white border border-stone-200 rounded-lg p-4 sticky top-4">
            <div className="flex items-center gap-1.5 text-[#1B2A41] font-medium text-sm mb-4">
              <SlidersHorizontal size={14} /> Filters
            </div>

            <label className="text-xs text-stone-500 uppercase tracking-wide">Max budget / night</label>
            <input
              type="range"
              min="500"
              max="15000"
              step="100"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full mt-2 accent-[#A6763B]"
            />
            <div className="text-sm text-[#1B2A41] font-medium mt-1">Up to ₹{budget.toLocaleString("en-IN")}</div>

            <div className="mt-5">
              <label className="text-xs text-stone-500 uppercase tracking-wide">Hotel category</label>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[0, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setMinStars(s)}
                    className={`text-xs px-2.5 py-1 rounded border ${
                      minStars === s
                        ? "bg-[#1B2A41] text-white border-[#1B2A41]"
                        : "border-stone-300 text-stone-600"
                    }`}
                  >
                    {s === 0 ? "Any" : `${s}★+`}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <label className="text-xs text-stone-500 uppercase tracking-wide">Amenities</label>
              <div className="flex flex-col gap-1.5 mt-2">
                {["wifi", "breakfast", "river-view"].map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      checked={amenities.includes(a)}
                      onChange={() => toggleAmenity(a)}
                      className="accent-[#A6763B]"
                    />
                    {a.replace("-", " ")}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 text-sm text-stone-500">
              <MapPin size={14} />
              {loading ? "Searching…" : `${results.length} stays in ${area}`}
            </div>
            <div className="flex items-center gap-1 text-xs text-[#2F6659]">
              <BadgeCheck size={14} /> Prices merged across 3 sources
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-stone-400 text-sm py-12">
              <Loader2 size={16} className="animate-spin" /> Fetching live prices…
            </div>
          )}

          {!loading && error && (
            <div className="flex items-start gap-2 bg-white border border-stone-200 rounded-lg p-4 text-sm text-stone-600">
              <AlertCircle size={16} className="text-[#A6763B] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && results.map((h) => <HotelCard key={h.name} hotel={h} />)}

          {!loading && !error && results.length === 0 && (
            <div className="text-center text-stone-400 text-sm py-12">
              No stays match these filters — try widening your budget, or search "Rishikesh" or "Goa" (the only areas the mock providers know about right now).
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
