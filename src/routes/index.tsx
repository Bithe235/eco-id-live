import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({ component: Index });

// --- Carbon factors (kg CO2e) — illustrative, defensible ranges ---
const GRID_INTENSITY: Record<string, number> = {
  Tokyo: 0.46, Osaka: 0.49, Seoul: 0.42, Singapore: 0.41,
  Beijing: 0.58, Delhi: 0.71, London: 0.21, Berlin: 0.34,
  "New York": 0.29, "San Francisco": 0.23, Sydney: 0.66, Paris: 0.06,
};
const TRANSPORT: Record<string, { factor: number; label: string }> = {
  walk:    { factor: 0,    label: "Walked / cycled" },
  metro:   { factor: 0.6,  label: "Metro / train" },
  bus:     { factor: 1.2,  label: "Bus" },
  car:     { factor: 4.6,  label: "Car (solo)" },
  taxi:    { factor: 5.8,  label: "Taxi / rideshare" },
  flight:  { factor: 110,  label: "Flew in" },
};

type Step = 0 | 1 | 2 | 3 | 4;

function Index() {
  const [step, setStep] = useState<Step>(0);
  const [city, setCity] = useState("Tokyo");
  const [kwh, setKwh] = useState<number>(280);
  const [transport, setTransport] = useState<keyof typeof TRANSPORT>("metro");
  const [name, setName] = useState("");

  const calc = useMemo(() => {
    const grid = GRID_INTENSITY[city] ?? 0.45;
    const elec = kwh * grid;                 // kg/mo
    const transit = TRANSPORT[transport].factor; // kg one-way today
    const annualElec = elec * 12;
    const annualTransit = transit * 2 * 240;  // commute proxy
    const totalAnnual = annualElec + annualTransit;
    const debt = Math.round(totalAnnual);     // kg CO2e / yr
    return { elec, transit, debt, grid };
  }, [city, kwh, transport]);

  const ecoId = useMemo(() => generateEcoId(city, name, calc.debt), [city, name, calc.debt]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
      <div className="pointer-events-none absolute inset-0 scanline" />

      <TopBar />

      <section className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl flex-col items-stretch px-6 py-10 md:py-16">
        {step < 4 ? (
          <Intake
            step={step} setStep={setStep}
            city={city} setCity={setCity}
            kwh={kwh} setKwh={setKwh}
            transport={transport} setTransport={setTransport}
            name={name} setName={setName}
            calc={calc}
          />
        ) : (
          <Reveal ecoId={ecoId} debt={calc.debt} city={city} grid={calc.grid} transport={transport} kwh={kwh} onReset={() => setStep(0)} />
        )}
      </section>
    </main>
  );
}

function TopBar() {
  const { user, isAuthenticated } = useAuth();
  const [light, setLight] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("cl-theme");
    if (stored === "light") setLight(true);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    localStorage.setItem("cl-theme", light ? "light" : "dark");
  }, [light]);

  return (
    <header className="relative z-10 flex items-center justify-between border-b border-border/60 bg-background/40 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-toxic animate-pulse-glow" />
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Carbon Ledger</span>
        <span className="hidden font-mono text-xs text-toxic md:inline">// LIVE</span>
      </div>
      <div className="flex items-center gap-5">
        <button
          onClick={() => setLight((v) => !v)}
          aria-label="Toggle theme"
          className="group relative flex h-7 w-14 items-center rounded-full border border-border bg-input transition hover:border-toxic/60"
        >
          <span
            className={`absolute top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full gradient-toxic font-mono text-[9px] font-bold text-primary-foreground shadow transition-all ${
              light ? "left-[calc(100%-22px)]" : "left-[2px]"
            }`}
          >
            {light ? "☀" : "☾"}
          </span>
          <span className="ml-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground opacity-0 group-hover:opacity-100">
            {light ? "light" : "dark"}
          </span>
        </button>
        {isAuthenticated ? (
          <Link to="/dashboard" className="rounded-md border border-toxic/60 bg-toxic/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-toxic hover:bg-toxic/20">
            My Dashboard →
          </Link>
        ) : (
          <Link to="/login" className="rounded-md border border-toxic/60 bg-toxic/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-toxic hover:bg-toxic/20">
            Login →
          </Link>
        )}
        <div className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:block">
          Climate Launch · Tokyo · 2026
        </div>
      </div>
    </header>
  );
}

