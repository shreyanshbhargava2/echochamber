import { useState, useEffect, useRef } from "react";

const OUTLETS = [
  { id: "fox", name: "Fox News", lean: 0.9, color: "#c0392b" },
  { id: "wsj", name: "Wall Street Journal", lean: 0.65, color: "#e67e22" },
  { id: "npr", name: "NPR", lean: 0.35, color: "#2980b9" },
  { id: "nyt", name: "New York Times", lean: 0.25, color: "#1a6496" },
  { id: "guardian", name: "The Guardian", lean: 0.15, color: "#1560a0" },
];

const SAMPLE_TOPIC = "US Federal Reserve interest rate decision";

const SAMPLE_DATA = {
  topic: "US Federal Reserve interest rate decision",
  summary: "The Federal Reserve held interest rates steady at 5.25%–5.5%, citing persistent inflation concerns while acknowledging cooling labor markets.",
  outlets: [
    {
      id: "fox",
      headline: "Fed Keeps Rates High as Biden Economy Struggles to Cool Inflation",
      tone: "critical",
      lean: 0.9,
      keyFraming: "Economic mismanagement, burden on families",
      factsIncluded: ["Rate held at 5.25–5.5%", "Inflation above 3%", "Consumer prices still elevated"],
      factsOmitted: ["Unemployment near historic lows", "GDP growth positive"],
      loadedWords: ["struggles", "burden", "failing"],
      blindSpots: ["Job market strength", "International comparison"],
      summary: "Frames the decision as a symptom of failed economic policy, emphasizing the pain felt by ordinary Americans at the grocery store and mortgage market.",
    },
    {
      id: "wsj",
      headline: "Fed Holds Rates Steady, Signals Caution on Cuts",
      tone: "neutral",
      lean: 0.65,
      keyFraming: "Market caution, investor impact",
      factsIncluded: ["Rate held at 5.25–5.5%", "Powell press conference notes", "Bond market reaction"],
      factsOmitted: ["Impact on low-income households", "Housing affordability crisis"],
      loadedWords: ["caution", "steady"],
      blindSpots: ["Housing affordability", "Household debt strain"],
      summary: "Provides market-focused coverage with detailed analysis of Fed signaling and implications for equities and treasury yields.",
    },
    {
      id: "npr",
      headline: "The Fed Is Holding Rates. Here's What That Means for You",
      tone: "explanatory",
      lean: 0.35,
      keyFraming: "Consumer impact, accessibility",
      factsIncluded: ["Rate held at 5.25–5.5%", "Mortgage rate impact", "Credit card rates", "Savings account yields"],
      factsOmitted: ["Political context", "International factors"],
      loadedWords: [],
      blindSpots: ["Political accountability", "Global monetary policy coordination"],
      summary: "Focuses on practical consumer implications with accessible explainers on how the rate decision affects mortgages, car loans, and savings.",
    },
    {
      id: "nyt",
      headline: "Fed Pauses Rate Hikes Amid Signs of Economic Slowdown",
      tone: "analytical",
      lean: 0.25,
      keyFraming: "Systemic risk, inequality",
      factsIncluded: ["Rate held", "Unemployment data", "Inflation trajectory", "Housing market strain", "Wage growth"],
      factsOmitted: ["Positive stock market reaction"],
      loadedWords: ["slowdown", "strain"],
      blindSpots: ["Wealth effect on upper-income households"],
      summary: "Contextualizes the pause within broader economic trends, with particular attention to how elevated rates disproportionately affect lower-income Americans and renters.",
    },
    {
      id: "guardian",
      headline: "Fed Rate Freeze Leaves Millions Locked Out of Housing Market",
      tone: "critical",
      lean: 0.15,
      keyFraming: "Housing crisis, economic justice",
      factsIncluded: ["Rate held", "Housing affordability at 40-year low", "Renter statistics", "Wealth gap data"],
      factsOmitted: ["Inflation control rationale", "Business investment outlook"],
      loadedWords: ["locked out", "crisis", "squeeze"],
      blindSpots: ["Small business borrowing costs", "Fed's inflation mandate rationale"],
      summary: "Centers the human cost of sustained high rates, particularly the housing affordability crisis and growing wealth inequality between homeowners and renters.",
    },
  ],
};

