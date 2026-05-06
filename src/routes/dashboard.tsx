import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

/* ---------------- Demo profile ---------------- */
const PROFILE = {
  name: "Yuki Tanaka",
  ecoId: "ECO-TYO-YUKI-26A4F2C1",
  city: "Tokyo, JP",
  joined: "2026-01-12",
  tier: "Sapling Holder",
  avatarSeed: "YT",
  wallet: "0x7C…A91F",
};

const DEBT = {
  today: 11.6,        // kg CO2e
  month: 348.2,
  year: 4179.0,
  rate: 0.42,         // USD per kg
  paid: 1240,         // kg paid off lifetime
};

// Demo planted forest plots (lat/lng simulated as % positions on the map)
const PLOTS = [
  { id: "P-001", name: "Hokkaido Pine Plot",   lat: 22, lng: 70, trees: 124, area: 0.4, status: "growing" },
  { id: "P-002", name: "Kyoto Cedar Strip",    lat: 48, lng: 56, trees: 88,  area: 0.3, status: "growing" },
  { id: "P-003", name: "Borneo Mangrove",      lat: 70, lng: 38, trees: 312, area: 1.2, status: "mature" },
  { id: "P-004", name: "Sumatra Restoration",  lat: 78, lng: 30, trees: 56,  area: 0.2, status: "new" },
  { id: "P-005", name: "Patagonia Lenga",      lat: 85, lng: 88, trees: 41,  area: 0.2, status: "new" },
];

function Dashboard() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 scanline" />

      <TopNav />

      <section className="relative mx-auto max-w-7xl px-6 py-8">
        <Header />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.6fr]">
          <div className="space-y-6">
            <ProfileCard />
            <DebtCard />
            <PayCard />
          </div>

          <div className="space-y-6">
            <MapCard />
            <ActivityCard />
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------- Top nav ---------------- */
function TopNav() {
  return (
    <header className="relative z-10 flex items-center justify-between border-b border-border/60 bg-background/40 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-toxic animate-pulse-glow" />
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Carbon Ledger · Dashboard</span>
      </div>
      <nav className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
        <Link to="/" className="rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:text-foreground">
          ← Score
        </Link>
        <span className="rounded-md border border-toxic/60 bg-toxic/10 px-3 py-1.5 text-toxic">Dashboard</span>
      </nav>
    </header>
  );
}

function Header() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-toxic">// My Ledger</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
          Welcome back, <span className="text-gradient-toxic">{PROFILE.name.split(" ")[0]}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Demo data · all numbers illustrative.
        </p>
      </div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      </div>
    </div>
  );
}

/* ---------------- Profile ---------------- */
function ProfileCard() {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-toxic font-mono text-lg font-bold text-primary-foreground glow-toxic">
          {PROFILE.avatarSeed}
        </div>
        <div>
          <div className="text-lg font-semibold">{PROFILE.name}</div>
          <div className="font-mono text-[11px] text-muted-foreground">{PROFILE.city}</div>
        </div>
        <div className="ml-auto rounded-full border border-toxic/60 bg-toxic/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-toxic">
          {PROFILE.tier}
        </div>
      </div>

      <div className="mt-6 space-y-2 font-mono text-[11px]">
        <Row k="ECO_ID"   v={PROFILE.ecoId} accent />
        <Row k="Wallet"   v={PROFILE.wallet} />
        <Row k="Joined"   v={PROFILE.joined} />
        <Row k="Status"   v="VERIFIED" accent />
      </div>
    </div>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</span>
      <span className={accent ? "text-toxic" : "text-foreground"}>{v}</span>
    </div>
  );
}

/* ---------------- Debt ---------------- */
function DebtCard() {
  const owedUsd = useMemo(() => (DEBT.year * DEBT.rate).toFixed(0), []);
  return (
    <div className="rounded-2xl border border-debt/40 bg-card/70 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">// Carbon Debt</span>
        <span className="h-2 w-2 rounded-full bg-debt animate-pulse-glow" />
      </div>

      <div className="mt-5">
        <Counter label="Today"      value={DEBT.today}  unit="kg CO₂e" tone="default" />
        <Counter label="This month" value={DEBT.month}  unit="kg CO₂e" tone="default" />
        <Counter label="This year"  value={DEBT.year}   unit="kg CO₂e" tone="debt"    big />
      </div>

      <div className="mt-5 flex items-center justify-between rounded-md border border-border bg-background/40 p-3 font-mono text-xs">
        <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Settlement</span>
        <span className="text-toxic">${owedUsd} <span className="text-muted-foreground">USD owed</span></span>
      </div>
    </div>
  );
}