/* ---------------- Intake ---------------- */
function Intake(props: {
  step: Step; setStep: (s: Step) => void;
  city: string; setCity: (s: string) => void;
  kwh: number; setKwh: (n: number) => void;
  transport: keyof typeof TRANSPORT; setTransport: (s: keyof typeof TRANSPORT) => void;
  name: string; setName: (s: string) => void;
  calc: { elec: number; transit: number; debt: number; grid: number };
}) {
  const { step, setStep, city, setCity, kwh, setKwh, transport, setTransport, name, setName, calc } = props;

  return (
    <div className="grid flex-1 grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      {/* LEFT: pitch + question */}
      <div className="flex flex-col justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-toxic">Step {step + 1} / 4</p>
          <h1 className="mt-4 text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
            Before I explain anything,<br />
            <span className="text-gradient-toxic">show me your carbon.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Three questions. Sixty seconds. You walk out with an ECO_ID and a number you can trade,
            offset, or be held to. That's the entire pitch.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {step === 0 && (
            <Question label="What city do you live in?" hint="Local grid intensity changes everything.">
              <div className="space-y-3">
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-md border border-border bg-input px-5 py-4 font-mono text-lg text-toxic focus:border-toxic focus:outline-none appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23oklch(0.88 0.24 142)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5rem' }}
                >
                  {Object.keys(GRID_INTENSITY).map((c) => (
                    <option key={c} value={c} className="bg-card text-foreground">
                      {c} — {GRID_INTENSITY[c].toFixed(2)} kg/kWh
                    </option>
                  ))}
                </select>
                <div className="rounded-md border border-toxic/30 bg-toxic/5 px-4 py-3 font-mono text-sm">
                  <span className="text-muted-foreground">Selected: </span>
                  <span className="text-toxic font-semibold">{city}</span>
                  <span className="mx-2 text-muted-foreground">·</span>
                  <span className="text-muted-foreground">Grid intensity: </span>
                  <span className="text-toxic font-semibold">{GRID_INTENSITY[city].toFixed(2)} kg/kWh</span>
                </div>
              </div>
            </Question>
          )}

          {step === 1 && (
            <Question label="Roughly, how much electricity per month?" hint={`Average ${city} household: ~280 kWh`}>
              <div className="space-y-4">
                <div className="font-mono text-5xl text-toxic">{kwh}<span className="ml-2 text-sm text-muted-foreground">kWh / mo</span></div>
                <input type="range" min={50} max={1200} step={10} value={kwh}
                  onChange={(e) => setKwh(Number(e.target.value))}
                  className="w-full accent-[oklch(0.88_0.24_142)]" />
                <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <span>50</span><span>600</span><span>1200</span>
                </div>
              </div>
            </Question>
          )}

          {step === 2 && (
            <Question label="How did you get here today?" hint="Today's footprint, not assumption.">
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(TRANSPORT) as Array<keyof typeof TRANSPORT>).map((k) => (
                  <button key={k} onClick={() => setTransport(k)}
                    className={`rounded-md border px-4 py-3 text-left font-mono text-sm transition ${
                      transport === k
                        ? "border-toxic bg-toxic/10 text-toxic glow-toxic"
                        : "border-border bg-card hover:border-toxic/50"
                    }`}>
                    <div>{TRANSPORT[k].label}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">{TRANSPORT[k].factor} kg/trip</div>
                  </button>
                ))}
              </div>
            </Question>
          )}

          {step === 3 && (
            <Question label="One last thing — your name (or alias)." hint="Goes on the ledger. Yours forever.">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 24))}
                placeholder="e.g. Yuki, Ravi, Audience #4"
                className="w-full rounded-md border border-border bg-input px-5 py-4 font-mono text-2xl text-toxic placeholder:text-muted-foreground/50 focus:border-toxic focus:outline-none focus:glow-toxic"
              />
            </Question>
          )}

          <div className="flex items-center gap-3 pt-2">
            {step > 0 && (
              <button onClick={() => setStep((step - 1) as Step)}
                className="rounded-md border border-border px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                ← Back
              </button>
            )}
            <button
              onClick={() => setStep((step + 1) as Step)}
              disabled={step === 3 && name.trim().length === 0}
              className="group relative ml-auto inline-flex items-center gap-3 overflow-hidden rounded-md gradient-toxic px-7 py-4 font-mono text-sm font-semibold uppercase tracking-widest text-primary-foreground glow-toxic transition disabled:opacity-40">
              {step < 3 ? "Next" : "Generate ECO_ID"}
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: live readout */}
      <aside className="relative">
        <div className="sticky top-24 rounded-2xl border border-border bg-card/70 p-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">// Live calculation</span>
            <span className="h-2 w-2 rounded-full bg-toxic animate-pulse-glow" />
          </div>

          <div className="mt-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Projected annual carbon debt</div>
            <div key={calc.debt} className="animate-ticker mt-2 font-mono text-6xl font-bold text-gradient-debt md:text-7xl">
              {calc.debt.toLocaleString()}
              <span className="ml-2 text-base text-muted-foreground">kg CO₂e</span>
            </div>
          </div>

          <div className="mt-8 space-y-3 font-mono text-xs">
            <Row k="City" v={city} />
            <Row k="Grid intensity" v={`${calc.grid.toFixed(2)} kg/kWh`} />
            <Row k="Electricity" v={`${kwh} kWh/mo · ${Math.round(calc.elec)} kg/mo`} />
            <Row k="Transport today" v={TRANSPORT[transport].label} />
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Equivalent to</div>
            <div className="mt-2 text-sm text-foreground">
              ≈ <span className="text-toxic font-semibold">{Math.round(calc.debt / 21)}</span> trees needed for one year of offset
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Question({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="animate-ticker">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-toxic">Question</div>
      <h2 className="mt-2 text-2xl font-semibold md:text-3xl">{label}</h2>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-2">
      <span className="text-muted-foreground uppercase tracking-widest text-[10px]">{k}</span>
      <span className="text-foreground">{v}</span>
    </div>
  );
}

