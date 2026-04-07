import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from "recharts";

const C = {
  bg: "#0D1117", card: "#161B22", cardAlt: "#1C2128", border: "#30363D",
  text: "#E6EDF3", muted: "#8B949E", dim: "#484F58",
  brick: "#EE3D2C", brickGlow: "rgba(238,61,44,0.15)", green: "#3FB950",
  yellow: "#D29922", blue: "#58A6FF",
};

const dbx = { employees: 13000, engPct: 49, revenue: 4.0, valuation: 155, avgRampMonths: 4.5, mgrHelpful90: 67, careerGrowthSat: 50, newHiresQtr: 1100, costPerEng: 185000 };
const growthData = [{ year: "2020", emp: 2000 },{ year: "2021", emp: 3200 },{ year: "2022", emp: 5000 },{ year: "2023", emp: 6500 },{ year: "2024", emp: 8200 },{ year: "2025", emp: 10500 },{ year: "2026", emp: 13000 }];
const rampByRole = [{ role: "Data Engineer", weeks: 18, target: 12 },{ role: "Solutions Arch.", weeks: 20, target: 12 },{ role: "Account Exec.", weeks: 14, target: 10 },{ role: "Product Manager", weeks: 16, target: 12 },{ role: "Corporate (Avg)", weeks: 12, target: 8 }];
const pillarData = [
  { name: "New Bricksters", score: 72, icon: "🚀", desc: "Onboarding is structured but event-based. 3–6 month ramp suggests gaps in continuous support." },
  { name: "Leaders", score: 55, icon: "👥", desc: "Only 67% of managers rated helpful at 90 days. Enablement is workshop-dependent, not embedded." },
  { name: "High-Potential", score: 40, icon: "⭐", desc: "Bespoke programs exist but lack AI-powered personalization and scalable infrastructure." },
  { name: "Career & Growth", score: 38, icon: "📈", desc: "50% feel supported in growth. No AI-driven career pathing or skills gap visualization." },
];

function Counter({ end, suffix = "", prefix = "", decimals = 0, duration = 1500 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { const s = performance.now(); const t = (n) => { const p = Math.min((n-s)/duration,1); setVal((1-Math.pow(1-p,3))*end); if(p<1) requestAnimationFrame(t); }; requestAnimationFrame(t); obs.disconnect(); } }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{prefix}{decimals ? val.toFixed(decimals) : Math.round(val)}{suffix}</span>;
}

const CTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (<div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 12 }}><div style={{ color: C.muted, marginBottom: 4 }}>{label}</div>{payload.map((p,i) => <div key={i} style={{ color: p.color || C.text }}>{p.name}: {typeof p.value==='number' ? p.value.toLocaleString() : p.value}</div>)}</div>);
};

