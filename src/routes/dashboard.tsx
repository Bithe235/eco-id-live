import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { type User, CARBON_RATE, getBalance, getTransactions, type Transaction } from "@/lib/users";
import { PaymentModal } from "@/components/payment-modal";

type ForestPlot = User["forest"][number];

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [prevTransactionCount, setPrevTransactionCount] = useState(0);
  const [showReceivedNotification, setShowReceivedNotification] = useState(false);
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [receivedFrom, setReceivedFrom] = useState("");

  // Refresh balance and transactions
  const refreshData = () => {
    if (user) {
      const newBalance = getBalance(user.id);
      const newTransactions = getTransactions();
      
      console.log(`[${user.name}] Refreshing data - Balance: ${newBalance}, Transactions: ${newTransactions.length}`);
      
      // Check for new incoming transactions
      if (newTransactions.length > prevTransactionCount) {
        const newTx = newTransactions[0]; // Most recent transaction
        console.log(`[${user.name}] New transaction detected:`, newTx);
        if (newTx.toUserId === user.id && newTx.fromUserId !== user.id) {
          // This is an incoming payment!
          console.log(`[${user.name}] INCOMING PAYMENT from ${newTx.fromUserName}: ${newTx.amount} kg`);
          setReceivedAmount(newTx.amount);
          setReceivedFrom(newTx.fromUserName);
          setShowReceivedNotification(true);
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => {
            setShowReceivedNotification(false);
          }, 5000);
        }
        setPrevTransactionCount(newTransactions.length);
      }
      
      setBalance(newBalance);
      setTransactions(newTransactions);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  // Load initial data
  useEffect(() => {
    refreshData();
    // Set initial transaction count
    setPrevTransactionCount(getTransactions().length);
  }, [user]);

  // Listen for storage changes (real-time sync across tabs)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      // Only refresh if balances or transactions changed
      if (e.key === 'cl-wallet-balances' || e.key === 'cl-transactions') {
        refreshData();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user]);

  // Poll for changes every 1 second (backup for same-tab updates)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 1000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    return (
      <main className="relative flex min-h-screen items-center justify-center">
        <div className="font-mono text-sm text-muted-foreground">Redirecting to login...</div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 scanline" />

      <TopNav onLogout={logout} />

      {/* Payment Received Notification */}
      {showReceivedNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-ticker">
          <div className="rounded-xl border border-toxic/60 bg-toxic/20 backdrop-blur-xl px-6 py-4 shadow-2xl glow-toxic">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-toxic/30">
                <span className="text-2xl">🌿</span>
              </div>
              <div>
                <div className="font-mono text-sm font-bold text-toxic">Carbon Credits Received!</div>
                <div className="font-mono text-xs text-foreground mt-0.5">
                  <span className="text-toxic font-semibold">{receivedAmount.toFixed(2)} kg CO₂e</span> from {receivedFrom}
                </div>
              </div>
              <button 
                onClick={() => setShowReceivedNotification(false)}
                className="ml-4 rounded-full p-1 text-muted-foreground hover:text-foreground transition"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="relative mx-auto max-w-7xl px-6 py-8">
        <Header user={user} />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.6fr]">
          <div className="space-y-6">
            <ProfileCard user={user} />
            <WalletCard
              user={user}
              balance={balance}
              onSendMoney={() => setIsPaymentModalOpen(true)}
            />
            <DebtCard user={user} />
          </div>

          <div className="space-y-6">
            <MapCard user={user} />
            <TransactionCard 
              transactions={transactions} 
              currentUserId={user.id} 
              onRefresh={refreshData}
            />
            <ActivityCard user={user} />
          </div>
        </div>
      </section>

      <PaymentModal
        currentUser={user}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={refreshData}
      />
    </main>
  );
}

/* ---------------- Top nav ---------------- */
function TopNav({ onLogout }: { onLogout: () => void }) {
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
        <button
          onClick={onLogout}
          className="rounded-md border border-destructive/60 bg-destructive/10 px-3 py-1.5 text-destructive hover:bg-destructive/20"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}

