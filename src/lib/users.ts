/* ---------------- Demo user accounts ---------------- */
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  city: string;
  avatarSeed: string;
  tier: string;
  joined: string;
  wallet: string;
  ecoId: string;
  carbonData: {
    kwh: number;
    transport: string;
    debt: {
      today: number;
      month: number;
      year: number;
    };
  };
  forest: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    trees: number;
    area: number;
    status: string;
  }>;
  activity: Array<{
    d: string;
    kind: string;
    delta: string;
    tone: "debt" | "toxic";
  }>;
}

export interface WalletBalance {
  [userId: string]: number;
}

export interface Transaction {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  timestamp: string;
  status: "pending" | "completed" | "failed";
}

export const DEMO_USERS: User[] = [
  {
    id: "user-001",
    name: "Yuki Tanaka",
    email: "yuki@demo.com",
    password: "demo123",
    city: "Tokyo",
    avatarSeed: "YT",
    tier: "Sapling Holder",
    joined: "2026-01-12",
    wallet: "0x7C…A91F",
    ecoId: "ECO-TYO-YUKI-26A4F2C1",
    carbonData: {
      kwh: 280,
      transport: "metro",
      debt: {
        today: 11.6,
        month: 348.2,
        year: 4179.0,
      },
    },
    forest: [
      { id: "P-001", name: "Hokkaido Pine Plot", lat: 22, lng: 70, trees: 124, area: 0.4, status: "growing" },
      { id: "P-002", name: "Kyoto Cedar Strip", lat: 48, lng: 56, trees: 88, area: 0.3, status: "growing" },
      { id: "P-003", name: "Borneo Mangrove", lat: 70, lng: 38, trees: 312, area: 1.2, status: "mature" },
    ],
    activity: [
      { d: "Today", kind: "Commute", delta: "+11.6 kg", tone: "debt" },
      { d: "Yesterday", kind: "Electricity", delta: "+9.4 kg", tone: "debt" },
      { d: "May 04", kind: "Tree planting", delta: "−18 kg", tone: "toxic" },
      { d: "May 02", kind: "Flight (HND→ITM)", delta: "+220 kg", tone: "debt" },
      { d: "Apr 28", kind: "Solar credit", delta: "−14 kg", tone: "toxic" },
    ],
  },
  {
    id: "user-002",
    name: "Ravi Patel",
    email: "ravi@demo.com",
    password: "demo123",
    city: "Delhi",
    avatarSeed: "RP",
    tier: "Carbon Warrior",
    joined: "2026-02-08",
    wallet: "0x3B…F82D",
    ecoId: "ECO-DEL-RAVI-26B7E3D2",
    carbonData: {
      kwh: 320,
      transport: "bus",
      debt: {
        today: 18.4,
        month: 512.8,
        year: 6154.0,
      },
    },
    forest: [
      { id: "P-010", name: "Aravali Restoration", lat: 35, lng: 65, trees: 245, area: 0.8, status: "growing" },
      { id: "P-011", name: "Western Ghats Plot", lat: 55, lng: 48, trees: 178, area: 0.6, status: "mature" },
      { id: "P-012", name: "Punjab Agroforest", lat: 42, lng: 72, trees: 96, area: 0.3, status: "new" },
      { id: "P-013", name: "Sundarbans Edge", lat: 68, lng: 52, trees: 412, area: 1.5, status: "mature" },
    ],
    activity: [
      { d: "Today", kind: "Bus commute", delta: "+18.4 kg", tone: "debt" },
      { d: "Yesterday", kind: "Electricity", delta: "+12.8 kg", tone: "debt" },
      { d: "May 03", kind: "Offset purchase", delta: "−$32", tone: "toxic" },
      { d: "Apr 30", kind: "Tree planting", delta: "−24 kg", tone: "toxic" },
      { d: "Apr 25", kind: "Diwali prep", delta: "+45 kg", tone: "debt" },
    ],
  },
  {
    id: "user-003",
    name: "Emma Wilson",
    email: "emma@demo.com",
    password: "demo123",
    city: "London",
    avatarSeed: "EW",
    tier: "Green Elite",
    joined: "2025-11-20",
    wallet: "0x9A…C47E",
    ecoId: "ECO-LON-EMMA-25C9D4E3",
    carbonData: {
      kwh: 210,
      transport: "walk",
      debt: {
        today: 0.0,
        month: 264.6,
        year: 3175.2,
      },
    },
    forest: [
      { id: "P-020", name: "Scottish Highland Oak", lat: 18, lng: 42, trees: 567, area: 2.1, status: "mature" },
      { id: "P-021", name: "Lake District Pine", lat: 25, lng: 38, trees: 234, area: 0.9, status: "growing" },
      { id: "P-022", name: "Welsh Valley Plot", lat: 32, lng: 45, trees: 145, area: 0.5, status: "growing" },
      { id: "P-023", name: "Cotswold Hedgerow", lat: 28, lng: 50, trees: 89, area: 0.3, status: "new" },
      { id: "P-024", name: "Cornish Coastal", lat: 22, lng: 35, trees: 178, area: 0.6, status: "growing" },
    ],
    activity: [
      { d: "Today", kind: "Zero emissions", delta: "0 kg", tone: "toxic" },
      { d: "Yesterday", kind: "Electricity", delta: "+7.2 kg", tone: "debt" },
      { d: "May 05", kind: "Carbon negative!", delta: "−5 kg", tone: "toxic" },
      { d: "May 01", kind: "Monthly offset", delta: "−$48", tone: "toxic" },
      { d: "Apr 28", kind: "Bike commute", delta: "0 kg", tone: "toxic" },
    ],
  },
  {
    id: "user-004",
    name: "Carlos Silva",
    email: "carlos@demo.com",
    password: "demo123",
    city: "São Paulo",
    avatarSeed: "CS",
    tier: "Forest Guardian",
    joined: "2026-03-15",
    wallet: "0x2D…B63A",
    ecoId: "ECO-SAO-CARL-26D1F5E4",
    carbonData: {
      kwh: 380,
      transport: "car",
      debt: {
        today: 22.8,
        month: 456.0,
        year: 5472.0,
      },
    },
    forest: [
      { id: "P-030", name: "Amazon Reforest Alpha", lat: 75, lng: 28, trees: 892, area: 3.4, status: "mature" },
      { id: "P-031", name: "Atlantic Forest Beta", lat: 68, lng: 35, trees: 445, area: 1.7, status: "growing" },
      { id: "P-032", name: "Cerrado Restoration", lat: 62, lng: 42, trees: 267, area: 1.0, status: "growing" },
    ],
    activity: [
      { d: "Today", kind: "Car commute", delta: "+22.8 kg", tone: "debt" },
      { d: "Yesterday", kind: "Electricity", delta: "+15.2 kg", tone: "debt" },
      { d: "May 04", kind: "Amazon offset", delta: "−$65", tone: "toxic" },
      { d: "May 01", kind: "Tree planting", delta: "−52 kg", tone: "toxic" },
      { d: "Apr 29", kind: "Weekend trip", delta: "+88 kg", tone: "debt" },
    ],
  },
  {
    id: "user-005",
    name: "Aisha Mohammed",
    email: "aisha@demo.com",
    password: "demo123",
    city: "Singapore",
    avatarSeed: "AM",
    tier: "Eco Innovator",
    joined: "2026-01-28",
    wallet: "0x5F…D29C",
    ecoId: "ECO-SIN-AISH-26E2G6F5",
    carbonData: {
      kwh: 240,
      transport: "metro",
      debt: {
        today: 9.8,
        month: 297.6,
        year: 3571.2,
      },
    },
    forest: [
      { id: "P-040", name: "Bukit Timah Plot", lat: 45, lng: 68, trees: 156, area: 0.5, status: "growing" },
      { id: "P-041", name: "Mangrove East Coast", lat: 52, lng: 72, trees: 289, area: 1.1, status: "mature" },
      { id: "P-042", name: "MacRitchie Reserve", lat: 48, lng: 65, trees: 198, area: 0.7, status: "growing" },
      { id: "P-043", name: "Pulau Ubin Forest", lat: 58, lng: 75, trees: 334, area: 1.3, status: "mature" },
    ],
    activity: [
      { d: "Today", kind: "MRT commute", delta: "+9.8 kg", tone: "debt" },
      { d: "Yesterday", kind: "Electricity", delta: "+8.4 kg", tone: "debt" },
      { d: "May 05", kind: "Solar credit", delta: "−12 kg", tone: "toxic" },
      { d: "May 02", kind: "Offset purchase", delta: "−$28", tone: "toxic" },
      { d: "Apr 30", kind: "Tree planting", delta: "−22 kg", tone: "toxic" },
    ],
  },
];