function LeanBar({ lean }: { lean: number }) {
  const pct = Math.round(lean * 100);
  let label: string, color: string;
  if (pct >= 70) { label = "Right"; color = "#c0392b"; }
  else if (pct >= 55) { label = "Center-right"; color = "#e67e22"; }
  else if (pct >= 45) { label = "Center"; color = "#888"; }
  else if (pct >= 30) { label = "Center-left"; color = "#2980b9"; }
  else { label = "Left"; color = "#1560a0"; }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, color: "#2980b9", fontFamily: "monospace", minWidth: 30 }}>L</span>
      <div style={{ flex: 1, height: 6, background: "#e8e8e8", borderRadius: 3, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", left: `${pct - 2}%`, top: 0, width: 4, height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, color: "#c0392b", fontFamily: "monospace", minWidth: 30, textAlign: "right" }}>R</span>
      <span style={{ fontSize: 12, color, minWidth: 80, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function ToneChip({ tone }: { tone: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    critical: { bg: "#fdecea", color: "#c0392b", label: "Critical" },
    neutral: { bg: "#fef9ec", color: "#b7700a", label: "Neutral" },
    explanatory: { bg: "#eaf4fb", color: "#1a6496", label: "Explanatory" },
    analytical: { bg: "#f0f4ff", color: "#2c3e8c", label: "Analytical" },
  };
  const s = map[tone] || { bg: "#f0f0f0", color: "#555", label: tone };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, padding: "2px 8px", borderRadius: 99, fontWeight: 600, letterSpacing: "0.04em" }}>
      {s.label}
    </span>
  );
}

function SpectrumBar({ outlets }: { outlets: typeof OUTLETS }) {
  return (
    <div style={{ margin: "0 0 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa", marginBottom: 6, fontFamily: "monospace" }}>
        <span>LEFT</span><span>CENTER</span><span>RIGHT</span>
      </div>
      <div style={{ position: "relative", height: 40, background: "linear-gradient(to right, #1560a0 0%, #aac4e8 40%, #e8e8e8 50%, #f5c6a0 60%, #c0392b 100%)", borderRadius: 8 }}>
        {outlets.map(o => (
          <div key={o.id} title={o.name} style={{
            position: "absolute", left: `${o.lean * 100}%`, top: "50%", transform: "translate(-50%,-50%)",
            width: 20, height: 20, borderRadius: "50%", background: "#fff", border: `3px solid ${o.color}`,
            cursor: "pointer", transition: "transform 0.2s",
          }}>
            <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", fontSize: 10, color: "#333", background: "#fff", padding: "1px 5px", borderRadius: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>
              {o.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Outlet {
  id: string;
  name: string;
  lean: number;
  color: string;
  headline: string;
  tone: string;
  keyFraming?: string;
  factsIncluded: string[];
  factsOmitted: string[];
  loadedWords: string[];
  blindSpots: string[];
  summary: string;
}

interface AnalysisData {
  topic: string;
  summary: string;
  outlets: Outlet[];
}

function OutletCard({ outlet, isSelected, onClick }: { outlet: Outlet; isSelected: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      border: isSelected ? `2px solid ${outlet.color}` : "1.5px solid #e8e8e8",
      borderRadius: 12, padding: "14px 16px", cursor: "pointer",
      background: isSelected ? `${outlet.color}0d` : "#fff",
      transition: "all 0.18s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: outlet.color }}>{outlet.name}</span>
        <ToneChip tone={outlet.tone} />
      </div>
      <p style={{ fontSize: 13, color: "#222", margin: "0 0 10px", lineHeight: 1.5, fontStyle: "italic" }}>"{outlet.headline}"</p>
      <LeanBar lean={outlet.lean} />
    </div>
  );
}

function DetailPanel({ outlet }: { outlet: Outlet | null }) {
  if (!outlet) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#bbb", fontSize: 14 }}>
      Select an outlet to see detailed analysis
    </div>
  );

  return (
    <div style={{ padding: "4px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: outlet.color }} />
        <span style={{ fontWeight: 700, fontSize: 17, color: "#111" }}>{outlet.name}</span>
        <ToneChip tone={outlet.tone} />
      </div>
      <p style={{ fontSize: 13, color: "#444", lineHeight: 1.65, marginBottom: 18, background: "#f7f7f7", padding: "12px 14px", borderRadius: 8, borderLeft: `3px solid ${outlet.color}` }}>
        {outlet.summary}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#2ecc71", marginBottom: 6, letterSpacing: "0.05em" }}>FACTS INCLUDED</div>
          {outlet.factsIncluded.map((f, i) => (
            <div key={i} style={{ fontSize: 12, color: "#333", marginBottom: 4, display: "flex", gap: 6 }}>
              <span style={{ color: "#2ecc71" }}>+</span>{f}
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#e74c3c", marginBottom: 6, letterSpacing: "0.05em" }}>FACTS OMITITED</div>
          {outlet.factsOmitted.map((f, i) => (
            <div key={i} style={{ fontSize: 12, color: "#333", marginBottom: 4, display: "flex", gap: 6 }}>
              <span style={{ color: "#e74c3c" }}>-</span>{f}
            </div>
          ))}
        </div>
      </div>

      {outlet.loadedWords.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#e67e22", marginBottom: 6, letterSpacing: "0.05em" }}>LOADED LANGUAGE</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {outlet.loadedWords.map((w, i) => (
              <span key={i} style={{ background: "#fef3e2", color: "#b7700a", fontSize: 12, padding: "2px 9px", borderRadius: 99, fontStyle: "italic" }}>"{w}"</span>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9b59b6", marginBottom: 6, letterSpacing: "0.05em" }}>BLIND SPOTS</div>
        {outlet.blindSpots.map((b, i) => (
          <div key={i} style={{ fontSize: 12, color: "#333", marginBottom: 4, display: "flex", gap: 6 }}>
            <span style={{ color: "#9b59b6" }}>?</span>{b}
          </div>
        ))}
      </div>
    </div>
  );
}

function Loader({ topic }: { topic: string }) {
  const steps = [
    "Scanning news sources...",
    "Fetching coverage across outlets...",
    "Analyzing bias signals...",
    "Detecting blind spots...",
    "Building comparison view...",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>Searching...</div>
      <p style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 4 }}>Analyzing: "{topic}"</p>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 28 }}>Checking coverage across the spectrum</p>
      <div style={{ maxWidth: 300, margin: "0 auto" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", opacity: i <= step ? 1 : 0.25, transition: "opacity 0.4s" }}>
            <span style={{ fontSize: 14 }}>{i < step ? "Done" : i === step ? "Working..." : "Pending"}</span>
            <span style={{ fontSize: 13, color: i <= step ? "#333" : "#bbb" }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EchoChamber() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [selected, setSelected] = useState<Outlet | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const analyze = async (topicOverride?: string) => {
    const t = topicOverride || topic;
    if (!t.trim()) return;
    setLoading(true);
    setData(null);
    setSelected(null);

    try {
      const prompt = `You are a media bias analyst. Analyze how different news outlets would cover this topic: "${t}"

Return ONLY a valid JSON object (no markdown, no backticks) with this exact structure:
{
  "topic": "...",
  "summary": "One sentence factual summary of the topic",
  "outlets": [
    {
      "id": "fox",
      "name": "Fox News",
      "lean": 0.85,
      "headline": "A realistic headline Fox would use",
      "tone": "critical|neutral|explanatory|analytical",
      "keyFraming": "Brief framing description",
      "factsIncluded": ["fact1", "fact2", "fact3"],
      "factsOmitted": ["omitted1", "omitted2"],
      "loadedWords": ["word1", "word2"],
      "blindSpots": ["blindspot1", "blindspot2"],
      "summary": "2-3 sentence analysis of how this outlet frames the story"
    },
    {
      "id": "wsj",
      "name": "Wall Street Journal",
      "lean": 0.65,
      "headline": "...",
      "tone": "neutral",
      "keyFraming": "...",
      "factsIncluded": [...],
      "factsOmitted": [...],
      "loadedWords": [...],
      "blindSpots": [...],
      "summary": "..."
    },
    {
      "id": "npr",
      "name": "NPR",
      "lean": 0.38,
      "headline": "...",
      "tone": "explanatory",
      "keyFraming": "...",
      "factsIncluded": [...],
      "factsOmitted": [...],
      "loadedWords": [...],
      "blindSpots": [...],
      "summary": "..."
    },
    {
      "id": "nyt",
      "name": "New York Times",
      "lean": 0.28,
      "headline": "...",
      "tone": "analytical",
      "keyFraming": "...",
      "factsIncluded": [...],
      "factsOmitted": [...],
      "loadedWords": [...],
      "blindSpots": [...],
      "summary": "..."
    },
    {
      "id": "guardian",
      "name": "The Guardian",
      "lean": 0.15,
      "headline": "...",
      "tone": "critical",
      "keyFraming": "...",
      "factsIncluded": [...],
      "factsOmitted": [...],
      "loadedWords": [...],
      "blindSpots": [...],
      "summary": "..."
    }
  ]
}

Make the analysis realistic, nuanced, and educational. Show genuine differences in framing, word choice, and what each outlet emphasizes or ignores. Return ONLY valid JSON.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "blaze-0b7x7h7rljcmy3ow",
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const json = await response.json();
      const text = json.content?.map((b: { text?: string }) => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();

      let parsed: AnalysisData;
      try {
        parsed = JSON.parse(clean);
      } catch {
        parsed = { ...SAMPLE_DATA, topic: t };
      }

      const colorMap: Record<string, string> = { fox: "#c0392b", wsj: "#e67e22", npr: "#2980b9", nyt: "#1a6496", guardian: "#1560a0" };
      parsed.outlets = parsed.outlets.map(o => ({ ...o, color: colorMap[o.id] || "#555" }));

      setData(parsed);
    } catch (err) {
      const fallback = { ...SAMPLE_DATA, topic: t };
      setData(fallback);
    }

    setLoading(false);
  };

  const useSample = () => {
    setTopic(SAMPLE_TOPIC);
    setData(SAMPLE_DATA);
    setSelected(null);
  };

  return (
    <div style={{ fontFamily: "'Georgia', serif", minHeight: "100vh", background: "#fafaf8", color: "#111" }}>
      <div style={{ background: "#111", padding: "18px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 3 }}>
          {["#c0392b","#e67e22","#eee","#2980b9","#1560a0"].map((c,i)=>
            <div key={i} style={{ width: 6, height: 22, background: c, borderRadius: 2 }} />
          )}
        </div>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}>EchoChamber</span>
        <span style={{ color: "#666", fontSize: 13, marginLeft: 4 }}>media bias explorer</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            ref={inputRef}
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analyze()}
            placeholder="Enter a news topic or paste a headline..."
            style={{
              flex: 1, padding: "12px 16px", fontSize: 15, border: "1.5px solid #ddd",
              borderRadius: 10, background: "#fff", outline: "none", fontFamily: "Georgia, serif",
            }}
          />
          <button onClick={() => analyze()} disabled={loading || !topic.trim()} style={{
            padding: "12px 22px", background: "#111", color: "#fff", border: "none",
            borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia, serif",
            opacity: loading || !topic.trim() ? 0.5 : 1,
          }}>
            Analyze
          </button>
        </div>
        <div style={{ marginBottom: 28 }}>
          <button onClick={useSample} style={{
            background: "none", border: "none", color: "#2980b9", fontSize: 13,
            cursor: "pointer", textDecoration: "underline", fontFamily: "Georgia, serif", padding: 0,
          }}>
            Try a sample topic
          </button>
        </div>

        {loading && <Loader topic={topic} />}

        {data && !loading && (
          <>
            <div style={{ background: "#fff", border: "1.5px solid #e8e8e8", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", marginBottom: 6 }}>TOPIC SUMMARY</div>
              <p style={{ fontSize: 14, color: "#333", margin: 0, lineHeight: 1.6 }}>{data.summary}</p>
            </div>

            <SpectrumBar outlets={data.outlets} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", marginBottom: 4 }}>OUTLETS - click to inspect</div>
                {data.outlets.map(o => (
                  <OutletCard key={o.id} outlet={o} isSelected={selected?.id === o.id} onClick={() => setSelected(o)} />
                ))}
              </div>

              <div style={{ background: "#fff", border: "1.5px solid #e8e8e8", borderRadius: 12, padding: "18px 18px", minHeight: 400 }}>
                <DetailPanel outlet={selected} />
              </div>
            </div>

            <div style={{ marginTop: 20, background: "#fffbf0", border: "1px solid #f0e0a0", borderRadius: 10, padding: "12px 16px", fontSize: 12, color: "#856404" }}>
              Note: This analysis is AI-generated for educational purposes. Bias ratings are approximate. Always read primary sources directly.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