function Counter({ label, value, unit, tone, big }: { label: string; value: number; unit: string; tone: "default" | "debt"; big?: boolean }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1100;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div className="flex items-baseline justify-between border-b border-border/40 py-3 last:border-0">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className={`font-mono font-bold ${big ? "text-4xl" : "text-2xl"} ${tone === "debt" ? "text-gradient-debt" : "text-foreground"}`}>
        {shown.toLocaleString(undefined, { maximumFractionDigits: 1 })}
        <span className="ml-2 text-[10px] font-normal text-muted-foreground">{unit}</span>
      </span>
    </div>
  );
}

/* ---------------- Pay ---------------- */
function PayCard() {
  const [mode, setMode] = useState<"card" | "crypto" | "trees">("card");
  const [amount, setAmount] = useState(50);
  const owedUsd = Math.round(DEBT.year * DEBT.rate);

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">// Settle debt</div>
      <h3 className="mt-2 text-lg font-semibold">Offset your liability</h3>

      <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-widest">
        {(["card", "crypto", "trees"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`rounded-md border px-3 py-2 transition ${
              mode === m ? "border-toxic bg-toxic/10 text-toxic glow-toxic" : "border-border text-muted-foreground hover:text-foreground"
            }`}>
            {m === "card" ? "Card" : m === "crypto" ? "Crypto" : "Plant trees"}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between font-mono text-xs text-muted-foreground">
          <span className="uppercase tracking-widest text-[10px]">Amount</span>
          <span>${amount} of ${owedUsd}</span>
        </div>
        <input type="range" min={5} max={owedUsd} step={5} value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-2 w-full accent-[oklch(0.88_0.24_142)]" />
        <div className="mt-1 font-mono text-[10px] text-muted-foreground">
          ≈ offsets {Math.round(amount / DEBT.rate)} kg CO₂e · plants {Math.round(amount / 3)} trees
        </div>
      </div>

      <button className="mt-5 w-full rounded-md gradient-toxic px-5 py-3 font-mono text-xs uppercase tracking-widest text-primary-foreground glow-toxic">
        Pay ${amount} · {mode === "card" ? "Visa •• 4242" : mode === "crypto" ? "USDC" : "via Forest Fund"}
      </button>

      <p className="mt-3 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        Demo only · no real charges
      </p>
    </div>
  );
}

/* ---------------- Map (Google-style) ---------------- */
function MapCard() {
  const [selected, setSelected] = useState<typeof PLOTS[number]>(PLOTS[2]);
  const totalTrees = PLOTS.reduce((s, p) => s + p.trees, 0);
  const totalArea  = PLOTS.reduce((s, p) => s + p.area, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/70 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">// My Forest</div>
          <div className="text-sm font-semibold">{totalTrees} trees · {totalArea.toFixed(1)} ha planted</div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-toxic animate-pulse-glow" /> live
        </div>
      </div>

      <div className="relative h-[420px] w-full">
        <MapCanvas plots={PLOTS} selected={selected} onSelect={setSelected} />
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-border/60 p-5 sm:grid-cols-3">
        <Stat k="Selected plot" v={selected.name} />
        <Stat k="Trees" v={`${selected.trees}`} />
        <Stat k="Land area" v={`${selected.area.toFixed(2)} ha`} />
      </div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 px-3 py-2 font-mono">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className="mt-1 text-sm text-foreground">{v}</div>
    </div>
  );
}

function MapCanvas({
  plots, selected, onSelect,
}: {
  plots: typeof PLOTS;
  selected: typeof PLOTS[number];
  onSelect: (p: typeof PLOTS[number]) => void;
}) {
  // Stylized "Google Maps" world: ocean bg + abstract continent blobs + grid
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* ocean */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, oklch(0.32 0.06 220), oklch(0.22 0.05 220))" }} />
      {/* lat/lng grid */}
      <svg className="absolute inset-0 h-full w-full opacity-20" preserveAspectRatio="none" viewBox="0 0 100 100">
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={"h" + i} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="oklch(0.85 0.02 220)" strokeWidth="0.1" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={"v" + i} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="oklch(0.85 0.02 220)" strokeWidth="0.1" />
        ))}
      </svg>

      {/* continents (abstract) */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="land" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.55 0.10 130)" />
            <stop offset="100%" stopColor="oklch(0.38 0.08 140)" />
          </radialGradient>
        </defs>
        {/* asia */}
        <path d="M55,18 Q72,10 82,25 Q90,40 78,55 Q72,68 55,62 Q42,55 45,38 Z" fill="url(#land)" />
        {/* europe */}
        <path d="M40,20 Q50,15 55,25 Q53,38 42,38 Q34,32 40,20 Z" fill="url(#land)" />
        {/* africa */}
        <path d="M44,42 Q54,42 55,55 Q52,72 44,75 Q36,68 38,55 Z" fill="url(#land)" />
        {/* americas */}
        <path d="M10,18 Q22,12 28,28 Q26,42 18,46 Q8,40 10,18 Z" fill="url(#land)" />
        <path d="M18,50 Q26,48 30,62 Q28,82 22,90 Q14,80 18,50 Z" fill="url(#land)" />
        {/* oceania */}
        <path d="M75,72 Q86,70 88,80 Q82,88 72,84 Z" fill="url(#land)" />
      </svg>

      {/* land plot markers (animated) */}
      {plots.map((p, i) => {
        const isSel = p.id === selected.id;
        const size = 18 + p.trees / 12;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.lng}%`, top: `${p.lat}%` }}
          >
            {/* pulsing ring = land area */}
            <span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-toxic/60"
              style={{
                width: size * 2.2,
                height: size * 2.2,
                animation: `pulse-glow 2.4s ease-out ${i * 0.25}s infinite`,
              }}
            />
            {/* land patch */}
            <span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: size,
                height: size,
                background: "radial-gradient(circle, oklch(0.88 0.24 142 / 0.85), oklch(0.55 0.20 142 / 0.6))",
                boxShadow: isSel
                  ? "0 0 24px oklch(0.88 0.24 142 / 0.9), 0 0 48px oklch(0.88 0.24 142 / 0.5)"
                  : "0 0 10px oklch(0.88 0.24 142 / 0.5)",
              }}
            />
            {/* pin */}
            <span className="relative block font-mono text-[9px] font-bold text-primary-foreground" style={{ marginTop: -4 }}>
              🌳
            </span>
            {/* label */}
            {isSel && (
              <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-toxic/60 bg-background/90 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-toxic backdrop-blur">
                {p.name} · {p.trees}🌳
              </span>
            )}
          </button>
        );
      })}

      {/* compass / scale */}
      <div className="absolute bottom-3 right-3 rounded-md border border-border/60 bg-background/70 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground backdrop-blur">
        N ↑ · scale 1:demo
      </div>
      <div className="absolute left-3 top-3 flex gap-1">
        <div className="rounded-md border border-border/60 bg-background/70 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-foreground backdrop-blur">Map</div>
        <div className="rounded-md border border-border/60 bg-background/40 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground backdrop-blur">Satellite</div>
      </div>
    </div>
  );
}

/* ---------------- Activity ---------------- */
const ACTIVITY = [
  { d: "Today",        kind: "Commute",        delta: "+11.6 kg",  tone: "debt" },
  { d: "Yesterday",    kind: "Electricity",    delta: "+9.4 kg",   tone: "debt" },
  { d: "May 04",       kind: "Tree planting",  delta: "−18 kg",    tone: "toxic" },
  { d: "May 02",       kind: "Flight (HND→ITM)", delta: "+220 kg", tone: "debt" },
  { d: "Apr 28",       kind: "Solar credit",   delta: "−14 kg",    tone: "toxic" },
  { d: "Apr 21",       kind: "Card settlement",delta: "−$24",      tone: "toxic" },
];

function ActivityCard() {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">// Recent activity</div>
      <ul className="mt-4 divide-y divide-border/40">
        {ACTIVITY.map((a, i) => (
          <li key={i} className="flex items-center justify-between py-3 font-mono text-xs">
            <span className="w-20 text-[10px] uppercase tracking-widest text-muted-foreground">{a.d}</span>
            <span className="flex-1 text-foreground">{a.kind}</span>
            <span className={a.tone === "debt" ? "text-debt" : "text-toxic"}>{a.delta}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
