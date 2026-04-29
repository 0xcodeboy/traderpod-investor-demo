import { useState, useEffect, useRef } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#060608;color:#f0f0f0;font-family:'Manrope',sans-serif;overflow-x:hidden;}
::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#1e1e1e;}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,212,170,.5)}70%{box-shadow:0 0 0 8px rgba(0,212,170,0)}}
@keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes glow{0%,100%{text-shadow:0 0 20px rgba(0,212,170,.3)}50%{text-shadow:0 0 40px rgba(0,212,170,.7)}}
@keyframes barFill{from{width:0}to{width:var(--w)}}
@keyframes ring{from{stroke-dashoffset:var(--start)}to{stroke-dashoffset:var(--end)}}
@keyframes countUp{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
@keyframes notifSlide{0%{opacity:0;transform:translateY(-100%)}15%,75%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-100%)}}
@keyframes typewriter{from{width:0}to{width:100%}}
.fade-up{animation:fadeUp .5s ease both;}
.fade-in{animation:fadeIn .4s ease both;}
.slide-in{animation:slideIn .35s ease both;}
`;

const SCREENS = [
  { id: "passport", label: "Discipline Passport", icon: "🪪" },
  { id: "ritual", label: "Pre-Session Ritual", icon: "🧘" },
  { id: "contract", label: "Accountability Contract", icon: "🤝" },
  { id: "debrief", label: "Post-Session Debrief", icon: "🧠" },
  { id: "leaderboard", label: "Discipline League", icon: "🏆" },
];

const PASSPORT_STATS = [
  { label: "Sessions Completed", value: "127", sub: "last 90 days" },
  { label: "Rules Kept", value: "89%", sub: "consistency rate" },
  { label: "Avg Discipline Score", value: "78", sub: "all-time" },
  { label: "Longest Streak", value: "21d", sub: "no rule breaks" },
];

const WEEKLY = [
  { day: "M", score: 82, breaks: 0 },
  { day: "T", score: 74, breaks: 2 },
  { day: "W", score: 91, breaks: 0 },
  { day: "T", score: 55, breaks: 4 },
  { day: "F", score: 63, breaks: 3 },
  { day: "S", score: 88, breaks: 1 },
  { day: "S", score: 95, breaks: 0 },
];

const RULES_LIST = [
  { icon: "⚖️", label: "Max position size", value: "1.0 lots", active: true },
  { icon: "🔢", label: "Max trades per day", value: "5 trades", active: true },
  { icon: "📉", label: "Daily drawdown limit", value: "2% account", active: true },
  { icon: "⏱️", label: "Cooldown after loss", value: "30 minutes", active: true },
  { icon: "🚫", label: "No trading during news", value: "±15 min window", active: false },
];

const DEBRIEF_PATTERNS = [
  { icon: "⚠️", label: "Revenge trading detected", detail: "3x on Thursday after 10am loss", severity: "high" },
  { icon: "📈", label: "Best performance window", detail: "London open 9–11am WAT", severity: "good" },
  { icon: "🔁", label: "Repeated rule break", detail: "Lot size exceeded 6x this week", severity: "high" },
  { icon: "✅", label: "Strongest discipline day", detail: "Wednesday — 0 breaks, 5 clean trades", severity: "good" },
];

const LEADERBOARD = [
  { rank: 1, name: "Tunde A.", score: 96, streak: 14, badge: "🥇", you: false },
  { rank: 2, name: "Emeka O.", score: 91, streak: 9, badge: "🥈", you: false },
  { rank: 3, name: "Brian O.", score: 84, streak: 7, badge: "🥉", you: true },
  { rank: 4, name: "Fatima K.", score: 79, streak: 5, badge: null, you: false },
  { rank: 5, name: "Chidi M.", score: 71, streak: 3, badge: null, you: false },
  { rank: 6, name: "Aisha B.", score: 68, streak: 2, badge: null, you: false },
];

const TICKER_ITEMS = [
  "BRIAN → 84 DISCIPLINE SCORE",
  "TUNDE → 14-DAY CLEAN STREAK",
  "EMEKA → BROKE 0 RULES TODAY",
  "FATIMA → SESSION CONFIRMED",
  "CHIDI → PARTNER ACTIVATED",
  "LONDON SESSION → LIVE NOW",
];

function Mono({ children, style }) {
  return <span style={{ fontFamily: "'DM Mono',monospace", ...style }}>{children}</span>;
}

function Tag({ children, color = "#00D4AA" }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: `rgba(${color === "#00D4AA" ? "0,212,170" : color === "#FF4D4D" ? "255,77,77" : "255,184,0"},.1)`,
      border: `1px solid ${color}33`,
      borderRadius: 20, padding: "4px 12px",
    }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, animation: "pulse 2s infinite" }} />
      <Mono style={{ fontSize: 9, color, letterSpacing: "0.15em", textTransform: "uppercase" }}>{children}</Mono>
    </div>
  );
}

function ScoreArc({ score, size = 120 }) {
  const r = size / 2 - 10;
  const circ = Math.PI * r; // half circle
  const fill = (score / 100) * circ;
  const color = score >= 75 ? "#00D4AA" : score >= 50 ? "#FFB800" : "#FF4D4D";
  return (
    <div style={{ position: "relative", width: size, height: size / 2 + 20 }}>
      <svg width={size} height={size / 2 + 10} style={{ overflow: "visible" }}>
        <path d={`M 10 ${size/2} A ${r} ${r} 0 0 1 ${size-10} ${size/2}`}
          fill="none" stroke="#1a1a1a" strokeWidth={8} strokeLinecap="round" />
        <path d={`M 10 ${size/2} A ${r} ${r} 0 0 1 ${size-10} ${size/2}`}
          fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dasharray 1.2s ease" }} />
      </svg>
      <div style={{
        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
        textAlign: "center"
      }}>
        <div style={{
          fontFamily: "'Bebas Neue',sans-serif", fontSize: size * 0.28,
          color, lineHeight: 1, animation: "glow 3s infinite"
        }}>{score}</div>
        <Mono style={{ fontSize: 9, color: "#555", letterSpacing: "0.1em" }}>DISCIPLINE</Mono>
      </div>
    </div>
  );
}

function MiniBar({ value, max = 100, color = "#00D4AA", height = 4 }) {
  return (
    <div style={{ background: "#1a1a1a", borderRadius: 2, height, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${(value / max) * 100}%`,
        background: color, borderRadius: 2,
        transition: "width 1s ease", boxShadow: `0 0 6px ${color}55`
      }} />
    </div>
  );
}

