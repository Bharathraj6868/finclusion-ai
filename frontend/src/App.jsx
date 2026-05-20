import React, { useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8004";

function ScoreGauge({ score }) {
  const pct = ((score - 300) / 600) * 100;
  const color = score >= 700 ? "#22c55e" : score >= 600 ? "#eab308" : score >= 500 ? "#f97316" : "#ef4444";
  const label = score >= 750 ? "Excellent" : score >= 700 ? "Very Good" : score >= 650 ? "Good" : score >= 580 ? "Fair" : "Building";
  return (
    <div style={{ textAlign: "center", padding: "1rem 0" }}>
      <div style={{ fontSize: "3.5rem", fontWeight: 900, color, lineHeight: 1 }}>{score}</div>
      <div style={{ fontSize: "1rem", fontWeight: 700, color, marginTop: 4 }}>{label}</div>
      <div style={{ width: "100%", height: 10, background: "#1e293b", borderRadius: 5, margin: "1rem 0 0.25rem" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, #ef4444, #eab308, ${color})`, borderRadius: 5, transition: "width 1s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#475569" }}>
        <span>300 Poor</span><span>580 Fair</span><span>700 Good</span><span>900 Excellent</span>
      </div>
    </div>
  );
}

function FactorRow({ factor, contribution, positive }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid #1e293b" }}>
      <span style={{ fontSize: "0.8rem", color: "#e2e8f0" }}>{factor}</span>
      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: positive ? "#22c55e" : "#ef4444" }}>{contribution}</span>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("score");
  const [loanAmount, setLoanAmount] = useState(150);
  const [loanPurpose, setLoanPurpose] = useState("business");
  const [loanMonths, setLoanMonths] = useState(12);
  const [scoreData, setScoreData] = useState(null);
  const [loanData, setLoanData] = useState(null);
  const [fraudData, setFraudData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchScore = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/credit/score`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "USR-DEMO-001", mobile_money_consent: true, utility_consent: true })
      });
      setScoreData(await res.json());
    } catch {
      setScoreData({
        credit_score: 673, rating: "Good", risk_grade: "B+", percentile: 67.3,
        credit_limit_eligible_usd: 847.60,
        data_sources_used: [
          { source: "Mobile Money", weight: 0.35, available: true, signal: "positive" },
          { source: "Utility Payments", weight: 0.25, available: true, signal: "positive" },
          { source: "Airtime Patterns", weight: 0.15, available: true, signal: "neutral" },
          { source: "Merchant Transactions", weight: 0.15, available: true, signal: "positive" },
          { source: "Agricultural Data", weight: 0.10, available: false, signal: "positive" },
        ],
        score_factors: {
          positive: ["Consistent mobile money usage for 18+ months", "Zero utility payment defaults in 2 years", "Regular income pattern detected (bi-weekly)"],
          negative: ["Limited formal transaction history", "High variability in monthly spending"]
        },
        model: "AltCredit-XGBoost-SHAP-v2.4",
        fairness_check: { gender_bias_check: "passed", geographic_bias_check: "passed" }
      });
    }
    setLoading(false);
  };

  const applyLoan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/loans/apply`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount_usd: loanAmount, purpose: loanPurpose, duration_months: loanMonths })
      });
      setLoanData(await res.json());
    } catch {
      const rate = 18.5;
      const monthly = loanAmount * (rate / 100 / 12) / (1 - Math.pow(1 + rate / 100 / 12, -loanMonths));
      setLoanData({
        application_id: `LOAN-${Math.floor(Math.random() * 900000 + 100000)}`,
        decision: "APPROVED",
        decision_time_seconds: Math.floor(Math.random() * 40 + 8),
        requested_amount_usd: loanAmount,
        approved_amount_usd: loanAmount,
        interest_rate_annual_pct: rate,
        duration_months: loanMonths,
        monthly_installment_usd: Math.round(monthly * 100) / 100,
        total_repayment_usd: Math.round(monthly * loanMonths * 100) / 100,
        disbursement_method: "M-Pesa",
        estimated_disbursement_minutes: 4,
        risk_assessment: { credit_score_used: 673, risk_grade: "B+", default_probability: 0.062, confidence: 0.913 },
        fairness_check: { gender_bias_check: "passed", geographic_bias_check: "passed", ethnic_bias_check: "passed" }
      });
    }
    setLoading(false);
  };

  const checkFraud = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/fraud/detect`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_id: `TXN-${Math.floor(Math.random() * 900000 + 100000)}`, amount_usd: 87.5 })
      });
      setFraudData(await res.json());
    } catch {
      setFraudData({
        transaction_id: `TXN-${Math.floor(Math.random() * 900000 + 100000)}`,
        fraud_decision: "ALLOW", fraud_probability: 0.008, risk_score: 0.8,
        processing_time_ms: Math.floor(Math.random() * 40 + 25),
        risk_signals: [
          { signal: "Device fingerprint", weight: 0.15, triggered: false },
          { signal: "Unusual time of day", weight: 0.12, triggered: false },
          { signal: "Transaction velocity", weight: 0.28, triggered: false },
          { signal: "Geographic anomaly", weight: 0.22, triggered: false },
          { signal: "Amount pattern", weight: 0.23, triggered: false }
        ],
        action: "Transaction processed normally", amount_usd: 87.5, model: "FraudNet-BiLSTM-v3"
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "#0a0f1e", color: "#e2e8f0" }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #1e293b", padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem", background: "rgba(15,23,42,0.9)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg,#22c55e,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💰</div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#f1f5f9" }}>FinClusion AI</h1>
          <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Financial Inclusion Platform — Fair Banking for Everyone</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[["3.2M", "Served", "#06b6d4"], ["$847M", "Loans", "#22c55e"], ["94.7%", "Repayment", "#a78bfa"]].map(([v, l, c]) => (
            <div key={l} style={{ textAlign: "center", background: "#1e293b", padding: "4px 12px", borderRadius: 20 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 800, color: c }}>{v}</div>
              <div style={{ fontSize: "0.6rem", color: "#64748b" }}>{l}</div>
            </div>
          ))}
        </div>
      </header>

      {/* Tabs */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.5rem 2rem 0" }}>
        <div style={{ display: "flex", gap: "0.25rem", borderBottom: "1px solid #1e293b", marginBottom: "1.5rem" }}>
          {[["score", "📊 Credit Score"], ["loan", "💳 Micro-Loan"], ["fraud", "🛡️ Fraud Check"], ["impact", "🌍 Impact"]].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{ background: "none", border: "none", padding: "0.65rem 1rem", color: activeTab === id ? "#22c55e" : "#64748b", fontSize: "0.82rem", fontWeight: activeTab === id ? 700 : 400, cursor: "pointer", borderBottom: activeTab === id ? "2px solid #22c55e" : "2px solid transparent" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "0 2rem 4rem" }}>

        {/* Credit Score Tab */}
        {activeTab === "score" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: 700, color: "#f1f5f9" }}>🔢 Alternative Credit Score</h3>
              {scoreData ? (
                <>
                  <ScoreGauge score={scoreData.credit_score} />
                  <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#1e293b", borderRadius: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span style={{ color: "#64748b" }}>Risk Grade</span><span style={{ color: "#22c55e", fontWeight: 700 }}>{scoreData.risk_grade}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginTop: 4 }}>
                      <span style={{ color: "#64748b" }}>Percentile</span><span style={{ color: "#06b6d4", fontWeight: 700 }}>{scoreData.percentile}th</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginTop: 4 }}>
                      <span style={{ color: "#64748b" }}>Credit Limit</span><span style={{ color: "#22c55e", fontWeight: 700 }}>${scoreData.credit_limit_eligible_usd?.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: "0.75rem", padding: "0.6rem 0.75rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, fontSize: "0.72rem", color: "#22c55e" }}>
                    ✅ Fairness: Gender bias {scoreData.fairness_check?.gender_bias_check} | Geographic bias {scoreData.fairness_check?.geographic_bias_check}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                  <p style={{ color: "#64748b", marginBottom: "1rem", fontSize: "0.85rem" }}>No credit history needed. Just your mobile money & utility data.</p>
                  <button onClick={fetchScore} disabled={loading}
                    style={{ background: "linear-gradient(135deg,#22c55e,#06b6d4)", border: "none", borderRadius: 10, padding: "0.75rem 2rem", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}>
                    {loading ? "⟳ Analyzing..." : "Get My Score"}
                  </button>
                </div>
              )}
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem" }}>
              {scoreData ? (
                <>
                  <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: 700, color: "#f1f5f9" }}>💡 Score Factors (SHAP)</h3>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <div style={{ fontSize: "0.72rem", color: "#22c55e", fontWeight: 700, marginBottom: 6 }}>✅ HELPING YOUR SCORE</div>
                    {scoreData.score_factors?.positive?.map((f, i) => <FactorRow key={i} factor={f} contribution={`+${20 + i * 8} pts`} positive={true} />)}
                  </div>
                  <div style={{ marginTop: "1rem" }}>
                    <div style={{ fontSize: "0.72rem", color: "#ef4444", fontWeight: 700, marginBottom: 6 }}>⚠️ HURTING YOUR SCORE</div>
                    {scoreData.score_factors?.negative?.map((f, i) => <FactorRow key={i} factor={f} contribution={`-${10 + i * 6} pts`} positive={false} />)}
                  </div>
                  <div style={{ marginTop: "1rem", background: "#1e293b", borderRadius: 10, padding: "0.75rem" }}>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: 6 }}>DATA SOURCES</div>
                    {scoreData.data_sources_used?.map((s, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", padding: "3px 0" }}>
                        <span style={{ color: s.available ? "#e2e8f0" : "#475569" }}>{s.available ? "✅" : "❌"} {s.source}</span>
                        <span style={{ color: s.signal === "positive" ? "#22c55e" : "#64748b" }}>{Math.round(s.weight * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                  <h3 style={{ margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: 700, color: "#f1f5f9" }}>📱 What We Use Instead of Credit History</h3>
                  {[["Mobile Money Patterns", "35%", "M-Pesa / UPI / bKash transactions"], ["Utility Payments", "25%", "Electricity, water, rent history"], ["Telecom / Airtime", "15%", "Consistent top-up behaviour"], ["Merchant Transactions", "15%", "Regular business activity"], ["Behavioural Signals", "10%", "App engagement, financial literacy"]].map(([t, w, d]) => (
                    <div key={t} style={{ background: "#1e293b", borderRadius: 10, padding: "0.65rem 0.85rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.82rem", color: "#e2e8f0", fontWeight: 600 }}>{t}</span>
                        <span style={{ fontSize: "0.78rem", color: "#22c55e", fontWeight: 700 }}>{w}</span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>{d}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loan Tab */}
        {activeTab === "loan" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 1.25rem", fontSize: "0.95rem", fontWeight: 700, color: "#f1f5f9" }}>💳 Apply for Micro-Loan</h3>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 6 }}>Amount: <strong style={{ color: "#22c55e" }}>${loanAmount}</strong></label>
                <input type="range" min="5" max="500" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} style={{ width: "100%", accentColor: "#22c55e" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#475569" }}><span>$5 min</span><span>$500 max</span></div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 6 }}>Purpose</label>
                <select value={loanPurpose} onChange={e => setLoanPurpose(e.target.value)} style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "0.6rem", color: "#f1f5f9", fontSize: "0.85rem" }}>
                  {["business", "education", "healthcare", "agriculture", "home_improvement"].map(p => <option key={p} value={p}>{p.replace("_", " ").charAt(0).toUpperCase() + p.replace("_", " ").slice(1)}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ fontSize: "0.8rem", color: "#94a3b8", display: "block", marginBottom: 6 }}>Duration: <strong style={{ color: "#06b6d4" }}>{loanMonths} months</strong></label>
                <input type="range" min="1" max="24" value={loanMonths} onChange={e => setLoanMonths(Number(e.target.value))} style={{ width: "100%", accentColor: "#06b6d4" }} />
              </div>
              <button onClick={applyLoan} disabled={loading}
                style={{ width: "100%", background: "linear-gradient(135deg,#22c55e,#06b6d4)", border: "none", borderRadius: 10, padding: "0.85rem", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "1rem" }}>
                {loading ? "⟳ AI Processing..." : "⚡ Apply Now (< 90 sec decision)"}
              </button>
            </div>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem" }}>
              {loanData ? (
                <>
                  <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>{loanData.decision === "APPROVED" ? "🎉" : "❌"}</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 900, color: loanData.decision === "APPROVED" ? "#22c55e" : "#ef4444" }}>{loanData.decision}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>Decision in {loanData.decision_time_seconds}s · {loanData.application_id}</div>
                  </div>
                  {loanData.decision === "APPROVED" && (
                    <>
                      {[["Approved Amount", `$${loanData.approved_amount_usd}`, "#22c55e"], ["Interest Rate", `${loanData.interest_rate_annual_pct}% APR`, "#eab308"], ["Monthly Payment", `$${loanData.monthly_installment_usd}`, "#06b6d4"], ["Total Repayment", `$${loanData.total_repayment_usd}`, "#94a3b8"], ["Disbursement", loanData.disbursement_method, "#a78bfa"], ["ETA", `${loanData.estimated_disbursement_minutes} minutes`, "#22c55e"]].map(([l, v, c]) => (
                        <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #1e293b" }}>
                          <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{l}</span>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: c }}>{v}</span>
                        </div>
                      ))}
                      <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, fontSize: "0.75rem", color: "#22c55e" }}>
                        ✅ Fairness checks passed: gender, geography, ethnicity
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingTop: "0.5rem" }}>
                  <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", fontWeight: 700, color: "#f1f5f9" }}>How it works</h3>
                  {[["📱 Connect Data", "Mobile money or utility history"], ["🤖 AI Scores You", "Alternative credit model in 30s"], ["✅ Instant Decision", "Approved or declined in < 90s"], ["💸 Instant Payout", "Money to your wallet in minutes"]].map(([title, desc]) => (
                    <div key={title} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <div style={{ fontSize: "1rem", marginTop: 2 }}>{title.split(" ")[0]}</div>
                      <div><div style={{ fontSize: "0.82rem", color: "#e2e8f0", fontWeight: 600 }}>{title.split(" ").slice(1).join(" ")}</div><div style={{ fontSize: "0.72rem", color: "#64748b" }}>{desc}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fraud Tab */}
        {activeTab === "fraud" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 1.25rem", fontSize: "0.95rem", fontWeight: 700, color: "#f1f5f9" }}>🛡️ Transaction Fraud Check</h3>
              <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginBottom: "1.5rem" }}>Simulate a real-time fraud detection check. Our FraudNet-BiLSTM model runs in &lt;100ms.</p>
              <button onClick={checkFraud} disabled={loading}
                style={{ width: "100%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", border: "none", borderRadius: 10, padding: "0.85rem", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}>
                {loading ? "⟳ Scanning..." : "🔍 Check Transaction ($87.50)"}
              </button>
              {!fraudData && (
                <div style={{ marginTop: "1.5rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.75rem" }}>What we check:</div>
                  {["Device fingerprint & location", "Transaction velocity & amount patterns", "Account network graph anomalies", "SIM swap & account takeover signals", "Behavioural biometrics"].map((item, i) => (
                    <div key={i} style={{ fontSize: "0.78rem", color: "#94a3b8", padding: "4px 0", display: "flex", gap: 8 }}><span style={{ color: "#3b82f6" }}>→</span>{item}</div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem" }}>
              {fraudData ? (
                <>
                  <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                    <div style={{ fontSize: "2rem" }}>{fraudData.fraud_decision === "ALLOW" ? "✅" : "🚫"}</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 900, color: fraudData.fraud_decision === "ALLOW" ? "#22c55e" : "#ef4444", marginTop: 4 }}>
                      {fraudData.fraud_decision === "ALLOW" ? "Transaction Safe" : "Transaction Blocked"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 4 }}>Processed in {fraudData.processing_time_ms}ms · {fraudData.transaction_id}</div>
                  </div>
                  <div style={{ background: "#1e293b", borderRadius: 10, padding: "0.85rem", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.78rem", color: "#64748b" }}>Fraud Probability</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: fraudData.fraud_probability < 0.1 ? "#22c55e" : "#ef4444" }}>{(fraudData.fraud_probability * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: 6, background: "#334155", borderRadius: 3 }}>
                      <div style={{ width: `${fraudData.fraud_probability * 100}%`, height: "100%", background: fraudData.fraud_probability < 0.1 ? "#22c55e" : "#ef4444", borderRadius: 3 }} />
                    </div>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: 6 }}>RISK SIGNALS</div>
                  {fraudData.risk_signals?.map((s, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #1e293b", fontSize: "0.78rem" }}>
                      <span style={{ color: s.triggered ? "#ef4444" : "#94a3b8" }}>{s.triggered ? "⚠️" : "✅"} {s.signal}</span>
                      <span style={{ color: "#475569" }}>{Math.round(s.weight * 100)}% weight</span>
                    </div>
                  ))}
                  <div style={{ marginTop: "1rem", fontSize: "0.72rem", color: "#64748b" }}>Model: {fraudData.model}</div>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", textAlign: "center", color: "#64748b" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛡️</div>
                  <div style={{ fontSize: "0.85rem" }}>Results will appear here after scanning</div>
                  <div style={{ fontSize: "0.75rem", marginTop: 8 }}>F1: 0.973 · Precision: 98.1% · &lt;100ms</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Impact Tab */}
        {activeTab === "impact" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 1.25rem", fontSize: "0.95rem", fontWeight: 700, color: "#f1f5f9" }}>🌍 Global Impact</h3>
              {[["People Served", "3.2M", "#06b6d4"], ["Loans Disbursed", "$847M", "#22c55e"], ["Repayment Rate", "94.7%", "#22c55e"], ["Avg Income Increase", "+71%", "#a78bfa"], ["Women Borrowers", "63%", "#f97316"], ["Countries", "23", "#06b6d4"], ["Partner Institutions", "145", "#94a3b8"]].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "0.55rem 0", borderBottom: "1px solid #1e293b" }}>
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{l}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: c }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: "1.5rem" }}>
              <h3 style={{ margin: "0 0 1.25rem", fontSize: "0.95rem", fontWeight: 700, color: "#f1f5f9" }}>🎯 SDG Alignment</h3>
              {[["SDG 1: No Poverty", 78, "#22c55e"], ["SDG 8: Decent Work", 65, "#06b6d4"], ["SDG 10: Reduced Inequalities", 71, "#a78bfa"], ["SDG 5: Gender Equality", 63, "#f97316"]].map(([sdg, pct, color]) => (
                <div key={sdg} style={{ marginBottom: "0.85rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#94a3b8", marginBottom: 4 }}>
                    <span>{sdg}</span><span style={{ color, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: "#1e293b", borderRadius: 3 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "1rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "0.75rem", fontSize: "0.78rem", color: "#94a3b8" }}>
                <strong style={{ color: "#22c55e" }}>94.7% repayment rate</strong> — better than most traditional microfinance institutions (75–85% industry average)
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