function AICopilot() {
  const [msgs, setMsgs] = useState([{ role: "assistant", text: "Hi! I'm the Brickster Learning Copilot. I can help with onboarding questions, find learning resources, or recommend your next development step. Try one of the suggestions below, or ask me anything." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const presets = ["What should I learn in my first 30 days as a Data Engineer?", "How does Unity Catalog governance work?", "Who should I connect with on the Platform team?"];

  async function send(text) {
    const q = text || input; if (!q.trim()) return;
    setMsgs(m => [...m, { role: "user", text: q }]); setInput(""); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: "You are the Brickster Learning Copilot, an AI assistant for new Databricks employees. Help with onboarding, learning paths, team intros, and career development. Keep responses concise (2-4 sentences), warm, practical. Reference Databricks concepts: Unity Catalog, Delta Lake, Spark, MLflow, Lakehouse architecture, culture principles. If asked about people, make up realistic names/roles. End with a specific next action.", messages: [{ role: "user", content: q }] })
      });
      const data = await res.json();
      const reply = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "Having trouble connecting. Try again!";
      setMsgs(m => [...m, { role: "assistant", text: reply }]);
    } catch { setMsgs(m => [...m, { role: "assistant", text: "In production, I'd be connected to Databricks' Confluence, LMS, and org chart to give personalized answers. For now, try another question!" }]); }
    setLoading(false);
  }
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  return (
    <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${C.brick}, #ff6b5a)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
        <div><div style={{ fontSize: 14, fontWeight: 700 }}>Brickster Learning Copilot</div><div style={{ fontSize: 11, color: C.green }}>● Live — Powered by AI</div></div>
      </div>
      <div style={{ height: 300, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (<div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: 12, fontSize: 13, lineHeight: 1.55, background: m.role === "user" ? C.brick : C.cardAlt, color: m.role === "user" ? "#fff" : C.text, borderBottomRightRadius: m.role === "user" ? 4 : 12, borderBottomLeftRadius: m.role === "user" ? 12 : 4 }}>{m.text}</div></div>))}
        {loading && <div style={{ display: "flex", gap: 4, padding: 8 }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.muted, animation: `pulse 1s ${i*0.15}s infinite` }} />)}</div>}
        <div ref={endRef} />
      </div>
      <div style={{ padding: "8px 16px 12px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {presets.map((p, i) => (<button key={i} onClick={() => send(p)} style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 12px", fontSize: 11, color: C.muted, cursor: "pointer" }}>{p}</button>))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask the Copilot anything..." style={{ flex: 1, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", color: C.text, fontSize: 13, outline: "none" }} />
          <button onClick={() => send()} style={{ background: C.brick, border: "none", borderRadius: 10, padding: "0 18px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Send</button>
        </div>
      </div>
    </div>
  );
}