function Header({ user }: { user: User }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-toxic">// My Ledger</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
          Welcome back, <span className="text-gradient-toxic">{user.name.split(" ")[0]}</span>
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
function ProfileCard({ user }: { user: User }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-toxic font-mono text-lg font-bold text-primary-foreground glow-toxic">
          {user.avatarSeed}
        </div>
        <div>
          <div className="text-lg font-semibold">{user.name}</div>
          <div className="font-mono text-[11px] text-muted-foreground">{user.city}</div>
        </div>
        <div className="ml-auto rounded-full border border-toxic/60 bg-toxic/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-toxic">
          {user.tier}
        </div>
      </div>

      <div className="mt-6 space-y-2 font-mono text-[11px]">
        <Row k="ECO_ID"   v={user.ecoId} accent />
        <Row k="Wallet"   v={user.wallet} />
        <Row k="Joined"   v={user.joined} />
        <Row k="Status"   v="VERIFIED" accent />
      </div>
    </div>
  );
}

/* ---------------- Wallet ---------------- */
function WalletCard({ user, balance, onSendMoney }: { user: User; balance: number; onSendMoney: () => void }) {
  return (
    <div className="rounded-2xl border border-toxic/40 bg-card/70 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">// Carbon Credits</span>
        <span className="h-2 w-2 rounded-full bg-toxic animate-pulse-glow" />
      </div>

      <div className="mt-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Available Credits</div>
        <div className="mt-2 font-mono text-5xl font-bold text-gradient-toxic md:text-6xl">
          {balance.toFixed(2)}
          <span className="ml-2 text-2xl text-muted-foreground">kg CO₂e</span>
        </div>
      </div>

      <button
        onClick={onSendMoney}
        className="mt-5 w-full rounded-md gradient-toxic px-5 py-3 font-mono text-xs uppercase tracking-widest text-primary-foreground glow-toxic transition hover:opacity-90"
      >
        Send Carbon Credits →
      </button>

      <div className="mt-3 rounded-md border border-border bg-background/40 p-3 font-mono text-[9px] text-muted-foreground">
        <div>• Transfer carbon credits to other users</div>
        <div>• 1 credit = 1 kg CO₂e offset capacity</div>
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

/* ---------------- Debt/Credit ---------------- */
function DebtCard({ user }: { user: User }) {
  const owedUsd = useMemo(() => (user.carbonData.debt.year * CARBON_RATE).toFixed(0), [user.carbonData.debt.year]);
  
  // Calculate carbon offset from trees (1 tree ≈ 21 kg CO2/year)
  const totalTrees = user.forest.reduce((sum: number, plot) => sum + plot.trees, 0);
  const carbonOffset = totalTrees * 21;
  const carbonBalance = user.carbonData.debt.year - carbonOffset;
  const isCarbonPositive = carbonBalance <= 0; // Negative means you have credits
  const carbonCredits = Math.abs(carbonBalance);

  return (
    <div className={`rounded-2xl border ${isCarbonPositive ? 'border-toxic/40' : 'border-debt/40'} bg-card/70 p-6 backdrop-blur`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          {isCarbonPositive ? '// Carbon Credits 🌳' : '// Carbon Depth 🔥'}
        </span>
        <span className={`h-2 w-2 rounded-full ${isCarbonPositive ? 'bg-toxic' : 'bg-debt'} animate-pulse-glow`} />
      </div>

      {/* Status Badge */}
      <div className={`mt-4 rounded-lg border ${isCarbonPositive ? 'border-toxic/60 bg-toxic/10' : 'border-debt/60 bg-debt/10'} p-4`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isCarbonPositive ? 'bg-toxic/20' : 'bg-debt/20'}`}>
            <span className="text-2xl">{isCarbonPositive ? '🌿' : '⚠️'}</span>
          </div>
          <div className="flex-1">
            <div className={`font-mono text-sm font-bold ${isCarbonPositive ? 'text-toxic' : 'text-debt'}`}>
              {isCarbonPositive ? 'CARBON POSITIVE' : 'CARBON DEBT'}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
              {isCarbonPositive 
                ? `You offset ${carbonCredits.toLocaleString()} kg more than you emit!`
                : `You need to offset ${carbonBalance.toLocaleString()} kg to break even`}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Counter label="Today"      value={user.carbonData.debt.today}  unit="kg CO₂e" tone="default" />
        <Counter label="This month" value={user.carbonData.debt.month}  unit="kg CO₂e" tone="default" />
        <Counter 
          label="This year"  
          value={user.carbonData.debt.year}   
          unit="kg CO₂e" 
          tone={isCarbonPositive ? "toxic" : "debt"}    
          big 
        />
      </div>

      {/* Carbon Offset Info */}
      <div className={`mt-5 rounded-lg border ${isCarbonPositive ? 'border-toxic/40 bg-toxic/5' : 'border-border bg-background/40'} p-4`}>
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Forest Offset</span>
          <span className="font-mono text-xs text-toxic">-{carbonOffset.toLocaleString()} kg</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total Trees</span>
          <span className="font-mono text-xs text-foreground">{totalTrees.toLocaleString()} 🌲</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Net Balance</span>
          <span className={`font-mono text-sm font-bold ${isCarbonPositive ? 'text-toxic' : 'text-debt'}`}>
            {isCarbonPositive ? '+' : ''}{carbonBalance.toLocaleString()} kg
          </span>
        </div>
      </div>

      <div className={`mt-5 flex items-center justify-between rounded-md border border-border bg-background/40 p-3 font-mono text-xs`}>
        <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Settlement</span>
        <span className="text-toxic">${owedUsd} <span className="text-muted-foreground">USD owed</span></span>
      </div>
    </div>
  );
}

function Counter({ label, value, unit, tone, big }: { label: string; value: number; unit: string; tone: "default" | "debt" | "toxic"; big?: boolean }) {
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
      <span className={`font-mono font-bold ${big ? "text-4xl" : "text-2xl"} ${
        tone === "debt" ? "text-gradient-debt" : tone === "toxic" ? "text-gradient-toxic" : "text-foreground"
      }`}>
        {shown.toLocaleString(undefined, { maximumFractionDigits: 1 })}
        <span className="ml-2 text-[10px] font-normal text-muted-foreground">{unit}</span>
      </span>
    </div>
  );
}

/* ---------------- Pay ---------------- */
function PayCard({ user }: { user: User }) {
  const [mode, setMode] = useState<"card" | "crypto" | "trees">("card");
  const [amount, setAmount] = useState(50);
  const owedUsd = Math.round(user.carbonData.debt.year * CARBON_RATE);

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
          ≈ offsets {Math.round(amount / CARBON_RATE)} kg CO₂e · plants {Math.round(amount / 3)} trees
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
function MapCard({ user }: { user: User }) {
  const totalTrees = user.forest.reduce((s: number, p) => s + p.trees, 0);
  const totalArea  = user.forest.reduce((s: number, p) => s + p.area, 0);

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

      <div className="relative h-[520px] w-full">
        <EnhancedMap plots={user.forest} />
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

/* ---------------- Enhanced Map (Google Maps Style) ---------------- */
function EnhancedMap({ plots }: { plots: ForestPlot[] }) {
  const [viewMode, setViewMode] = useState<"map" | "satellite">("map");
  const [selectedPlot, setSelectedPlot] = useState<ForestPlot | null>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [hoveredPlot, setHoveredPlot] = useState<ForestPlot | null>(null);

  // Generate realistic coordinates for each plot
  const getPlotCoordinates = (plot: ForestPlot) => {
    const baseCoords = {
      "P-001": { lat: "43.0621°N", lng: "141.3544°E", location: "Hokkaido, Japan" },
      "P-002": { lat: "35.0116°N", lng: "135.7681°E", location: "Kyoto, Japan" },
      "P-003": { lat: "1.3521°N", lng: "110.3459°E", location: "Borneo, Malaysia" },
      "P-004": { lat: "-0.7893°S", lng: "113.9213°E", location: "Sumatra, Indonesia" },
      "P-005": { lat: "-51.2641°S", lng: "-72.2382°W", location: "Patagonia, Argentina" },
      "P-010": { lat: "28.6139°N", lng: "77.2090°E", location: "Delhi, India" },
      "P-011": { lat: "10.8505°N", lng: "76.2711°E", location: "Kerala, India" },
      "P-012": { lat: "30.9010°N", lng: "75.8573°E", location: "Punjab, India" },
      "P-013": { lat: "22.1667°N", lng: "89.1000°E", location: "West Bengal, India" },
      "P-020": { lat: "57.4770°N", lng: "4.2247°W", location: "Scottish Highlands, UK" },
      "P-021": { lat: "54.4609°N", lng: "3.0886°W", location: "Lake District, UK" },
      "P-022": { lat: "51.5074°N", lng: "3.5000°W", location: "Wales, UK" },
      "P-023": { lat: "51.8330°N", lng: "1.7500°W", location: "Cotswolds, UK" },
      "P-024": { lat: "50.2661°N", lng: "5.0527°W", location: "Cornwall, UK" },
      "P-030": { lat: "-3.4653°S", lng: "-62.2159°W", location: "Amazon, Brazil" },
      "P-031": { lat: "-15.7801°S", lng: "-47.9292°W", location: "Atlantic Forest, Brazil" },
      "P-032": { lat: "-12.0467°S", lng: "-50.3754°W", location: "Cerrado, Brazil" },
      "P-040": { lat: "1.3521°N", lng: "103.8198°E", location: "Bukit Timah, Singapore" },
      "P-041": { lat: "1.3049°N", lng: "103.9348°E", location: "East Coast, Singapore" },
      "P-042": { lat: "1.3450°N", lng: "103.8216°E", location: "MacRitchie, Singapore" },
      "P-043": { lat: "1.4050°N", lng: "104.0020°E", location: "Pulau Ubin, Singapore" },
    };
    return baseCoords[plot.id as keyof typeof baseCoords] || { lat: "0.0000°", lng: "0.0000°", location: "Unknown" };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "mature": return "bg-emerald-500";
      case "growing": return "bg-green-400";
      case "new": return "bg-yellow-400";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Map Container with Pan/Zoom */}
      <div className="relative w-full h-full group">
        {/* Terrain Layer */}
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid slice"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width * 360 - 180).toFixed(4);
            const y = (90 - (e.clientY - rect.top) / rect.height * 180).toFixed(4);
            setMousePos({ x: parseFloat(x), y: parseFloat(y) });
          }}
        >
          <defs>
            {/* Gradients for terrain */}
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={viewMode === "satellite" ? "#1a4d5e" : "#0ea5e9"} stopOpacity="0.3" />
              <stop offset="100%" stopColor={viewMode === "satellite" ? "#0d2f3d" : "#0284c7"} stopOpacity="0.5" />
            </linearGradient>
            <radialGradient id="forestGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#059669" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.4" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Ocean Background */}
          <rect width="1000" height="600" fill="url(#oceanGrad)" />

          {/* Grid Lines */}
          {Array.from({ length: 19 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 33.33} x2="1000" y2={i * 33.33} stroke="#94a3b8" strokeWidth="0.3" opacity="0.2" />
          ))}
          {Array.from({ length: 31 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 33.33} y1="0" x2={i * 33.33} y2="600" stroke="#94a3b8" strokeWidth="0.3" opacity="0.2" />
          ))}

          {/* Continents - Simplified realistic outlines */}
          {/* North America */}
          <path d="M150,100 Q180,80 220,90 Q260,100 280,130 Q290,160 270,190 Q250,220 220,240 Q190,250 170,230 Q150,210 140,180 Q130,150 150,100 Z" 
                fill={viewMode === "satellite" ? "#2d5016" : "#86efac"} opacity="0.6" />
          {/* South America */}
          <path d="M250,280 Q270,260 290,270 Q310,290 315,330 Q320,380 305,430 Q290,470 270,490 Q250,500 240,470 Q230,430 235,380 Q240,330 250,280 Z" 
                fill={viewMode === "satellite" ? "#1a4d16" : "#4ade80"} opacity="0.6" />
          {/* Europe */}
          <path d="M450,100 Q470,90 500,95 Q530,100 540,120 Q545,140 530,160 Q510,170 490,165 Q470,155 460,140 Q450,125 450,100 Z" 
                fill={viewMode === "satellite" ? "#3d6b26" : "#a7f3d0"} opacity="0.6" />
          {/* Africa */}
          <path d="M480,180 Q510,170 540,180 Q570,200 580,240 Q585,290 575,350 Q560,400 530,420 Q500,430 480,410 Q465,380 460,330 Q455,280 470,230 Q475,200 480,180 Z" 
                fill={viewMode === "satellite" ? "#4a7c2e" : "#86efac"} opacity="0.6" />
          {/* Asia */}
          <path d="M560,80 Q610,70 670,85 Q730,100 760,130 Q780,170 770,220 Q750,270 710,300 Q660,320 610,310 Q570,290 550,250 Q535,210 540,160 Q545,120 560,80 Z" 
                fill={viewMode === "satellite" ? "#2d5016" : "#4ade80"} opacity="0.6" />
          {/* Australia */}
          <path d="M780,380 Q810,370 840,380 Q860,400 865,430 Q860,460 840,475 Q810,480 790,470 Q770,450 775,420 Q778,395 780,380 Z" 
                fill={viewMode === "satellite" ? "#5a8a3a" : "#a7f3d0"} opacity="0.6" />

          {/* Forest Plot Markers */}
          {plots.map((plot, i) => {
            const coords = getPlotCoordinates(plot);
            const isHovered = hoveredPlot?.id === plot.id;
            const isSelected = selectedPlot?.id === plot.id;
            const size = 20 + plot.trees / 15;
            
            return (
              <g key={plot.id}>
                {/* Pulsing ring */}
                <circle
                  cx={plot.lng * 10}
                  cy={plot.lat * 6}
                  r={size * 1.5}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  opacity={isHovered || isSelected ? "0.8" : "0.3"}
                  filter="url(#glow)"
                  className="animate-pulse"
                />
                
                {/* Forest area */}
                <circle
                  cx={plot.lng * 10}
                  cy={plot.lat * 6}
                  r={size}
                  fill="url(#forestGrad)"
                  stroke={isSelected ? "#fbbf24" : "#10b981"}
                  strokeWidth={isSelected ? "3" : "2"}
                  opacity={isHovered || isSelected ? "1" : "0.8"}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedPlot(plot)}
                  onMouseEnter={() => setHoveredPlot(plot)}
                  onMouseLeave={() => setHoveredPlot(null)}
                />
                
                {/* Tree icon */}
                <text
                  x={plot.lng * 10}
                  y={plot.lat * 6}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="16"
                  style={{ pointerEvents: "none" }}
                >
                  🌲
                </text>
              </g>
            );
          })}
        </svg>

        {/* Map Controls - Top Right */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setViewMode(viewMode === "map" ? "satellite" : "map")}
            className="rounded-lg border border-slate-600 bg-slate-800/90 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur transition hover:bg-slate-700"
          >
            {viewMode === "map" ? "🛰️ Satellite" : "🗺️ Map"}
          </button>
        </div>

        {/* Coordinates Display - Bottom Left */}
        <div className="absolute bottom-4 left-4 rounded-lg border border-slate-600 bg-slate-800/90 px-3 py-2 backdrop-blur">
          <div className="font-mono text-[10px] text-slate-300">
            <div>📍 {mousePos.y.toFixed(4)}°N, {mousePos.x.toFixed(4)}°E</div>
          </div>
        </div>

        {/* Zoom Controls - Bottom Right */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
          <button className="rounded-lg border border-slate-600 bg-slate-800/90 px-3 py-2 font-mono text-white backdrop-blur transition hover:bg-slate-700">
            +
          </button>
          <button className="rounded-lg border border-slate-600 bg-slate-800/90 px-3 py-2 font-mono text-white backdrop-blur transition hover:bg-slate-700">
            −
          </button>
        </div>

        {/* Hover Info Card */}
        {hoveredPlot && !selectedPlot && (
          <div 
            className="absolute pointer-events-none rounded-lg border border-emerald-500/60 bg-slate-900/95 p-3 backdrop-blur shadow-xl"
            style={{ 
              left: `${Math.min(hoveredPlot.lng + 5, 80)}%`, 
              top: `${Math.max(hoveredPlot.lat - 15, 10)}%`
            }}
          >
            <div className="font-mono text-xs">
              <div className="font-semibold text-emerald-400">{hoveredPlot.name}</div>
              <div className="mt-1 text-[10px] text-slate-300">
                🌳 {hoveredPlot.trees} trees · {hoveredPlot.area} ha
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Status: <span className="capitalize">{hoveredPlot.status}</span>
              </div>
            </div>
          </div>
        )}

        {/* Selected Plot Detail Card */}
        {selectedPlot && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md rounded-xl border border-emerald-500/60 bg-slate-900/95 p-4 backdrop-blur shadow-2xl">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-mono text-base font-semibold text-emerald-400">{selectedPlot.name}</h3>
                <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                  {getPlotCoordinates(selectedPlot).location}
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlot(null)}
                className="rounded-full p-1 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="rounded-lg bg-slate-800/60 p-2">
                <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">Trees</div>
                <div className="font-mono text-lg font-bold text-emerald-400">{selectedPlot.trees}</div>
              </div>
              <div className="rounded-lg bg-slate-800/60 p-2">
                <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">Area</div>
                <div className="font-mono text-lg font-bold text-emerald-400">{selectedPlot.area} ha</div>
              </div>
              <div className="rounded-lg bg-slate-800/60 p-2">
                <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">Status</div>
                <div className={`font-mono text-sm font-bold capitalize ${getStatusColor(selectedPlot.status).replace("bg-", "text-")}`}>
                  {selectedPlot.status}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-slate-800/60 p-2 font-mono text-[10px]">
              <div className="text-slate-400">Coordinates:</div>
              <div className="text-slate-200 mt-0.5">
                {getPlotCoordinates(selectedPlot).lat}, {getPlotCoordinates(selectedPlot).lng}
              </div>
            </div>
          </div>
        )}

        {/* Legend - Top Left */}
        <div className="absolute top-4 left-4 rounded-lg border border-slate-600 bg-slate-800/90 p-3 backdrop-blur">
          <div className="font-mono text-[9px] uppercase tracking-widest text-slate-300 mb-2">Legend</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-mono text-[9px] text-slate-300">Mature Forest</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <span className="font-mono text-[9px] text-slate-300">Growing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-400" />
              <span className="font-mono text-[9px] text-slate-300">New Plot</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Transaction History ---------------- */
function TransactionCard({ transactions, currentUserId, onRefresh }: { transactions: Transaction[]; currentUserId: string; onRefresh: () => void }) {
  const userTransactions = transactions.filter(
    (t) => t.fromUserId === currentUserId || t.toUserId === currentUserId
  ).slice(0, 10);

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">// Transactions</div>
          <div className="text-sm font-semibold mt-1">{userTransactions.length} total</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="rounded-md border border-border px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground hover:text-toxic hover:border-toxic/50 transition"
            title="Refresh transactions"
          >
            ↻ Refresh
          </button>
          <span className="h-2 w-2 rounded-full bg-toxic animate-pulse-glow" />
        </div>
      </div>

      {userTransactions.length === 0 ? (
        <div className="mt-6 py-8 text-center font-mono text-sm text-muted-foreground">
          No transactions yet.
          <div className="mt-2 text-[10px] uppercase tracking-widest">Send money to get started!</div>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border/40 max-h-80 overflow-y-auto">
          {userTransactions.map((t, i) => {
            const isSender = t.fromUserId === currentUserId;
            const otherUser = isSender ? t.toUserName : t.fromUserName;
            return (
              <li key={t.id} className="py-3 font-mono text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${isSender ? "bg-debt" : "bg-toxic"}`} />
                      <span className="text-foreground">
                        {isSender ? "Sent to" : "Received from"} {otherUser}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(t.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${isSender ? "text-debt" : "text-toxic"}`}>
                      {isSender ? "-" : "+"}{t.amount.toFixed(2)} kg CO₂e
                    </div>
                    <div className="mt-1 text-[9px] uppercase tracking-widest text-toxic">{t.status}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
function ActivityCard({ user }: { user: User }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">// Recent activity</div>
      <ul className="mt-4 divide-y divide-border/40">
        {user.activity.map((a, i) => (
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