// ── PASSPORT SCREEN ────────────────────────────────────────────
function PassportScreen() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Passport card */}
      <div style={{
        background: "linear-gradient(135deg, #0d1a16 0%, #0a0f0e 50%, #111816 100%)",
        border: "1px solid #00D4AA33", borderRadius: 16, padding: "24px 20px",
        marginBottom: 16, position: "relative", overflow: "hidden",
        animation: "fadeUp .5s ease both"
      }}>
        {/* Background texture */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "repeating-linear-gradient(0deg, #00D4AA 0px, #00D4AA 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #00D4AA 0px, #00D4AA 1px, transparent 1px, transparent 20px)"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <Tag>Discipline Passport</Tag>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: "0.05em", marginTop: 10, lineHeight: 1 }}>
                BRIAN OLADELE
              </div>
              <Mono style={{ fontSize: 10, color: "#555", marginTop: 4 }}>@traderpod_ · Member since Jan 2025</Mono>
            </div>
            <ScoreArc score={loaded ? 84 : 0} size={100} />
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {PASSPORT_STATS.map((s, i) => (
              <div key={i} style={{
                background: "rgba(0,0,0,.4)", borderRadius: 8, padding: "12px",
                border: "1px solid #1e1e1e",
                animation: `fadeUp .4s ease ${i * 0.08 + 0.3}s both`
              }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: "#00D4AA", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.label}</div>
                <Mono style={{ fontSize: 9, color: "#444", display: "block", marginTop: 2 }}>{s.sub}</Mono>
              </div>
            ))}
          </div>

          {/* Tier badge */}
          <div style={{
            marginTop: 14, padding: "10px 14px",
            background: "rgba(0,212,170,.08)", border: "1px solid #00D4AA33",
            borderRadius: 8, display: "flex", alignItems: "center", gap: 10
          }}>
            <span style={{ fontSize: 20 }}>⚡</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#00D4AA" }}>DISCIPLINED TRADER — Tier 4</div>
              <Mono style={{ fontSize: 9, color: "#555" }}>16 points to reach ELITE tier</Mono>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div style={{
        background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12,
        padding: "16px", animation: "fadeUp .5s ease .2s both"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <Mono style={{ fontSize: 10, color: "#555", letterSpacing: "0.1em" }}>7-DAY SCORE HISTORY</Mono>
          <Mono style={{ fontSize: 10, color: "#00D4AA" }}>THIS WEEK</Mono>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 60 }}>
          {WEEKLY.map((d, i) => {
            const h = (d.score / 100) * 52;
            const color = d.score >= 75 ? "#00D4AA" : d.score >= 50 ? "#FFB800" : "#FF4D4D";
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: "100%", height: h, background: color,
                  borderRadius: "3px 3px 0 0", opacity: 0.8,
                  transition: "height 1s ease", boxShadow: `0 0 8px ${color}44`
                }} />
                <Mono style={{ fontSize: 8, color: "#444" }}>{d.day}</Mono>
              </div>
            );
          })}
        </div>
      </div>

      {/* Investor note */}
      <div style={{
        marginTop: 14, padding: "14px 16px",
        background: "rgba(255,184,0,.05)", border: "1px solid rgba(255,184,0,.15)",
        borderRadius: 10, animation: "fadeUp .5s ease .4s both"
      }}>
        <Mono style={{ fontSize: 9, color: "#FFB800", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>
          WHY THIS MATTERS
        </Mono>
        <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
          The Discipline Passport turns private struggle into <strong style={{ color: "#f0f0f0" }}>public identity.</strong> Traders share their score to get into funded groups, attract clients, and prove credibility. Discipline becomes a career asset — not just a personal battle.
        </p>
      </div>
    </div>
  );
}