function ROICalc() {
  const [w, setW] = useState(4);
  const hpy = dbx.newHiresQtr * 4;
  const wc = dbx.costPerEng / 52;
  const pg = w * wc * 0.5;
  const ts = Math.round(pg * hpy * (dbx.engPct / 100));
  return (
    <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 11, color: C.brick, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>Interactive ROI Model</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>What's faster ramp time worth at Databricks' scale?</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>Based on ~{hpy.toLocaleString()} new hires/year, {dbx.engPct}% engineering, avg fully-loaded cost of ${(dbx.costPerEng/1000).toFixed(0)}K</div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 13 }}>Weeks of ramp time reduced</span><span style={{ fontSize: 28, fontWeight: 700, color: C.brick, fontFamily: "monospace" }}>{w}</span></div>
        <input type="range" min={1} max={10} value={w} onChange={e => setW(+e.target.value)} style={{ width: "100%", accentColor: C.brick }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.dim, marginTop: 4 }}><span>1 week</span><span>10 weeks</span></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[{ l: "Productivity Recovered / Hire", v: `$${Math.round(pg).toLocaleString()}`, c: C.green },{ l: "Eng Hires Impacted / Year", v: Math.round(hpy*dbx.engPct/100).toLocaleString(), c: C.blue },{ l: "Total Annual Impact", v: `$${(ts/1e6).toFixed(1)}M`, c: C.brick }].map((s,i) => (
          <div key={i} style={{ background: C.cardAlt, borderRadius: 12, padding: 16, textAlign: "center" }}><div style={{ fontSize: 26, fontWeight: 700, color: s.c, fontFamily: "monospace" }}>{s.v}</div><div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", marginTop: 4 }}>{s.l}</div></div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [sec, setSec] = useState("overview");
  const nav = [{ id: "overview", l: "The Opportunity" },{ id: "gap", l: "The Gap" },{ id: "solution", l: "The Solution" },{ id: "copilot", l: "AI Copilot Demo" },{ id: "roi", l: "ROI Model" }];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}@keyframes glow{0%,100%{box-shadow:0 0 20px ${C.brickGlow}}50%{box-shadow:0 0 40px ${C.brickGlow}}}input[type=range]{-webkit-appearance:none;background:${C.border};border-radius:4px;height:6px}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${C.brick};cursor:pointer}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}`}</style>

      <div style={{ position: "sticky", top: 0, zIndex: 100, background: `${C.bg}ee`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, background: C.brick, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, animation: "glow 3s infinite" }}>B</div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700 }}>Brickster Learning Copilot</span>
          </div>
          <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {nav.map(n => (<button key={n.id} onClick={() => setSec(n.id)} style={{ background: sec === n.id ? C.brickGlow : "transparent", color: sec === n.id ? C.brick : C.muted, border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>{n.l}</button>))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px", fontFamily: "'DM Sans',sans-serif" }}>
        {sec === "overview" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 11, color: C.brick, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, marginBottom: 8 }}>From Workshops to Workflows</div>
              <h1 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.15, marginBottom: 12 }}>Databricks is scaling faster<br/>than its learning systems</h1>
              <p style={{ fontSize: 15, color: C.muted, maxWidth: 580, margin: "0 auto" }}>13,000 Bricksters. 4,400+ new hires per year. The opportunity isn't better workshops. It's AI-native development infrastructure.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
              {[{ v: <Counter end={13} suffix="K"/>, l: "Employees", s: "6x growth in 5 years", c: C.brick },{ v: <Counter end={4} prefix="$" suffix="B" decimals={1}/>, l: "Revenue (2026)", s: "$155B valuation", c: C.green },{ v: <Counter end={4.5} suffix=" mo" decimals={1}/>, l: "Avg. Ramp Time", s: "3–6 months to productivity", c: C.yellow },{ v: <Counter end={4400} suffix="+"/>, l: "New Hires / Year", s: `${dbx.engPct}% engineering`, c: C.blue }].map((s,i) => (
                <div key={i} style={{ background: C.card, borderRadius: 14, padding: 20, border: `1px solid ${C.border}`, textAlign: "center", animation: `fadeUp 0.4s ${i*0.1}s both` }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: s.c, fontFamily: "'JetBrains Mono',monospace" }}>{s.v}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{s.l}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.s}</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.card, borderRadius: 14, padding: 20, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Headcount Growth (2020–2026)</div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={growthData}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.brick} stopOpacity={0.3}/><stop offset="100%" stopColor={C.brick} stopOpacity={0}/></linearGradient></defs>
                  <XAxis dataKey="year" tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.border }}/><YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.border }} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/><Tooltip content={<CTip/>}/>
                  <Area type="monotone" dataKey="emp" stroke={C.brick} strokeWidth={2.5} fill="url(#g)" name="Employees"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {sec === "gap" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ marginBottom: 28 }}><div style={{ fontSize: 11, color: C.brick, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, marginBottom: 8 }}>The Gap</div><h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Two signals that talent development needs to evolve</h2></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              {[{ n: "67%", l: "of employees say their manager was helpful during onboarding", c: C.yellow },{ n: "50%", l: "feel Databricks supports their continuous career growth", c: C.brick }].map((d,i) => (
                <div key={i} style={{ background: C.card, borderRadius: 14, padding: 24, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 44, fontWeight: 700, color: d.c, fontFamily: "'JetBrains Mono',monospace" }}>{d.n}</div>
                  <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{d.l}</div>
                  <div style={{ fontSize: 10, color: C.dim, marginTop: 6 }}>Source: Comparably (public employee data)</div>
                </div>
              ))}
            </div>
            <div style={{ background: C.card, borderRadius: 14, padding: 20, border: `1px solid ${C.border}`, marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Ramp Time by Role (current vs. target)</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={rampByRole} layout="vertical" margin={{ left: 110 }}>
                  <XAxis type="number" domain={[0,24]} tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.border }}/><YAxis type="category" dataKey="role" tick={{ fill: C.text, fontSize: 12 }} axisLine={false} width={110}/><Tooltip content={<CTip/>}/>
                  <Bar dataKey="weeks" radius={[0,6,6,0]} name="Current">{rampByRole.map((_,i) => <Cell key={i} fill={C.brick}/>)}</Bar>
                  <Bar dataKey="target" radius={[0,6,6,0]} name="Target" fillOpacity={0.3}>{rampByRole.map((_,i) => <Cell key={i} fill={C.green}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>TLD Pillar Readiness</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {pillarData.map((p,i) => (
                <div key={i} style={{ background: C.card, borderRadius: 14, padding: 18, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{p.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ position: "relative", height: 5, background: C.border, borderRadius: 3, marginBottom: 8 }}><div style={{ position: "absolute", height: "100%", borderRadius: 3, width: `${p.score}%`, background: p.score > 60 ? C.green : p.score > 45 ? C.yellow : C.brick }}/></div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sec === "solution" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ marginBottom: 28 }}><div style={{ fontSize: 11, color: C.brick, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, marginBottom: 8 }}>The Solution</div><h2 style={{ fontSize: 28, fontWeight: 700 }}>Three phases to AI-native talent development</h2></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {[
                { ph: "Phase 1", t: "AI-Enhanced Onboarding", w: "Weeks 1–12", c: C.brick, items: ["Personalized pathway engine by role/function/location", "AI assistant for real-time new hire support", "Automated check-ins at Day 7, 30, 60, 90", "Adoption analytics: completion, time-to-contribution"] },
                { ph: "Phase 2", t: "Manager Enablement Copilot", w: "Weeks 8–20", c: C.yellow, items: ["Manager AI copilot with just-in-time coaching", "Searchable, AI-indexed playbook library", "Pilot with 2–3 high-growth teams", "Connect ramp data to manager confidence"] },
                { ph: "Phase 3", t: "Agentic Career Pathways", w: "Weeks 16–30", c: C.green, items: ["AI-driven career navigation via skills gaps", "Proactive recommendations based on projects/goals", "Connect engagement to retention and mobility", "Scale across all four TLD pillars globally"] },
              ].map((p,i) => (
                <div key={i} style={{ background: C.card, borderRadius: 14, padding: 22, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 10, color: p.c, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 4 }}>{p.ph} · {p.w}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>{p.t}</div>
                  {p.items.map((it,j) => (<div key={j} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 12, color: C.muted, lineHeight: 1.45 }}><span style={{ color: p.c, flexShrink: 0 }}>→</span><span>{it}</span></div>))}
                </div>
              ))}
            </div>
          </div>
        )}

        {sec === "copilot" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ marginBottom: 20 }}><div style={{ fontSize: 11, color: C.brick, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, marginBottom: 8 }}>Live Demo</div><h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Meet the Brickster Learning Copilot</h2><p style={{ fontSize: 13, color: C.muted }}>This is a working AI assistant. Ask it anything a new Databricks employee would need to know.</p></div>
            <div style={{ maxWidth: 680 }}><AICopilot /></div>
          </div>
        )}

        {sec === "roi" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ marginBottom: 20 }}><div style={{ fontSize: 11, color: C.brick, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, marginBottom: 8 }}>Business Case</div><h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>The math on faster ramp time</h2><p style={{ fontSize: 13, color: C.muted }}>Drag the slider to model impact at Databricks' scale.</p></div>
            <div style={{ maxWidth: 680 }}><ROICalc /></div>
            <div style={{ marginTop: 28, background: C.card, borderRadius: 14, padding: 22, border: `1px solid ${C.brick}33`, maxWidth: 680 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Why I built this</div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>I'm Helena Cohee. I spent 5+ years at Netflix owning the onboarding program for 2,000+ new hires per year, building AI automation that cut manual work by 30%, and shipping a full-stack web app because the tool we needed didn't exist. I built this prototype to show what AI-enabled talent development could look like at Databricks — not as a pitch deck, but as a working system. Every data point is from public sources. The AI copilot is live. The ROI model uses real math.</p>
              <div style={{ marginTop: 12 }}><a href="https://helenacohee.github.io/portfolio/" style={{ background: C.brick, color: "#fff", padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none", display: "inline-block" }}>View My Portfolio →</a></div>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 40, paddingTop: 20, borderTop: `1px solid ${C.border}`, fontSize: 11, color: C.dim }}>Brickster Learning Copilot — Prototype by Helena Cohee · helenacohee.github.io/portfolio · All data sourced publicly</div>
      </div>
    </div>
  );
}