export function authenticateUser(email: string, password: string): User | null {
  const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
  return user || null;
}

export const CARBON_RATE = 0.42; // USD per kg CO2e

/* ---------------- Wallet & Payment System ---------------- */
const INITIAL_BALANCES: WalletBalance = {
  "user-001": 250.00, // Yuki Tanaka
  "user-002": 180.50, // Ravi Patel
  "user-003": 420.75, // Emma Wilson
  "user-004": 95.25,  // Carlos Silva
  "user-005": 310.00, // Aisha Mohammed
};

export function getInitialBalances(): WalletBalance {
  const stored = localStorage.getItem("cl-wallet-balances");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.setItem("cl-wallet-balances", JSON.stringify(INITIAL_BALANCES));
      return INITIAL_BALANCES;
    }
  }
  localStorage.setItem("cl-wallet-balances", JSON.stringify(INITIAL_BALANCES));
  return INITIAL_BALANCES;
}

export function getBalance(userId: string): number {
  const balances = getInitialBalances();
  return balances[userId] || 0;
}

export function updateBalance(userId: string, newBalance: number): void {
  const balances = getInitialBalances();
  balances[userId] = newBalance;
  localStorage.setItem("cl-wallet-balances", JSON.stringify(balances));
}

export function getTransactions(): Transaction[] {
  const stored = localStorage.getItem("cl-transactions");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function addTransaction(transaction: Transaction): void {
  const transactions = getTransactions();
  transactions.unshift(transaction);
  localStorage.setItem("cl-transactions", JSON.stringify(transactions));
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