// ── RITUAL SCREEN ──────────────────────────────────────────────
function RitualScreen() {
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [checking, setChecking] = useState(false);

  function confirm() {
    setChecking(true);
    setTimeout(() => { setChecking(false); setConfirmed(true); }, 1200);
  }

  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Morning brief */}
      <div style={{
        background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12,
        padding: "20px", marginBottom: 14, animation: "fadeUp .4s ease both"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <Tag>Pre-Session Ritual</Tag>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 8, letterSpacing: "-0.02em" }}>
              Good morning, Brian 👋
            </div>
            <Mono style={{ fontSize: 10, color: "#555", display: "block", marginTop: 4 }}>
              London session opens in 14 minutes
            </Mono>
          </div>
          <div style={{ textAlign: "right" }}>
            <Mono style={{ fontSize: 9, color: "#555", display: "block", marginBottom: 4 }}>TODAY</Mono>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: "#00D4AA" }}>MON</div>
            <Mono style={{ fontSize: 9, color: "#555" }}>APR 28</Mono>
          </div>
        </div>

        {/* Yesterday's brief */}
        <div style={{
          background: "rgba(255,77,77,.06)", border: "1px solid rgba(255,77,77,.15)",
          borderRadius: 8, padding: "12px 14px", marginBottom: 14,
          animation: "shake .4s ease .5s both"
        }}>
          <Mono style={{ fontSize: 9, color: "#FF4D4D", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>
            YESTERDAY'S REPORT
          </Mono>
          <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>
            You broke <strong style={{ color: "#FF4D4D" }}>3 rules</strong> — revenge traded twice after your 10:45 loss on XAUUSD. Discipline score dropped from <strong style={{ color: "#FFB800" }}>79 → 63.</strong> Emeka was notified all 3 times.
          </div>
        </div>

        {/* Rules confirmation */}
        <Mono style={{ fontSize: 9, color: "#555", letterSpacing: "0.12em", display: "block", marginBottom: 10 }}>
          CONFIRM TODAY'S RULES TO BEGIN
        </Mono>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {RULES_LIST.filter(r => r.active).map((rule, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", background: "#111",
              border: `1px solid ${confirmed ? "#00D4AA33" : "#1e1e1e"}`,
              borderRadius: 8, transition: "border-color .4s ease",
              animation: `slideIn .3s ease ${i * 0.08}s both`
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{rule.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{rule.label}</div>
                <Mono style={{ fontSize: 10, color: "#555" }}>{rule.value}</Mono>
              </div>
              <div style={{
                width: 18, height: 18, borderRadius: 4,
                background: confirmed ? "#00D4AA" : "#1a1a1a",
                border: `1px solid ${confirmed ? "#00D4AA" : "#333"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .3s ease", fontSize: 10
              }}>{confirmed && "✓"}</div>
            </div>
          ))}
        </div>

        {!confirmed ? (
          <button onClick={confirm} disabled={checking} style={{
            width: "100%", padding: "14px",
            background: checking ? "#1a1a1a" : "#00D4AA",
            color: checking ? "#555" : "#000",
            fontFamily: "'DM Mono',monospace", fontSize: 11, fontWeight: 500,
            letterSpacing: "0.12em", border: "none", borderRadius: 8,
            cursor: checking ? "not-allowed" : "pointer", textTransform: "uppercase",
            transition: "all .3s ease"
          }}>
            {checking ? "Notifying partner..." : "Confirm Rules & Begin Session →"}
          </button>
        ) : (
          <div style={{
            padding: "14px", background: "rgba(0,212,170,.08)",
            border: "1px solid #00D4AA33", borderRadius: 8,
            textAlign: "center", animation: "fadeUp .4s ease both"
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#00D4AA", marginBottom: 4 }}>
              ✓ Session Confirmed
            </div>
            <Mono style={{ fontSize: 10, color: "#555" }}>
              Emeka has been notified. Your session is now live.
            </Mono>
          </div>
        )}
      </div>

      {/* Why it works */}
      <div style={{
        padding: "14px 16px", background: "rgba(255,184,0,.05)",
        border: "1px solid rgba(255,184,0,.15)", borderRadius: 10,
        animation: "fadeUp .5s ease .3s both"
      }}>
        <Mono style={{ fontSize: 9, color: "#FFB800", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>
          THE PSYCHOLOGY
        </Mono>
        <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
          Mark Douglas called it <strong style={{ color: "#f0f0f0" }}>"defining the risk before you enter."</strong> The 10-second pause before you confirm your rules is where discipline actually lives — not mid-trade when the emotional brain has taken over. Trader's Pod makes this pause mandatory.
        </p>
      </div>
    </div>
  );
}

// ── CONTRACT SCREEN ────────────────────────────────────────────
function ContractScreen() {
  const [signed, setSigned] = useState(false);
  const [stake, setStake] = useState(5);

  return (
    <div style={{ padding: "0 0 40px" }}>
      <div style={{
        background: "#0d0d0d", border: "1px solid #1a1a1a",
        borderRadius: 12, padding: "20px", marginBottom: 14,
        animation: "fadeUp .4s ease both"
      }}>
        <Tag>Accountability Contract</Tag>
        <div style={{ fontSize: 18, fontWeight: 800, marginTop: 10, marginBottom: 4, letterSpacing: "-0.02em" }}>
          This week&apos;s commitment
        </div>
        <Mono style={{ fontSize: 10, color: "#555", display: "block", marginBottom: 20 }}>
          Between Brian O. and Emeka O.
        </Mono>

        {/* Partner card */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "14px", background: "#111", border: "1px solid #1e1e1e",
          borderRadius: 10, marginBottom: 16
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: "rgba(0,212,170,.1)", border: "2px solid #00D4AA",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#00D4AA"
          }}>EO</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Emeka Okafor</div>
            <Mono style={{ fontSize: 10, color: "#555" }}>Discipline score: 91 · 9-day streak</Mono>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#555", marginBottom: 2 }}>Partner since</div>
            <Mono style={{ fontSize: 10, color: "#00D4AA" }}>March 2025</Mono>
          </div>
        </div>

        {/* Contract terms */}
        <Mono style={{ fontSize: 9, color: "#555", letterSpacing: "0.12em", display: "block", marginBottom: 10 }}>
          CONTRACT TERMS
        </Mono>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Emeka gets notified", detail: "Every time you break a rule — in real time" },
            { label: "Weekly check-in", detail: "Sunday 8pm — 10 min accountability call" },
            { label: "Pattern review", detail: "AI summary shared with partner after each session" },
          ].map((t, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, padding: "10px 14px",
              background: "#111", border: "1px solid #1e1e1e", borderRadius: 8,
              animation: `slideIn .3s ease ${i * 0.1}s both`
            }}>
              <span style={{ color: "#00D4AA", fontSize: 14, flexShrink: 0 }}>→</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{t.label}</div>
                <Mono style={{ fontSize: 10, color: "#555" }}>{t.detail}</Mono>
              </div>
            </div>
          ))}
        </div>

        {/* Optional stake */}
        <div style={{
          padding: "14px", background: "rgba(255,184,0,.06)",
          border: "1px solid rgba(255,184,0,.2)", borderRadius: 10, marginBottom: 16
        }}>
          <Mono style={{ fontSize: 9, color: "#FFB800", letterSpacing: "0.12em", display: "block", marginBottom: 8 }}>
            OPTIONAL STAKE — COMING SOON
          </Mono>
          <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6, marginBottom: 12 }}>
            Add a small financial commitment. If you break more than <strong style={{ color: "#f0f0f0" }}>3 rules this week,</strong> you owe your partner:
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[2, 5, 10].map(s => (
              <button key={s} onClick={() => setStake(s)} style={{
                flex: 1, padding: "10px",
                background: stake === s ? "rgba(255,184,0,.15)" : "#111",
                border: `1px solid ${stake === s ? "#FFB800" : "#1e1e1e"}`,
                borderRadius: 8, color: stake === s ? "#FFB800" : "#555",
                fontFamily: "'DM Mono',monospace", fontSize: 12,
                cursor: "pointer", transition: "all .2s"
              }}>${s}</button>
            ))}
          </div>
        </div>

        {!signed ? (
          <button onClick={() => setSigned(true)} style={{
            width: "100%", padding: "14px", background: "#00D4AA",
            color: "#000", fontFamily: "'DM Mono',monospace", fontSize: 11,
            letterSpacing: "0.12em", border: "none", borderRadius: 8,
            cursor: "pointer", textTransform: "uppercase", fontWeight: 500
          }}>
            Sign Contract — Activate Partnership →
          </button>
        ) : (
          <div style={{
            padding: "14px", background: "rgba(0,212,170,.08)",
            border: "1px solid #00D4AA33", borderRadius: 8,
            textAlign: "center", animation: "fadeUp .4s ease both"
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#00D4AA", marginBottom: 4 }}>
              ✓ Contract Active
            </div>
            <Mono style={{ fontSize: 10, color: "#555" }}>
              Emeka confirmed. Accountability starts now.
            </Mono>
          </div>
        )}
      </div>

      <div style={{
        padding: "14px 16px", background: "rgba(255,184,0,.05)",
        border: "1px solid rgba(255,184,0,.15)", borderRadius: 10,
        animation: "fadeUp .5s ease .3s both"
      }}>
        <Mono style={{ fontSize: 9, color: "#FFB800", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>
          WHY THIS WORKS
        </Mono>
        <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
          The optional stake activates loss aversion — the most powerful force in behavioral economics. <strong style={{ color: "#f0f0f0" }}>$5 feels like nothing</strong> until it&apos;s attached to your ego and your partner&apos;s eyes. That&apos;s the mechanism that changes behavior.
        </p>
      </div>
    </div>
  );
}

// ── DEBRIEF SCREEN ─────────────────────────────────────────────
function DebriefScreen() {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiDone, setAiDone] = useState(false);

  const INSIGHT = "Today's session had 3 rule breaks — all after your 10:47 loss on XAUUSD. This is a recurring pattern: you revenge trade within 20 minutes of a significant loss. Your best trades today happened before 10am. Recommendation: set a mandatory 30-minute break rule after any loss exceeding 0.5% account value. Your discipline score dropped 21 points today. Emeka has been notified and will message you tonight.";

  function generateInsight() {
    setAiLoading(true);
    setAiText("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < INSIGHT.length) {
        setAiText(INSIGHT.slice(0, i + 1));
        i += 2;
      } else {
        setAiDone(true);
        setAiLoading(false);
        clearInterval(interval);
      }
    }, 18);
  }

  return (
    <div style={{ padding: "0 0 40px" }}>
      <div style={{
        background: "#0d0d0d", border: "1px solid #1a1a1a",
        borderRadius: 12, padding: "20px", marginBottom: 14,
        animation: "fadeUp .4s ease both"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <Tag>Post-Session Debrief</Tag>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 10, letterSpacing: "-0.02em" }}>
              Session complete
            </div>
            <Mono style={{ fontSize: 10, color: "#555", display: "block", marginTop: 4 }}>
              Monday Apr 28 · London session
            </Mono>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <ScoreArc score={63} size={80} />
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Trades", value: "6", color: "#f0f0f0" },
            { label: "Rule Breaks", value: "3", color: "#FF4D4D" },
            { label: "Score Δ", value: "-21", color: "#FF4D4D" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "#111", border: "1px solid #1e1e1e", borderRadius: 8,
              padding: "10px", textAlign: "center",
              animation: `fadeUp .3s ease ${i * 0.08}s both`
            }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: s.color }}>{s.value}</div>
              <Mono style={{ fontSize: 9, color: "#555" }}>{s.label}</Mono>
            </div>
          ))}
        </div>

        {/* Patterns */}
        <Mono style={{ fontSize: 9, color: "#555", letterSpacing: "0.12em", display: "block", marginBottom: 10 }}>
          PATTERNS DETECTED
        </Mono>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {DEBRIEF_PATTERNS.map((p, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, padding: "10px 14px",
              background: p.severity === "high" ? "rgba(255,77,77,.05)" : "rgba(0,212,170,.05)",
              border: `1px solid ${p.severity === "high" ? "rgba(255,77,77,.15)" : "rgba(0,212,170,.15)"}`,
              borderRadius: 8, animation: `slideIn .3s ease ${i * 0.1}s both`
            }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{p.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: p.severity === "high" ? "#FF4D4D" : "#00D4AA", marginBottom: 2 }}>{p.label}</div>
                <Mono style={{ fontSize: 10, color: "#555" }}>{p.detail}</Mono>
              </div>
            </div>
          ))}
        </div>

        {/* AI Journal */}
        <Mono style={{ fontSize: 9, color: "#555", letterSpacing: "0.12em", display: "block", marginBottom: 10 }}>
          AI AUTO-JOURNAL
        </Mono>
        {!aiText && !aiLoading ? (
          <button onClick={generateInsight} style={{
            width: "100%", padding: "12px",
            background: "rgba(0,212,170,.08)", border: "1px solid #00D4AA33",
            borderRadius: 8, color: "#00D4AA",
            fontFamily: "'DM Mono',monospace", fontSize: 11,
            letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase"
          }}>
            🤖 Generate AI Session Analysis →
          </button>
        ) : (
          <div style={{
            background: "#111", border: "1px solid #1a1a1a",
            borderLeft: "3px solid #00D4AA",
            borderRadius: "0 8px 8px 0", padding: "14px 16px",
            fontSize: 12, color: "#ccc", lineHeight: 1.8,
            minHeight: 80
          }}>
            {aiText}
            {aiLoading && <span style={{ animation: "pulse 1s infinite", color: "#00D4AA" }}>▌</span>}
          </div>
        )}
      </div>

      <div style={{
        padding: "14px 16px", background: "rgba(255,184,0,.05)",
        border: "1px solid rgba(255,184,0,.15)", borderRadius: 10,
        animation: "fadeUp .5s ease .4s both"
      }}>
        <Mono style={{ fontSize: 9, color: "#FFB800", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>
          THE JOURNAL WRITES ITSELF
        </Mono>
        <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
          Most traders don&apos;t journal because it takes too long. Trader&apos;s Pod auto-generates your session analysis from live trade data — so the insight is always there, whether you write it or not.
        </p>
      </div>
    </div>
  );
}

// ── LEADERBOARD SCREEN ─────────────────────────────────────────
function LeaderboardScreen() {
  return (
    <div style={{ padding: "0 0 40px" }}>
      {/* Ticker */}
      <div style={{
        background: "#0a0a0a", borderTop: "1px solid #1a1a1a",
        borderBottom: "1px solid #1a1a1a", padding: "8px 0",
        overflow: "hidden", marginBottom: 16
      }}>
        <div style={{ display: "flex", gap: 32, animation: "ticker 12s linear infinite", whiteSpace: "nowrap" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#00D4AA", letterSpacing: "0.1em" }}>
              ◆ {item}
            </span>
          ))}
        </div>
      </div>

      <div style={{
        background: "#0d0d0d", border: "1px solid #1a1a1a",
        borderRadius: 12, padding: "20px", marginBottom: 14,
        animation: "fadeUp .4s ease both"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <Tag>Discipline League</Tag>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 8, letterSpacing: "-0.02em" }}>
              West Africa · April 2025
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <Mono style={{ fontSize: 9, color: "#555", display: "block" }}>YOUR RANK</Mono>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: "#00D4AA", lineHeight: 1 }}>#3</div>
          </div>
        </div>

        {/* Rankings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {LEADERBOARD.map((trader, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 14px",
              background: trader.you ? "rgba(0,212,170,.08)" : "#111",
              border: `1px solid ${trader.you ? "#00D4AA33" : "#1e1e1e"}`,
              borderRadius: 10,
              animation: `slideIn .3s ease ${i * 0.08}s both`
            }}>
              <div style={{
                width: 28, fontFamily: "'Bebas Neue',sans-serif",
                fontSize: 18, color: trader.you ? "#00D4AA" : "#555",
                textAlign: "center", flexShrink: 0
              }}>
                {trader.badge || trader.rank}
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: trader.you ? "rgba(0,212,170,.15)" : "#1a1a1a",
                border: `1px solid ${trader.you ? "#00D4AA" : "#2a2a2a"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Mono',monospace", fontSize: 10,
                color: trader.you ? "#00D4AA" : "#555"
              }}>
                {trader.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: trader.you ? "#00D4AA" : "#f0f0f0" }}>
                  {trader.name} {trader.you && <span style={{ fontSize: 10, color: "#00D4AA88" }}>← you</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <MiniBar value={trader.score} color={trader.you ? "#00D4AA" : "#333"} height={3} />
                  <Mono style={{ fontSize: 9, color: "#555", flexShrink: 0 }}>{trader.streak}d streak</Mono>
                </div>
              </div>
              <div style={{
                fontFamily: "'Bebas Neue',sans-serif", fontSize: 20,
                color: trader.you ? "#00D4AA" : "#555"
              }}>{trader.score}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Network effects box */}
      <div style={{
        background: "#0d0d0d", border: "1px solid #1a1a1a",
        borderRadius: 12, padding: "16px", marginBottom: 14,
        animation: "fadeUp .5s ease .2s both"
      }}>
        <Mono style={{ fontSize: 9, color: "#555", letterSpacing: "0.12em", display: "block", marginBottom: 12 }}>
          DISCIPLINE AS SOCIAL CAPITAL
        </Mono>
        {[
          { icon: "🏦", label: "Prop firm applications", detail: "Share your score as proof of discipline" },
          { icon: "👥", label: "Managed account clients", detail: "90-day history builds trust instantly" },
          { icon: "🎓", label: "Trading community access", detail: "Top 10% score unlocks elite groups" },
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, padding: "10px 0",
            borderBottom: i < 2 ? "1px solid #1a1a1a" : "none",
            animation: `slideIn .3s ease ${i * 0.1}s both`
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
              <Mono style={{ fontSize: 10, color: "#555" }}>{item.detail}</Mono>
            </div>
          </div>
        ))}
      </div>

      {/* Investor note */}
      <div style={{
        padding: "14px 16px", background: "rgba(255,184,0,.05)",
        border: "1px solid rgba(255,184,0,.15)", borderRadius: 10,
        animation: "fadeUp .5s ease .4s both"
      }}>
        <Mono style={{ fontSize: 9, color: "#FFB800", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>
          THE NETWORK EFFECT
        </Mono>
        <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
          Every trader who joins invites their accountability partner. <strong style={{ color: "#f0f0f0" }}>Viral loop built into the core product.</strong> Discipline score becomes a career credential — creating lock-in that no other trading app has.
        </p>
      </div>
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("passport");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const current = SCREENS.find(s => s.id === screen);

  return (
    <div style={{ minHeight: "100vh", background: "#060608", maxWidth: 480, margin: "0 auto" }}>

      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 200,
        background: "rgba(6,6,8,.97)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid #1a1a1a", padding: "14px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%", background: "#00D4AA",
            animation: "pulse 2s infinite"
          }} />
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, letterSpacing: "0.1em", color: "#00D4AA" }}>
            TRADER&apos;S POD
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            background: "rgba(255,184,0,.1)", border: "1px solid rgba(255,184,0,.3)",
            borderRadius: 20, padding: "4px 10px"
          }}>
            <Mono style={{ fontSize: 9, color: "#FFB800", letterSpacing: "0.1em" }}>INVESTOR DEMO</Mono>
          </div>
        </div>
      </div>

      {/* Screen title */}
      <div style={{
        padding: "16px 18px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 11, color: "#555", letterSpacing: "0.15em" }}>
            FEATURE {SCREENS.findIndex(s => s.id === screen) + 1} OF {SCREENS.length}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 2 }}>
            {current.icon} {current.label}
          </div>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          background: "#111", border: "1px solid #1e1e1e", borderRadius: 8,
          padding: "8px 12px", color: "#555", cursor: "pointer",
          fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.08em"
        }}>
          {menuOpen ? "✕ Close" : "☰ Menu"}
        </button>
      </div>

      {/* Menu */}
      {menuOpen && (
        <div style={{
          margin: "12px 18px 0",
          background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 10,
          overflow: "hidden", animation: "fadeUp .25s ease both", zIndex: 100, position: "relative"
        }}>
          {SCREENS.map((s, i) => (
            <button key={s.id} onClick={() => { setScreen(s.id); setMenuOpen(false); }} style={{
              width: "100%", padding: "12px 16px",
              background: screen === s.id ? "rgba(0,212,170,.08)" : "transparent",
              border: "none", borderBottom: i < SCREENS.length - 1 ? "1px solid #1a1a1a" : "none",
              color: screen === s.id ? "#00D4AA" : "#888",
              display: "flex", alignItems: "center", gap: 12,
              cursor: "pointer", textAlign: "left", transition: "all .2s"
            }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ fontSize: 13, fontWeight: screen === s.id ? 700 : 400 }}>{s.label}</span>
              {screen === s.id && <span style={{ marginLeft: "auto", color: "#00D4AA", fontSize: 12 }}>◆</span>}
            </button>
          ))}
        </div>
      )}

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 6, padding: "14px 18px 16px", justifyContent: "center" }}>
        {SCREENS.map(s => (
          <button key={s.id} onClick={() => setScreen(s.id)} style={{
            width: screen === s.id ? 24 : 6, height: 6,
            borderRadius: 3, background: screen === s.id ? "#00D4AA" : "#1e1e1e",
            border: "none", cursor: "pointer", padding: 0,
            transition: "all .3s ease",
            boxShadow: screen === s.id ? "0 0 8px #00D4AA" : "none"
          }} />
        ))}
      </div>

      {/* Screen content */}
      <div style={{ padding: "0 18px" }} key={screen}>
        {screen === "passport" && <PassportScreen />}
        {screen === "ritual" && <RitualScreen />}
        {screen === "contract" && <ContractScreen />}
        {screen === "debrief" && <DebriefScreen />}
        {screen === "leaderboard" && <LeaderboardScreen />}
      </div>

      {/* Nav arrows */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(480px, 100vw)", background: "rgba(6,6,8,.97)",
        backdropFilter: "blur(16px)", borderTop: "1px solid #1a1a1a",
        padding: "12px 18px", display: "flex", gap: 10, zIndex: 200
      }}>
        <button onClick={() => {
          const idx = SCREENS.findIndex(s => s.id === screen);
          if (idx > 0) setScreen(SCREENS[idx - 1].id);
        }} style={{
          flex: 1, padding: "12px",
          background: "#111", border: "1px solid #1e1e1e", borderRadius: 8,
          color: "#555", fontFamily: "'DM Mono',monospace", fontSize: 11,
          cursor: "pointer", letterSpacing: "0.08em"
        }}>← Prev</button>
        <button onClick={() => {
          const idx = SCREENS.findIndex(s => s.id === screen);
          if (idx < SCREENS.length - 1) setScreen(SCREENS[idx + 1].id);
        }} style={{
          flex: 2, padding: "12px",
          background: "#00D4AA", border: "none", borderRadius: 8,
          color: "#000", fontFamily: "'DM Mono',monospace", fontSize: 11,
          cursor: "pointer", letterSpacing: "0.1em", fontWeight: 500, textTransform: "uppercase"
        }}>
          {SCREENS.findIndex(s => s.id === screen) < SCREENS.length - 1
            ? `Next: ${SCREENS[SCREENS.findIndex(s => s.id === screen) + 1].label} →`
            : "✓ End of Demo"}
        </button>
      </div>
    </div>
  );
}