/* ---------------- Reveal ---------------- */
function Reveal({ ecoId, debt, city, grid, transport, kwh, onReset }: {
  ecoId: string; debt: number; city: string; grid: number;
  transport: keyof typeof TRANSPORT; kwh: number; onReset: () => void;
}) {
  const [shown, setShown] = useState(0);
  const target = debt;
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(target * eased));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target]);

  return (
    <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col justify-center">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-toxic animate-pulse-glow">// Ledger entry created</p>
        <h1 className="mt-4 text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl">
          You are now <span className="text-gradient-toxic">on the ledger.</span>
        </h1>
        <p className="mt-6 max-w-lg text-muted-foreground md:text-lg">
          That number isn't a guess. It's an entity-level liability — assignable, tradeable, settle-able.
          That's the whole product. Every person, company, and city gets one.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <button onClick={onReset}
            className="rounded-md border border-toxic/60 bg-toxic/10 px-6 py-3 font-mono text-xs uppercase tracking-widest text-toxic hover:bg-toxic/20">
            ← Score someone else
          </button>
          <a href="#" onClick={(e) => e.preventDefault()}
            className="rounded-md gradient-toxic px-6 py-3 font-mono text-xs uppercase tracking-widest text-primary-foreground glow-toxic">
            Settle this debt →
          </a>
        </div>
      </div>

      {/* CARD */}
      <div className="relative">
        <div className="relative mx-auto w-full max-w-xl rotate-[-1deg] rounded-2xl border border-toxic/40 bg-card p-8 glow-toxic">
          <div className="absolute inset-0 rounded-2xl bg-grid opacity-30" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Carbon Ledger</div>
                <div className="mt-1 font-mono text-xs text-toxic">ENTITY · INDIVIDUAL</div>
              </div>
              <div className="h-10 w-10 rounded-full border border-toxic/60 bg-toxic/10 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-toxic animate-pulse-glow" />
              </div>
            </div>

            <div className="mt-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">ECO_ID</div>
              <div className="mt-2 break-all font-mono text-2xl font-bold text-toxic md:text-3xl">{ecoId}</div>
            </div>

            <div className="mt-8 rounded-lg border border-debt/40 bg-debt/5 p-5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Annual carbon debt</div>
              <div className="mt-1 font-mono text-5xl font-bold text-gradient-debt md:text-6xl">
                {shown.toLocaleString()}
                <span className="ml-2 text-sm text-muted-foreground">kg CO₂e</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 font-mono text-[11px]">
              <Tile k="City" v={city} />
              <Tile k="Grid" v={`${grid.toFixed(2)}`} />
              <Tile k="Today" v={TRANSPORT[transport].label.split(" ")[0]} />
              <Tile k="kWh/mo" v={String(kwh)} />
              <Tile k="Trees/yr" v={String(Math.round(debt / 21))} />
              <Tile k="Status" v="OPEN" accent />
            </div>

            <div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Issued · {new Date().toISOString().slice(0, 10)}</span>
              <span>v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-background/40 px-3 py-2">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{k}</div>
      <div className={`mt-1 truncate ${accent ? "text-toxic" : "text-foreground"}`}>{v}</div>
    </div>
  );
}

/* ---------------- ECO_ID ---------------- */
function generateEcoId(city: string, name: string, debt: number) {
  const cityCode = (city || "XXX").replace(/\s/g, "").slice(0, 3).toUpperCase();
  const nameCode = (name || "ANON").replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase().padEnd(4, "X");
  const year = new Date().getFullYear().toString().slice(-2);
  let h = 0;
  const s = `${city}|${name}|${debt}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const hex = h.toString(16).toUpperCase().padStart(6, "0").slice(0, 6);
  return `ECO-${cityCode}-${nameCode}-${year}${hex}`;
}
