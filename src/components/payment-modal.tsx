import { useState, useEffect } from "react";
import { type User, DEMO_USERS, getBalance, updateBalance, addTransaction, generateOTP, type Transaction } from "@/lib/users";

interface PaymentModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export function PaymentModal({ currentUser, isOpen, onClose, onPaymentSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<"select" | "amount" | "otp" | "processing" | "success">("select");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [amount, setAmount] = useState(0);
  const [otp, setOtp] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [error, setError] = useState("");
  const [newTransaction, setNewTransaction] = useState<Transaction | null>(null);

  const currentBalance = getBalance(currentUser.id);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep("select");
      setSelectedUser(null);
      setAmount(0);
      setOtp("");
      setGeneratedOTP("");
      setError("");
      setNewTransaction(null);
    }
  }, [isOpen]);

  const handleSelectUser = (user: User) => {
    if (user.id === currentUser.id) {
      setError("Cannot send money to yourself");
      return;
    }
    setSelectedUser(user);
    setError("");
    setStep("amount");
  };

  const handleAmountSubmit = () => {
    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    if (amount > currentBalance) {
      setError("Insufficient balance");
      return;
    }
    setError("");
    const otpCode = generateOTP();
    setGeneratedOTP(otpCode);
    setStep("otp");
    // In real app, send OTP via SMS/email. For demo, we show it
    console.log("Demo OTP:", otpCode);
  };

  const handleOTPVerify = () => {
    if (otp !== generatedOTP) {
      setError("Invalid OTP. Please try again.");
      return;
    }
    if (!selectedUser) return;

    setError("");
    setStep("processing");

    // Simulate processing delay
    setTimeout(() => {
      // Update balances
      const senderNewBalance = currentBalance - amount;
      const receiverBalance = getBalance(selectedUser.id);
      const receiverNewBalance = receiverBalance + amount;

      updateBalance(currentUser.id, senderNewBalance);
      updateBalance(selectedUser.id, receiverNewBalance);

      // Create transaction record
      const transaction: Transaction = {
        id: `txn-${Date.now()}`,
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        toUserId: selectedUser.id,
        toUserName: selectedUser.name,
        amount,
        timestamp: new Date().toISOString(),
        status: "completed",
      };

      addTransaction(transaction);
      setNewTransaction(transaction);
      setStep("success");
      onPaymentSuccess();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card/95 p-8 backdrop-blur relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:text-foreground transition"
        >
          ✕
        </button>

        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-toxic mb-2">
          // Transfer Carbon Credits
        </div>

        {/* STEP 1: Select User */}
        {step === "select" && (
          <>
            <h2 className="text-2xl font-bold mb-6">Send to whom?</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {DEMO_USERS.filter((u) => u.id !== currentUser.id).map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="flex w-full items-center gap-3 rounded-md border border-border bg-background/40 px-4 py-3 text-left transition hover:border-toxic/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-toxic font-mono text-xs font-bold text-primary-foreground">
                    {user.avatarSeed}
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground font-semibold">{user.name}</div>
                    <div className="text-[10px] text-muted-foreground">{user.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Credits</div>
                    <div className="text-toxic font-mono font-semibold">{getBalance(user.id).toFixed(2)} kg</div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 2: Enter Amount */}
        {step === "amount" && selectedUser && (
          <>
            <h2 className="text-2xl font-bold mb-2">How many credits?</h2>
            <div className="rounded-md border border-toxic/30 bg-toxic/5 px-4 py-3 mb-6">
              <span className="text-muted-foreground text-sm">Sending to: </span>
              <span className="text-toxic font-semibold">{selectedUser.name}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Your Credits: {currentBalance.toFixed(2)} kg CO₂e
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={currentBalance}
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full rounded-md border border-border bg-input px-5 py-4 font-mono text-3xl text-toxic placeholder:text-muted-foreground/30 focus:border-toxic focus:outline-none"
                />
              </div>

              {/* Quick amount buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val)}
                    className="rounded-md border border-border bg-background/40 px-3 py-2 font-mono text-sm text-foreground hover:border-toxic/50 transition"
                  >
                    {val} kg
                  </button>
                ))}
              </div>

              {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep("select")}
                  className="flex-1 rounded-md border border-border px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
                >
                  ← Back
                </button>
                <button
                  onClick={handleAmountSubmit}
                  disabled={amount <= 0}
                  className="flex-1 rounded-md gradient-toxic px-5 py-3 font-mono text-xs uppercase tracking-widest text-primary-foreground glow-toxic disabled:opacity-40"
                >
                  Continue →
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 3: OTP Verification */}
        {step === "otp" && (
          <>
            <h2 className="text-2xl font-bold mb-2">Verify Payment</h2>
            <div className="rounded-md border border-toxic/30 bg-toxic/5 px-4 py-3 mb-6">
              <span className="text-muted-foreground text-sm">Amount: </span>
              <span className="text-toxic font-semibold">{amount.toFixed(2)} kg CO₂e</span>
              <span className="mx-2 text-muted-foreground">→</span>
              <span className="text-foreground text-sm">{selectedUser?.name}</span>
            </div>

            <div className="space-y-4">
              {/* Demo OTP Display */}
              <div className="rounded-lg border border-accent/60 bg-accent/10 p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  Demo OTP (for testing)
                </div>
                <div className="font-mono text-3xl font-bold text-accent tracking-widest">
                  {generatedOTP}
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  Enter this OTP below to verify
                </div>
              </div>

              <div>
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Enter OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full rounded-md border border-border bg-input px-5 py-4 font-mono text-3xl text-center text-toxic placeholder:text-muted-foreground/30 focus:border-toxic focus:outline-none tracking-widest"
                />
              </div>

              {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep("amount")}
                  className="flex-1 rounded-md border border-border px-5 py-3 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
                >
                  ← Back
                </button>
                <button
                  onClick={handleOTPVerify}
                  disabled={otp.length !== 6}
                  className="flex-1 rounded-md gradient-toxic px-5 py-3 font-mono text-xs uppercase tracking-widest text-primary-foreground glow-toxic disabled:opacity-40"
                >
                  Verify & Transfer →
                </button>
              </div>
            </div>
          </>
        )}

        {/* STEP 4: Processing */}
        {step === "processing" && (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-border border-t-toxic" />
            <h3 className="text-xl font-bold mb-2">Transferring Credits</h3>
            <p className="text-sm text-muted-foreground">Please wait while we process your carbon credit transfer...</p>
          </div>
        )}

        {/* STEP 5: Success */}
        {step === "success" && newTransaction && (
          <div className="text-center py-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-toxic/20">
              <svg className="h-10 w-10 text-toxic" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold mb-2 text-gradient-toxic">Transfer Successful!</h3>
            <p className="text-lg text-muted-foreground mb-6">
              {newTransaction.amount.toFixed(2)} kg CO₂e sent to {newTransaction.toUserName}
            </p>

            <div className="rounded-lg border border-border bg-background/40 p-4 mb-6 text-left">
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Transaction ID</span>
                  <span className="text-foreground">{newTransaction.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Timestamp</span>
                  <span className="text-foreground">{new Date(newTransaction.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Status</span>
                  <span className="text-toxic">COMPLETED</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-md gradient-toxic px-5 py-3 font-mono text-xs uppercase tracking-widest text-primary-foreground glow-toxic"
            >
              Done
            </button>
          </div>
        )}

        {/* Error display */}
        {error && step !== "otp" && step !== "amount" && (
          <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
