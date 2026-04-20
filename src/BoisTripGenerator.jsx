import React, { useState, useEffect } from "react";

// ============================================================
// BOIS TRIP GENERATOR — 90's Modern Vibe (LLM-powered)
// ============================================================

const BOIS = [
  { id: "mark", name: "MARK", emoji: "😎", color: "#FF2E93", tag: "the planner", home: "Seattle, WA" },
  { id: "wes", name: "WES", emoji: "🤘", color: "#00E5FF", tag: "the wildcard", home: "Washington, DC" },
  { id: "corbin", name: "CORBIN", emoji: "🕶️", color: "#B5FF1A", tag: "the chill one", home: "Seattle, WA" },
  { id: "other", name: "+ ADD", emoji: "👤", color: "#FFB800", tag: "extra boi", home: null },
];

const TRIP_TYPES = [
  { id: "roadtrip", label: "ROAD TRIP", icon: "🚗", desc: "windows down, snacks loaded" },
  { id: "city", label: "CITY ESCAPE", icon: "🏙️", desc: "neon nights, no sleep" },
  { id: "outdoors", label: "OUTDOORS", icon: "🏔️", desc: "into the wild" },
  { id: "beach", label: "BEACH", icon: "🌊", desc: "sand, sun, sunburn" },
  { id: "international", label: "INTERNATIONAL", icon: "✈️", desc: "passports out" },
  { id: "festival", label: "FESTIVAL", icon: "🎪", desc: "wristband season" },
];

const DURATIONS = [
  { id: "night", label: "ONE NIGHT", days: 1, desc: "blink and gone" },
  { id: "weekend", label: "WEEKEND", days: 3, desc: "fri-sun classic" },
  { id: "longweekend", label: "LONG WEEKEND", days: 4, desc: "thurs-sun stretch" },
  { id: "week", label: "FULL WEEK", days: 7, desc: "full send" },
  { id: "extended", label: "10+ DAYS", days: 12, desc: "out of office" },
];

const BUDGETS = [
  { id: "broke", label: "BROKE BOIS", icon: "💸", desc: "ramen + couch surfing", level: 1, perPerson: "under $500" },
  { id: "modest", label: "REASONABLE", icon: "💵", desc: "splurge on one thing", level: 2, perPerson: "$500–$1,500" },
  { id: "treat", label: "TREAT YOURSELF", icon: "💳", desc: "no real limits", level: 3, perPerson: "$1,500–$4,000" },
  { id: "luxe", label: "MONEY NO OBJECT", icon: "💎", desc: "private jet energy", level: 4, perPerson: "$4,000+" },
];

const VIBES = [
  { id: "crazy", label: "CRAZY", icon: "🔥", desc: "stories you can't tell mom" },
  { id: "gaming", label: "GAMING", icon: "🎮", desc: "screens, snacks, sleep no" },
  { id: "music", label: "MUSIC", icon: "🎧", desc: "live shows + late nights" },
  { id: "fun", label: "FUN", icon: "🎉", desc: "yes to everything" },
  { id: "relaxing", label: "RELAXING", icon: "🧘", desc: "actual decompression" },
];

const MONTHS = [
  { id: 1, short: "JAN", full: "January" },
  { id: 2, short: "FEB", full: "February" },
  { id: 3, short: "MAR", full: "March" },
  { id: 4, short: "APR", full: "April" },
  { id: 5, short: "MAY", full: "May" },
  { id: 6, short: "JUN", full: "June" },
  { id: 7, short: "JUL", full: "July" },
  { id: 8, short: "AUG", full: "August" },
  { id: 9, short: "SEP", full: "September" },
  { id: 10, short: "OCT", full: "October" },
  { id: 11, short: "NOV", full: "November" },
  { id: 12, short: "DEC", full: "December" },
];

const PALETTE = {
  pink: "#FF2E93",
  cyan: "#00E5FF",
  lime: "#B5FF1A",
  orange: "#FF6B1A",
  yellow: "#FFD600",
  purple: "#9D4EDD",
  black: "#0A0A0F",
  cream: "#FFF8E7",
};

const fontStyles = `
@import url('https://fonts.googleapis.com/css2?family=Bowlby+One&family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap');
`;

// ============================================================
// LLM RECOMMENDATION ENGINE
// ============================================================

async function generateRecommendations(prefs, useWebSearch = true, onProgress = null) {
  const boisCount = prefs.bois.length;
  const boisList = prefs.bois.map(b => `${b.name} (lives in ${b.home})`).join(", ");

  // Group bois by city to identify clusters and travel logistics
  const cityGroups = {};
  prefs.bois.forEach(b => {
    if (!cityGroups[b.home]) cityGroups[b.home] = [];
    cityGroups[b.home].push(b.name);
  });
  const cityClusterText = Object.entries(cityGroups)
    .map(([city, names]) => `${names.length} from ${city} (${names.join(", ")})`)
    .join("; ");

  // Build date window text
  let dateText = "Flexible, any time of year";
  if (prefs.months && prefs.months.length > 0) {
    const monthNames = prefs.months.map(m => MONTHS.find(mm => mm.id === m).full);
    if (monthNames.length === 1) {
      dateText = `${monthNames[0]}`;
    } else {
      dateText = `${monthNames.join(" or ")} (trip will happen in one of these months)`;
    }
  }

  const prompt = `You are the trip-planning oracle for a group of friends called "the bois." Generate 4 specific, real travel destinations tailored to this group.

THE BOIS:
- Group: ${boisList} (${boisCount} ${boisCount === 1 ? "person" : "people"} total)
- Home city breakdown: ${cityClusterText}
- Trip type: ${prefs.tripType.label} (${prefs.tripType.desc})
- Duration: ${prefs.duration.label} (${prefs.duration.days} days)
- Target travel window: ${dateText}
- Budget: ${prefs.budget.label} — roughly ${prefs.budget.perPerson} per person (THIS INCLUDES FLIGHTS)
- Vibe: ${prefs.vibe.label} — ${prefs.vibe.desc}

🚨 CRITICAL — TRAVEL LOGISTICS:
The bois live in different cities, and getting everyone to the destination is a real cost and time factor. You MUST factor this in:

1. **Cluster awareness**: When most bois live in one city (e.g., 2 of 3 in Seattle), recommendations should heavily favor:
   - Destinations close to or driveable from that city's cluster
   - The PNW (Seattle, Portland, Vancouver BC, Bend, Spokane, Olympic Peninsula, San Juans, Whistler, Cascades, Oregon coast, Idaho)
   - West coast cities reachable by short cheap flights from Seattle (LA, SF, Vegas, Phoenix, Denver, Salt Lake City, San Diego)
   - This minimizes total flight cost (3 flights vs 1) and travel time
2. **Meet-in-the-middle picks**: For groups split across coasts (e.g., Seattle + DC), at least 1-2 picks should be central US cities that work for everyone:
   - Denver, Austin, Chicago, Nashville, New Orleans, Las Vegas, Mexico City, Salt Lake City
   - Or roughly equidistant fly-in destinations
3. **Avoid bad geometry**: Don't recommend the East Coast for a Seattle-heavy group unless it's a genuinely worth-it destination AND the budget is high. Don't recommend remote international destinations for short/cheap trips when the long flight eats into trip time.
4. **Budget reality**: For ${prefs.budget.label} (~${prefs.budget.perPerson}/person all-in), each leg of flight matters. Cheap budget = stay regional. Big budget = world is open.
5. **Duration vs flight time**: Don't recommend long-haul international destinations for trips under 5 days — too much time in transit.

📅 SEASONAL/DATE FIT (IMPORTANT):
Travel window: ${dateText}. This heavily influences what you recommend:
- Match destinations to their best season. Don't recommend PNW mountain trips in Jan/Feb unless it's specifically for skiing/winter vibes. Don't recommend desert destinations (Vegas, Joshua Tree, Phoenix) for Jul/Aug (brutal heat). Beach destinations should fit the month's water temp + weather.
- Surface any specific events, festivals, or seasonal happenings that would be active during those months — that's a huge reason to pick a destination at a particular time.
- If the window is flexible, you can recommend anything but mention the best time to go.

🏡 ACCOMMODATIONS — COOL AIRBNB/UNIQUE STAYS MATTER:
The bois care a lot about where they stay — sometimes that's the whole reason for picking a destination. For EACH recommendation, provide TWO accommodation options:
1. A solid **hotel or neighborhood** pick (traditional lodging)
2. A **cool/unique Airbnb-style stay** — specific enough to be findable. Examples: "Desert dome in Joshua Tree", "A-frame cabin in the Cascades", "Converted warehouse loft in Wynwood", "Mid-century pool house in Palm Springs", "Treehouse near Hood River", "Catskills Scandinavian cabin with outdoor tub", "Oceanfront yurt on the Oregon coast", "Nob Hill Victorian", "Joshua Tree hacienda with telescope". These can be specific known spots or well-described types that'd be easy to search on Airbnb. Make them cool — unique architecture, great location, or standout features.

OTHER REQUIREMENTS:
1. Recommend 4 REAL, SPECIFIC destinations (cities, regions, parks, festivals — not generic categories).
2. Each destination must genuinely fit ALL the criteria above. Do not recommend something out of budget or wrong duration or wrong season.
3. Mix obvious picks with at least one less-expected choice.
4. ${useWebSearch ? "Use web search to verify current info — events happening during the target travel window, what's actually open, current vibe of the place. Mention specific upcoming events, festivals, or seasonal happenings if relevant." : "Use your knowledge to pick destinations."}
5. Make the writing fun, casual, and bro-y but not cringy. Talk like a friend who travels a lot.
6. Reference the bois by name when it makes sense (e.g., "Mark would love..."). When relevant, acknowledge the travel angle naturally ("easy drive for the Seattle crew, quick flight for Wes").

Return ONLY valid JSON in this exact format (no markdown, no preamble, no code fences):
{
  "recommendations": [
    {
      "name": "Destination name",
      "region": "City, State/Country",
      "emoji": "single relevant emoji",
      "blurb": "2-3 sentence punchy description of why this place fits this specific group and trip",
      "travel": "1 sentence on how the bois get there from their home cities (e.g., '3hr drive for the Seattle bois, 5hr flight for Wes from DC' or 'cheap direct flights for everyone, ~3-4hrs from both coasts')",
      "activities": ["specific activity 1", "specific activity 2", "specific activity 3", "specific activity 4"],
      "stay": "Specific hotel or neighborhood pick",
      "coolStay": "A specific cool/unique Airbnb-style stay — describe it vividly so it's searchable (e.g. 'Mid-century desert dome with plunge pool in Joshua Tree' or 'A-frame cabin with hot tub in the Cascades, 2hrs from Seattle')",
      "moment": "One vivid 'signature moment' the bois will remember — written as a single evocative sentence",
      "currentEvent": "Optional: a specific upcoming event/festival/seasonal thing happening during the target travel window. Leave empty string if none."
    }
  ]
}

Return exactly 4 recommendations. Order them best-fit first, factoring in travel logistics, seasonal fit, and overall vibe match.

🚨 FORMAT RULES (STRICT):
- Output ONLY the JSON object. No preamble like "Here are..." or "Sure!".
- No comments, no trailing text, no markdown code fences, no explanation after the JSON.
- The first character of your response must be { and the last must be }.
- All strings must be valid JSON strings (escape any double quotes inside strings with \\").
- Do not add trailing commas.`;

  const requestBody = {
    model: "claude-haiku-4-5",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  };

  if (useWebSearch) {
    requestBody.tools = [{ type: "web_search_20250305", name: "web_search" }];
  }

  // In production this hits our /api/generate Edge function (which proxies
  // to Anthropic with streaming + our secret key).
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`API error ${response.status}: ${errText.slice(0, 200)}`);
  }

  // Parse Server-Sent Events stream from Anthropic, accumulating text chunks.
  // Anthropic's streaming format sends events like:
  //   event: content_block_delta
  //   data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"..."}}
  //
  // We concatenate all text_delta pieces into a full response string.
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";
  let charCount = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by double-newline
    const events = buffer.split("\n\n");
    buffer = events.pop() || ""; // last piece may be incomplete

    for (const evt of events) {
      const lines = evt.split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (!data || data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
            fullText += parsed.delta.text;
            charCount += parsed.delta.text.length;
            if (onProgress) onProgress(charCount, fullText);
          }
        } catch (e) {
          // Ignore malformed fragments — common during stream boundaries
        }
      }
    }
  }

  const cleaned = fullText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Extract the outermost JSON object by tracking brace depth.
  // This is more reliable than regex because small models (Haiku) sometimes
  // append stray text or comments after the final } which breaks JSON.parse.
  const extractJSON = (text) => {
    const start = text.indexOf("{");
    if (start === -1) return null;
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) return text.slice(start, i + 1);
      }
    }
    // If we got here, JSON was truncated — try closing with stubs
    return null;
  };

  let jsonStr = extractJSON(cleaned);

  if (!jsonStr) {
    // Last-resort repair: strip incomplete trailing object/array entries and close brackets
    let repaired = cleaned.slice(cleaned.indexOf("{"));
    // Chop at the last complete closing `}` of what looks like a rec entry
    const lastCompleteObj = repaired.lastIndexOf('"},');
    if (lastCompleteObj !== -1) {
      repaired = repaired.slice(0, lastCompleteObj + 2) + "]}";
      jsonStr = extractJSON(repaired);
    }
  }

  if (!jsonStr) {
    console.error("Raw response that failed to parse:", fullText.slice(0, 500));
    throw new Error("Response was malformed JSON. Try again — small models occasionally flub the format.");
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    console.error("JSON parse failed on:", jsonStr.slice(0, 500));
    throw new Error("Response couldn't be parsed. Try again.");
  }

  const recs = parsed.recommendations || [];
  if (recs.length === 0) {
    throw new Error("Got a valid response but no recommendations in it. Try again.");
  }
  return recs;
}

// ============================================================
// UI HELPERS
// ============================================================

const Squiggle = ({ color = "#000", className = "" }) => (
  <svg className={className} viewBox="0 0 100 12" preserveAspectRatio="none" style={{ width: "100%", height: "12px" }}>
    <path d="M0,6 Q12.5,0 25,6 T50,6 T75,6 T100,6" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const StarBurst = ({ color = "#000", size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <path d="M20,2 L23,15 L36,12 L26,21 L36,30 L23,27 L20,40 L17,27 L4,30 L14,21 L4,12 L17,15 Z" fill={color} />
  </svg>
);

// ============================================================
// MAIN APP
// ============================================================

export default function BoisTripGenerator() {
  const [step, setStep] = useState(0);
  const [selectedBois, setSelectedBois] = useState([]);
  const [otherName, setOtherName] = useState("");
  const [otherCity, setOtherCity] = useState("");
  const [tripType, setTripType] = useState(null);
  const [duration, setDuration] = useState(null);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [budget, setBudget] = useState(null);
  const [vibe, setVibe] = useState(null);
  const [useSearch, setUseSearch] = useState(true);
  const [recs, setRecs] = useState([]);
  const [loadingText, setLoadingText] = useState("");
  const [progressChars, setProgressChars] = useState(0);
  const [error, setError] = useState(null);

  // Dynamically load html-to-image for share-as-image feature
  // (much better modern CSS support than html2canvas, which garbles colors)
  useEffect(() => {
    if (typeof window === "undefined" || window.htmlToImage) return;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // On mount, check URL hash for a shared plan to remix
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash && hash.startsWith("#plan=")) {
      try {
        const encoded = hash.slice(6);
        // Unicode-safe base64 decode
        const decoded = JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(encoded)))));
        if (decoded.bois) setSelectedBois(decoded.bois);
        if (decoded.otherName) setOtherName(decoded.otherName);
        if (decoded.otherCity) setOtherCity(decoded.otherCity);
        if (decoded.tripType) setTripType(decoded.tripType);
        if (decoded.duration) setDuration(decoded.duration);
        if (decoded.months) setSelectedMonths(decoded.months);
        if (decoded.budget) setBudget(decoded.budget);
        if (decoded.vibe) setVibe(decoded.vibe);
        setStep(1); // Start from first step so user can see & edit
      } catch (e) {
        console.warn("Could not decode shared plan:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (step !== 7) return;

    const baseLoadingMessages = [
      "Polling the bois...",
      "Calculating chaos potential...",
      "Reading group chat history...",
      "Asking Claude for hot takes...",
    ];
    const searchLoadingMessages = [
      "Searching the web for events...",
      "Cross-referencing the vibes...",
      "Finding what's actually happening...",
      "Pre-planning the recovery day...",
      "Finalizing the picks...",
    ];

    const messages = useSearch
      ? [...baseLoadingMessages, ...searchLoadingMessages]
      : baseLoadingMessages;

    let i = 0;
    setLoadingText(messages[0]);
    const interval = setInterval(() => {
      i++;
      if (i < messages.length) {
        setLoadingText(messages[i]);
      }
    }, useSearch ? 3500 : 1200);

    const prefs = {
      bois: selectedBois.map(b => {
        if (b === "other") {
          return { name: otherName.trim(), home: otherCity.trim() || "Unknown" };
        }
        const boi = BOIS.find(x => x.id === b);
        return { name: boi.name, home: boi.home };
      }),
      tripType: TRIP_TYPES.find(t => t.id === tripType),
      duration: DURATIONS.find(d => d.id === duration),
      months: selectedMonths,
      budget: BUDGETS.find(b => b.id === budget),
      vibe: VIBES.find(v => v.id === vibe),
    };

    setProgressChars(0);
    generateRecommendations(prefs, useSearch, (chars) => setProgressChars(chars))
      .then(results => {
        clearInterval(interval);
        setLoadingText("DONE.");
        setTimeout(() => {
          setRecs(results);
          setStep(8);
        }, 400);
      })
      .catch(err => {
        clearInterval(interval);
        console.error(err);
        setError(err.message || "Something broke. Try again?");
        setStep(9);
      });

    return () => clearInterval(interval);
  }, [step, useSearch, selectedBois, otherName, otherCity, tripType, duration, selectedMonths, budget, vibe]);

  const reset = () => {
    setStep(0);
    setSelectedBois([]);
    setOtherName("");
    setOtherCity("");
    setTripType(null);
    setDuration(null);
    setSelectedMonths([]);
    setBudget(null);
    setVibe(null);
    setRecs([]);
    setError(null);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  const reroll = () => {
    setError(null);
    setStep(7);
  };

  const remix = () => {
    // Go back to step 1 with all choices intact so the user can tweak any input
    setError(null);
    setRecs([]);
    setStep(1);
  };

  const toggleBoi = (id) => {
    setSelectedBois(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const canProceed = {
    1: selectedBois.length > 0 && (!selectedBois.includes("other") || (otherName.trim().length > 0 && otherCity.trim().length > 0)),
    2: tripType !== null,
    3: duration !== null,
    4: true, // month selection is optional — empty = flexible
    5: budget !== null,
    6: vibe !== null,
  };

  const StepWrapper = ({ children, title, subtitle, stepNum, accentColor = PALETTE.pink }) => (
    <div style={{ position: "relative", padding: "20px 18px 140px", minHeight: "100vh" }}>
      <Header step={step} accentColor={accentColor} />
      <div style={{ marginTop: 24 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2, color: PALETTE.black, opacity: 0.6, marginBottom: 6 }}>
          STEP {stepNum} / 6
        </div>
        <h1 style={{ fontFamily: "'Bowlby One', sans-serif", fontSize: 38, lineHeight: 0.95, color: PALETTE.black, margin: 0, letterSpacing: "-0.01em" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: PALETTE.black, opacity: 0.7, marginTop: 10, lineHeight: 1.4 }}>
            {subtitle}
          </p>
        )}
        <div style={{ marginTop: 12, marginBottom: 24, width: 80 }}>
          <Squiggle color={accentColor} />
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: PALETTE.cream, position: "relative", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{fontStyles}</style>
      <style>{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; padding: 0; }
        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slidein {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .pop { animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .slidein { animation: slidein 0.5s ease-out both; }
        .float { animation: float 3s ease-in-out infinite; }
        .pulse { animation: pulse 1.4s ease-in-out infinite; }
        .neo-shadow { box-shadow: 4px 4px 0 ${PALETTE.black}; }
        .neo-shadow-lg { box-shadow: 6px 6px 0 ${PALETTE.black}; }
        .neo-shadow-xl { box-shadow: 8px 8px 0 ${PALETTE.black}; }
        .neo-card {
          border: 2.5px solid ${PALETTE.black};
          background: white;
          transition: all 0.15s ease;
        }
        .neo-card:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 ${PALETTE.black};
        }
      `}</style>

      <div aria-hidden style={{
        position: "fixed", inset: 0,
        backgroundImage: `linear-gradient(${PALETTE.black}08 1px, transparent 1px), linear-gradient(90deg, ${PALETTE.black}08 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        pointerEvents: "none", zIndex: 0,
      }} />

      {step !== 7 && step !== 0 && step !== 9 && (
        <>
          <div aria-hidden style={{ position: "fixed", top: 100, right: -20, opacity: 0.4, zIndex: 0 }} className="float">
            <StarBurst color={PALETTE.yellow} size={60} />
          </div>
          <div aria-hidden style={{ position: "fixed", bottom: 200, left: -10, opacity: 0.3, zIndex: 0 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: PALETTE.cyan, border: `3px solid ${PALETTE.black}` }} />
          </div>
        </>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto" }}>
        {step === 0 && <IntroScreen onStart={() => setStep(1)} />}
        {step === 1 && (
          <StepWrapper title="WHO'S COMING?" subtitle="pick your bois — multi-select" stepNum={1} accentColor={PALETTE.pink}>
            <BoisStep selected={selectedBois} onToggle={toggleBoi} otherName={otherName} setOtherName={setOtherName} otherCity={otherCity} setOtherCity={setOtherCity} />
          </StepWrapper>
        )}
        {step === 2 && (
          <StepWrapper title="WHAT'S THE MOVE?" subtitle="what kinda trip are we talking" stepNum={2} accentColor={PALETTE.cyan}>
            <TripTypeStep selected={tripType} onSelect={setTripType} />
          </StepWrapper>
        )}
        {step === 3 && (
          <StepWrapper title="HOW LONG?" subtitle="time off the grid" stepNum={3} accentColor={PALETTE.lime}>
            <DurationStep selected={duration} onSelect={setDuration} />
          </StepWrapper>
        )}
        {step === 4 && (
          <StepWrapper title="WHEN?" subtitle="pick months — multi-select for flexibility" stepNum={4} accentColor={PALETTE.yellow}>
            <MonthsStep selected={selectedMonths} onToggle={(m) => setSelectedMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])} onClear={() => setSelectedMonths([])} />
          </StepWrapper>
        )}
        {step === 5 && (
          <StepWrapper title="WHAT'S THE BUDGET?" subtitle="real talk — how loaded are we" stepNum={5} accentColor={PALETTE.orange}>
            <BudgetStep selected={budget} onSelect={setBudget} />
          </StepWrapper>
        )}
        {step === 6 && (
          <StepWrapper title="PICK A VIBE." subtitle="last one. choose wisely." stepNum={6} accentColor={PALETTE.purple}>
            <VibeStep selected={vibe} onSelect={setVibe} useSearch={useSearch} setUseSearch={setUseSearch} />
          </StepWrapper>
        )}
        {step === 7 && <LoadingScreen text={loadingText} useSearch={useSearch} progressChars={progressChars} />}
        {step === 8 && (
          <ResultsScreen
            recs={recs}
            prefs={{
              bois: selectedBois.map(b => {
                if (b === "other") return { name: otherName.toUpperCase(), home: otherCity || "?" };
                const boi = BOIS.find(x => x.id === b);
                return { name: boi.name, home: boi.home };
              }),
              tripType: TRIP_TYPES.find(t => t.id === tripType),
              duration: DURATIONS.find(d => d.id === duration),
              months: selectedMonths,
              budget: BUDGETS.find(b => b.id === budget),
              vibe: VIBES.find(v => v.id === vibe),
            }}
            shareState={{
              bois: selectedBois,
              otherName,
              otherCity,
              tripType,
              duration,
              months: selectedMonths,
              budget,
              vibe,
            }}
            onReroll={reroll}
            onRemix={remix}
            onReset={reset}
          />
        )}
        {step === 9 && <ErrorScreen error={error} onRetry={reroll} onReset={reset} />}
      </div>

      {step >= 1 && step <= 6 && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "16px 18px 24px",
          background: `linear-gradient(to top, ${PALETTE.cream} 60%, transparent)`,
          zIndex: 10,
        }}>
          <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", gap: 10 }}>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="neo-card neo-shadow"
                style={{
                  padding: "16px 18px",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 13, fontWeight: 700, letterSpacing: 1,
                  background: "white", color: PALETTE.black,
                }}
              >
                ← BACK
              </button>
            )}
            <button
              onClick={() => canProceed[step] && setStep(step + 1)}
              disabled={!canProceed[step]}
              className="neo-card neo-shadow-lg"
              style={{
                flex: 1,
                padding: "18px 20px",
                fontFamily: "'Bowlby One', sans-serif",
                fontSize: 18, letterSpacing: 1,
                background: canProceed[step] ? PALETTE.black : "#C8C2B0",
                color: canProceed[step] ? PALETTE.lime : "#7a7a7a",
                opacity: canProceed[step] ? 1 : 0.7,
              }}
            >
              {step === 6 ? "GENERATE →" : "NEXT →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// HEADER
// ============================================================

function Header({ step, accentColor }) {
  const progress = Math.min(step, 5) / 5;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 36, height: 36,
        background: accentColor,
        border: `2.5px solid ${PALETTE.black}`,
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `3px 3px 0 ${PALETTE.black}`,
      }}>
        <span style={{ fontFamily: "'Bowlby One', sans-serif", fontSize: 16 }}>B</span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 2, opacity: 0.6 }}>
          BOIS.TRIP / v3.0 ⚡
        </div>
        <div style={{
          height: 8, background: "white",
          border: `2px solid ${PALETTE.black}`,
          marginTop: 4, position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            width: `${progress * 100}%`,
            background: accentColor,
            transition: "width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INTRO SCREEN
// ============================================================

function IntroScreen({ onStart }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
      padding: "40px 24px",
      position: "relative",
    }}>
      <div aria-hidden style={{ position: "absolute", top: 60, left: 30 }} className="float">
        <StarBurst color={PALETTE.pink} size={50} />
      </div>
      <div aria-hidden style={{ position: "absolute", top: 120, right: 20 }} className="float">
        <div style={{ width: 50, height: 50, background: PALETTE.cyan, border: `3px solid ${PALETTE.black}`, transform: "rotate(15deg)" }} />
      </div>
      <div aria-hidden style={{ position: "absolute", bottom: 180, left: 20 }} className="float">
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: PALETTE.lime, border: `3px solid ${PALETTE.black}` }} />
      </div>
      <div aria-hidden style={{ position: "absolute", bottom: 120, right: 40 }} className="float">
        <StarBurst color={PALETTE.orange} size={40} />
      </div>

      <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11, letterSpacing: 4,
          background: PALETTE.black, color: PALETTE.lime,
          display: "inline-block",
          padding: "6px 12px",
          marginBottom: 24,
          transform: "rotate(-2deg)",
        }}>
          ★ POWERED BY CLAUDE ★
        </div>
        <h1 className="pop" style={{
          fontFamily: "'Bowlby One', sans-serif",
          fontSize: 72, lineHeight: 0.85,
          margin: 0, color: PALETTE.black,
          letterSpacing: "-0.02em",
        }}>
          BOIS<br/>
          <span style={{ color: PALETTE.pink }}>TRIP</span><br/>
          <span style={{
            background: PALETTE.black, color: PALETTE.cyan,
            padding: "0 8px", display: "inline-block",
            transform: "rotate(-2deg)",
          }}>GEN</span>
        </h1>
        <div style={{ width: 120, margin: "20px auto 0" }}>
          <Squiggle color={PALETTE.black} />
        </div>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 16, marginTop: 24, lineHeight: 1.5, fontWeight: 500,
          maxWidth: 320, margin: "24px auto 0",
        }}>
          Tell us who's coming and what kind of chaos you want. Claude searches the web in real-time and generates 4 perfect destinations for the bois.
        </p>
      </div>

      <button
        onClick={onStart}
        className="neo-card neo-shadow-xl pop"
        style={{
          marginTop: 48,
          padding: "22px 48px",
          fontFamily: "'Bowlby One', sans-serif",
          fontSize: 22, letterSpacing: 1,
          background: PALETTE.pink, color: "white",
          position: "relative", zIndex: 2,
        }}
      >
        START THE PLANNING →
      </button>

      <div style={{
        marginTop: 32,
        fontFamily: "'Space Mono', monospace",
        fontSize: 10, letterSpacing: 2, opacity: 0.5, textAlign: "center",
      }}>
        ※ NO REFUNDS ※ NO REGRETS ※
      </div>
    </div>
  );
}

// ============================================================
// STEPS
// ============================================================

function BoisStep({ selected, onToggle, otherName, setOtherName, otherCity, setOtherCity }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {BOIS.map((boi, i) => {
          const isSelected = selected.includes(boi.id);
          return (
            <button
              key={boi.id}
              onClick={() => onToggle(boi.id)}
              className="neo-card pop"
              style={{
                padding: "20px 14px",
                background: isSelected ? boi.color : "white",
                position: "relative",
                animationDelay: `${i * 0.08}s`,
                boxShadow: isSelected ? `5px 5px 0 ${PALETTE.black}` : `3px 3px 0 ${PALETTE.black}`,
                transform: isSelected ? "translate(-1px, -1px)" : "none",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 8 }}>{boi.emoji}</div>
              <div style={{ fontFamily: "'Bowlby One', sans-serif", fontSize: 22, color: PALETTE.black, lineHeight: 1 }}>
                {boi.name}
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10, letterSpacing: 1, marginTop: 6,
                color: PALETTE.black, opacity: 0.7,
              }}>
                {boi.tag}
              </div>
              {boi.home && (
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9, letterSpacing: 0.5, marginTop: 3,
                  color: PALETTE.black, opacity: 0.55,
                }}>
                  📍 {boi.home.split(",")[0]}
                </div>
              )}
              {isSelected && (
                <div style={{
                  position: "absolute", top: -10, right: -10,
                  width: 28, height: 28, borderRadius: "50%",
                  background: PALETTE.black, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: "bold",
                  border: `2px solid white`,
                }}>✓</div>
              )}
            </button>
          );
        })}
      </div>

      {selected.includes("other") && (
        <div className="slidein" style={{ marginTop: 18 }}>
          <label style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, letterSpacing: 2, opacity: 0.7, display: "block", marginBottom: 8,
          }}>
            ↓ NAME OF EXTRA BOI
          </label>
          <input
            value={otherName}
            onChange={(e) => setOtherName(e.target.value)}
            placeholder="Type their name..."
            className="neo-card neo-shadow"
            style={{
              width: "100%",
              padding: "14px 16px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16, fontWeight: 600,
              background: "white", color: PALETTE.black,
              outline: "none",
            }}
          />
          <label style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, letterSpacing: 2, opacity: 0.7, display: "block", marginTop: 14, marginBottom: 8,
          }}>
            ↓ WHERE THEY'RE FLYING FROM
          </label>
          <input
            value={otherCity}
            onChange={(e) => setOtherCity(e.target.value)}
            placeholder="City, State (e.g. Austin, TX)"
            className="neo-card neo-shadow"
            style={{
              width: "100%",
              padding: "14px 16px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16, fontWeight: 600,
              background: "white", color: PALETTE.black,
              outline: "none",
            }}
          />
        </div>
      )}

      {selected.length > 0 && (
        <div className="slidein" style={{
          marginTop: 24, padding: 14,
          background: PALETTE.yellow,
          border: `2.5px solid ${PALETTE.black}`,
          boxShadow: `4px 4px 0 ${PALETTE.black}`,
          fontFamily: "'Space Mono', monospace",
          fontSize: 12, fontWeight: 700,
        }}>
          {selected.length} {selected.length === 1 ? "BOI" : "BOIS"} CONFIRMED →
        </div>
      )}
    </div>
  );
}

function TripTypeStep({ selected, onSelect }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {TRIP_TYPES.map((trip, i) => {
        const isSelected = selected === trip.id;
        return (
          <button
            key={trip.id}
            onClick={() => onSelect(trip.id)}
            className="neo-card pop"
            style={{
              padding: "16px 18px",
              background: isSelected ? PALETTE.cyan : "white",
              display: "flex", alignItems: "center", gap: 14,
              animationDelay: `${i * 0.05}s`,
              boxShadow: isSelected ? `5px 5px 0 ${PALETTE.black}` : `3px 3px 0 ${PALETTE.black}`,
              transform: isSelected ? "translate(-1px, -1px)" : "none",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 32, lineHeight: 1 }}>{trip.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Bowlby One', sans-serif", fontSize: 18, color: PALETTE.black, lineHeight: 1 }}>
                {trip.label}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginTop: 4, color: PALETTE.black, opacity: 0.7 }}>
                {trip.desc}
              </div>
            </div>
            {isSelected && (
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: PALETTE.black, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14,
              }}>✓</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function DurationStep({ selected, onSelect }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {DURATIONS.map((dur, i) => {
        const isSelected = selected === dur.id;
        return (
          <button
            key={dur.id}
            onClick={() => onSelect(dur.id)}
            className="neo-card pop"
            style={{
              padding: "16px 18px",
              background: isSelected ? PALETTE.lime : "white",
              display: "flex", alignItems: "center", gap: 14,
              animationDelay: `${i * 0.05}s`,
              boxShadow: isSelected ? `5px 5px 0 ${PALETTE.black}` : `3px 3px 0 ${PALETTE.black}`,
              transform: isSelected ? "translate(-1px, -1px)" : "none",
              textAlign: "left",
            }}
          >
            <div style={{
              minWidth: 56, height: 56,
              background: PALETTE.black, color: PALETTE.lime,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              fontFamily: "'Bowlby One', sans-serif",
              border: `2px solid ${PALETTE.black}`,
            }}>
              <div style={{ fontSize: 22, lineHeight: 1 }}>{dur.days}</div>
              <div style={{ fontSize: 8, letterSpacing: 1, marginTop: 2 }}>DAYS</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Bowlby One', sans-serif", fontSize: 17, color: PALETTE.black, lineHeight: 1 }}>
                {dur.label}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginTop: 4, color: PALETTE.black, opacity: 0.7 }}>
                {dur.desc}
              </div>
            </div>
            {isSelected && (
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: PALETTE.black, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14,
              }}>✓</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function MonthsStep({ selected, onToggle, onClear }) {
  const isFlexible = selected.length === 0;

  // Helpers for "this quarter" / "next quarter" quick presets
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const quickPresets = [
    {
      label: "FLEXIBLE",
      desc: "any time works",
      apply: () => onClear(),
      isActive: isFlexible,
    },
    {
      label: "SUMMER",
      desc: "jun · jul · aug",
      apply: () => {
        onClear();
        [6, 7, 8].forEach(m => onToggle(m));
      },
    },
    {
      label: "NEXT 3 MO",
      desc: "upcoming quarter",
      apply: () => {
        onClear();
        [0, 1, 2].forEach(offset => {
          const m = ((currentMonth - 1 + offset) % 12) + 1;
          onToggle(m);
        });
      },
    },
  ];

  return (
    <div>
      {/* Quick presets */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16,
      }}>
        {quickPresets.map((p, i) => (
          <button
            key={i}
            onClick={p.apply}
            className="neo-card"
            style={{
              padding: "10px 8px",
              background: p.isActive ? PALETTE.yellow : "white",
              boxShadow: `3px 3px 0 ${PALETTE.black}`,
              textAlign: "center",
            }}
          >
            <div style={{
              fontFamily: "'Bowlby One', sans-serif",
              fontSize: 11, lineHeight: 1, letterSpacing: 0.5,
            }}>
              {p.label}
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 8, letterSpacing: 0.5, opacity: 0.7,
              marginTop: 4,
            }}>
              {p.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Month grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
        {MONTHS.map((m, i) => {
          const isSelected = selected.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => onToggle(m.id)}
              className="neo-card pop"
              style={{
                padding: "14px 6px",
                background: isSelected ? PALETTE.yellow : "white",
                animationDelay: `${i * 0.03}s`,
                boxShadow: isSelected ? `4px 4px 0 ${PALETTE.black}` : `3px 3px 0 ${PALETTE.black}`,
                transform: isSelected ? "translate(-1px, -1px)" : "none",
                textAlign: "center",
                position: "relative",
              }}
            >
              <div style={{
                fontFamily: "'Bowlby One', sans-serif",
                fontSize: 16, lineHeight: 1, color: PALETTE.black,
              }}>
                {m.short}
              </div>
              {isSelected && (
                <div style={{
                  position: "absolute", top: -6, right: -6,
                  width: 18, height: 18, borderRadius: "50%",
                  background: PALETTE.black, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: "bold",
                  border: `1.5px solid white`,
                }}>✓</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Summary chip */}
      <div className="slidein" style={{
        marginTop: 20, padding: 14,
        background: isFlexible ? "white" : PALETTE.yellow,
        border: `2.5px solid ${PALETTE.black}`,
        boxShadow: `4px 4px 0 ${PALETTE.black}`,
        fontFamily: "'Space Mono', monospace",
        fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
      }}>
        {isFlexible
          ? "🗓  NO DATE LOCK-IN — RECS WILL BE SEASON-FLEXIBLE"
          : `🗓  ${selected.length} ${selected.length === 1 ? "MONTH" : "MONTHS"} → ${selected.sort((a,b)=>a-b).map(id => MONTHS.find(m=>m.id===id).short).join(" · ")}`
        }
      </div>
    </div>
  );
}

function BudgetStep({ selected, onSelect }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {BUDGETS.map((b, i) => {
        const isSelected = selected === b.id;
        return (
          <button
            key={b.id}
            onClick={() => onSelect(b.id)}
            className="neo-card pop"
            style={{
              padding: "16px 18px",
              background: isSelected ? PALETTE.orange : "white",
              display: "flex", alignItems: "center", gap: 14,
              animationDelay: `${i * 0.05}s`,
              boxShadow: isSelected ? `5px 5px 0 ${PALETTE.black}` : `3px 3px 0 ${PALETTE.black}`,
              transform: isSelected ? "translate(-1px, -1px)" : "none",
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 32, lineHeight: 1 }}>{b.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Bowlby One', sans-serif", fontSize: 17, color: PALETTE.black, lineHeight: 1 }}>
                {b.label}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginTop: 4, color: PALETTE.black, opacity: 0.7 }}>
                {b.desc} · {b.perPerson}/person
              </div>
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {[1,2,3,4].map(n => (
                <div key={n} style={{
                  width: 6, height: 22,
                  background: n <= b.level ? PALETTE.black : "rgba(0,0,0,0.15)",
                  border: `1px solid ${PALETTE.black}`,
                }} />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function VibeStep({ selected, onSelect, useSearch, setUseSearch }) {
  const colors = [PALETTE.pink, PALETTE.cyan, PALETTE.purple, PALETTE.yellow, PALETTE.lime];
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {VIBES.map((v, i) => {
          const isSelected = selected === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onSelect(v.id)}
              className="neo-card pop"
              style={{
                padding: "20px 14px",
                background: isSelected ? colors[i] : "white",
                gridColumn: i === VIBES.length - 1 && VIBES.length % 2 === 1 ? "span 2" : "auto",
                animationDelay: `${i * 0.07}s`,
                boxShadow: isSelected ? `5px 5px 0 ${PALETTE.black}` : `3px 3px 0 ${PALETTE.black}`,
                transform: isSelected ? "translate(-1px, -1px)" : "none",
                textAlign: "left",
                position: "relative",
              }}
            >
              <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 10 }}>{v.icon}</div>
              <div style={{ fontFamily: "'Bowlby One', sans-serif", fontSize: 20, color: PALETTE.black, lineHeight: 1 }}>
                {v.label}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginTop: 6, color: PALETTE.black, opacity: 0.75, lineHeight: 1.3 }}>
                {v.desc}
              </div>
              {isSelected && (
                <div style={{
                  position: "absolute", top: -10, right: -10,
                  width: 28, height: 28, borderRadius: "50%",
                  background: PALETTE.black, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: "bold",
                  border: `2px solid white`,
                }}>✓</div>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          onClick={() => setUseSearch(!useSearch)}
          className="neo-card"
          style={{
            width: "100%",
            padding: "14px 16px",
            background: useSearch ? PALETTE.lime : "white",
            boxShadow: `3px 3px 0 ${PALETTE.black}`,
            display: "flex", alignItems: "center", gap: 12,
            textAlign: "left",
          }}
        >
          <div style={{
            width: 28, height: 28,
            background: useSearch ? PALETTE.black : "white",
            border: `2px solid ${PALETTE.black}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: useSearch ? PALETTE.lime : "transparent",
            fontWeight: "bold",
            flexShrink: 0,
          }}>✓</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Bowlby One', sans-serif", fontSize: 14, lineHeight: 1 }}>
              🌐 LIVE WEB SEARCH
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10, letterSpacing: 1, opacity: 0.7,
              marginTop: 4, lineHeight: 1.3,
            }}>
              {useSearch
                ? "Claude will search for current events + hot spots (slower, better)"
                : "Faster, but knowledge is from training only"}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// ============================================================
// LOADING SCREEN
// ============================================================

function LoadingScreen({ text, useSearch, progressChars = 0 }) {
  // Rough estimate: final output is ~3500-4500 chars. Cap display at 95% so we
  // don't show "100%" before the JSON finishes parsing.
  const estimatedTotal = 4000;
  const pct = Math.min(95, Math.round((progressChars / estimatedTotal) * 100));

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24,
      position: "relative",
    }}>
      <div style={{
        width: 120, height: 120,
        border: `6px solid ${PALETTE.black}`,
        borderTopColor: PALETTE.pink,
        borderRightColor: PALETTE.cyan,
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: 40,
      }} />
      <div style={{ fontFamily: "'Bowlby One', sans-serif", fontSize: 28, textAlign: "center", lineHeight: 1 }}>
        COOKING UP<br/>YOUR TRIP
      </div>
      <div style={{ width: 80, margin: "16px 0" }}>
        <Squiggle color={PALETTE.pink} />
      </div>

      {/* Streaming progress bar */}
      {progressChars > 0 && (
        <div style={{
          width: 240, marginTop: 8, marginBottom: 16,
        }}>
          <div style={{
            height: 10,
            background: "white",
            border: `2px solid ${PALETTE.black}`,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              width: `${pct}%`,
              background: PALETTE.pink,
              transition: "width 0.2s ease-out",
            }} />
          </div>
          <div style={{
            marginTop: 4,
            fontFamily: "'Space Mono', monospace",
            fontSize: 9, letterSpacing: 2, opacity: 0.65,
            textAlign: "center",
          }}>
            📡 STREAMING · {progressChars.toLocaleString()} CHARS
          </div>
        </div>
      )}

      <div className="pulse" style={{
        marginTop: 12,
        fontFamily: "'Space Mono', monospace",
        fontSize: 13, letterSpacing: 1,
        background: PALETTE.black, color: PALETTE.lime,
        padding: "8px 16px",
        minHeight: 20, minWidth: 200,
        textAlign: "center",
      }}>
        {text || "..."}
      </div>
      {useSearch && progressChars === 0 && (
        <div style={{
          marginTop: 24,
          fontFamily: "'Space Mono', monospace",
          fontSize: 10, letterSpacing: 2, opacity: 0.6,
          textAlign: "center", maxWidth: 280, lineHeight: 1.5,
        }}>
          🌐 SEARCHING THE WEB FOR REAL-TIME PICKS<br/>
          CLAUDE IS BROWSING — HANG TIGHT
        </div>
      )}
    </div>
  );
}

// ============================================================
// ERROR SCREEN
// ============================================================

function ErrorScreen({ error, onRetry, onReset }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>💀</div>
      <h2 style={{ fontFamily: "'Bowlby One', sans-serif", fontSize: 32, textAlign: "center", margin: 0, lineHeight: 1 }}>
        SOMETHING<br/>BROKE.
      </h2>
      <div style={{
        marginTop: 20, padding: 14,
        background: PALETTE.black, color: PALETTE.pink,
        fontFamily: "'Space Mono', monospace",
        fontSize: 11, letterSpacing: 1,
        maxWidth: 320, textAlign: "center",
        wordBreak: "break-word",
      }}>
        {error}
      </div>
      <button
        onClick={onRetry}
        className="neo-card neo-shadow-lg"
        style={{
          marginTop: 30,
          padding: "16px 32px",
          fontFamily: "'Bowlby One', sans-serif",
          fontSize: 18, letterSpacing: 1,
          background: PALETTE.pink, color: "white",
        }}
      >
        🔄 TRY AGAIN
      </button>
      <button
        onClick={onReset}
        style={{
          marginTop: 16,
          fontFamily: "'Space Mono', monospace",
          fontSize: 11, letterSpacing: 2,
          textDecoration: "underline",
          color: PALETTE.black, opacity: 0.7,
        }}
      >
        ↻ START OVER
      </button>
    </div>
  );
}

// ============================================================
// RESULTS SCREEN
// ============================================================

function ResultsScreen({ recs, prefs, shareState, onReroll, onRemix, onReset }) {
  const cardColors = [PALETTE.pink, PALETTE.cyan, PALETTE.lime, PALETTE.orange];
  const fullRef = React.useRef(null);
  const [shareMsg, setShareMsg] = React.useState(null);
  const [linkCopied, setLinkCopied] = React.useState(false);

  // Build shareable URL (will only work on deployed version; shown as preview here)
  const buildShareLink = () => {
    if (typeof window === "undefined") return "";
    // Unicode-safe base64 encode
    const json = JSON.stringify(shareState);
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
    return `${window.location.origin}${window.location.pathname}#plan=${encoded}`;
  };

  const copyShareLink = async () => {
    const url = buildShareLink();
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setShareMsg("LINK COPIED ✓");
      setTimeout(() => { setLinkCopied(false); setShareMsg(null); }, 2200);
    } catch (e) {
      setShareMsg("COPY FAILED — TRY AGAIN");
      setTimeout(() => setShareMsg(null), 2200);
    }
  };

  // Use html-to-image to snapshot the full plan as a PNG.
  // html-to-image works by serializing DOM to SVG then rasterizing — handles
  // modern CSS, custom fonts, and dark-on-dark blocks correctly (unlike html2canvas).
  const snapshotToImage = async (targetRef, filenameSuffix) => {
    if (typeof window === "undefined" || !window.htmlToImage || !targetRef.current) {
      setShareMsg("STILL LOADING — TRY IN 2 SEC");
      setTimeout(() => setShareMsg(null), 2200);
      return;
    }
    setShareMsg("RENDERING IMAGE...");
    try {
      const node = targetRef.current;
      const blob = await window.htmlToImage.toBlob(node, {
        backgroundColor: PALETTE.cream,
        pixelRatio: 2,
        cacheBust: true,
        // Filter out any interactive-only elements if present (none right now)
        filter: (n) => !(n.dataset && n.dataset.exclude === "true"),
      });

      if (!blob) { setShareMsg("RENDER FAILED"); return; }

      // Try native Web Share (mobile) first — best for texting
      const file = new File([blob], `boistrip-${filenameSuffix}.png`, { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Bois Trip" });
          setShareMsg("SHARED ✓");
          setTimeout(() => setShareMsg(null), 2000);
          return;
        } catch (e) {
          // User cancelled; fall through to download
        }
      }

      // Fallback: download the image
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `boistrip-${filenameSuffix}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShareMsg("IMAGE DOWNLOADED ✓");
      setTimeout(() => setShareMsg(null), 2200);
    } catch (e) {
      console.error(e);
      setShareMsg("RENDER FAILED — try the copy link instead");
      setTimeout(() => setShareMsg(null), 3000);
    }
  };

  return (
    <div style={{ padding: "20px 18px 60px", position: "relative" }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 20,
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10, letterSpacing: 2, opacity: 0.6,
        }}>
          BOIS.TRIP / RESULTS
        </div>
        <button
          onClick={onReset}
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10, letterSpacing: 1,
            color: PALETTE.black, opacity: 0.7,
            textDecoration: "underline",
          }}
        >
          ↻ START OVER
        </button>
      </div>

      {/* Capture target: everything from headline through last rec card */}
      <div ref={fullRef} style={{ background: PALETTE.cream, padding: 0 }}>
        <div className="slidein">
          <div style={{
            display: "inline-block",
            background: PALETTE.black, color: PALETTE.lime,
            padding: "4px 10px",
            fontFamily: "'Space Mono', monospace",
            fontSize: 10, letterSpacing: 2,
            marginBottom: 12,
          }}>
            ★ TOP {recs.length} PICKS ★
          </div>
          <h1 style={{ fontFamily: "'Bowlby One', sans-serif", fontSize: 44, lineHeight: 0.9, margin: 0 }}>
            THE BOIS<br/>
            ARE GOING<br/>
            <span style={{ color: PALETTE.pink }}>SOMEWHERE.</span>
          </h1>
          <div style={{ width: 120, marginTop: 14 }}>
            <Squiggle color={PALETTE.pink} />
          </div>
        </div>

        <div className="slidein" style={{
          marginTop: 20, padding: 14,
          background: "white",
          border: `2.5px solid ${PALETTE.black}`,
          boxShadow: `4px 4px 0 ${PALETTE.black}`,
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9, letterSpacing: 2, opacity: 0.6, marginBottom: 8,
          }}>
            ↓ YOUR ORDER
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <Chip>{prefs.bois.length} BOIS</Chip>
            <Chip color={PALETTE.cyan}>{prefs.tripType.icon} {prefs.tripType.label}</Chip>
            <Chip color={PALETTE.lime}>{prefs.duration.days} DAYS</Chip>
            {prefs.months && prefs.months.length > 0 && (
              <Chip color={PALETTE.yellow}>
                🗓 {prefs.months.sort((a,b)=>a-b).map(id => MONTHS.find(m=>m.id===id).short).join("·")}
              </Chip>
            )}
            <Chip color={PALETTE.orange}>{prefs.budget.icon} {prefs.budget.label}</Chip>
            <Chip color={PALETTE.purple}>{prefs.vibe.icon} {prefs.vibe.label}</Chip>
          </div>
          <div style={{ marginTop: 10, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500 }}>
            The roster:
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
              {prefs.bois.map((b, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <strong style={{ fontSize: 13 }}>{b.name}</strong>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10, opacity: 0.65, letterSpacing: 0.5,
                  }}>
                    📍 {b.home}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 28, display: "grid", gap: 18 }}>
          {recs.map((rec, i) => (
            <RecCard
              key={`${rec.name}-${i}`}
              rec={rec}
              index={i}
              color={cardColors[i % cardColors.length]}
              onShareSingle={(cardRef) => snapshotToImage(cardRef, `pick-${i+1}-${(rec.name||"").toLowerCase().replace(/\s+/g,"-")}`)}
            />
          ))}
        </div>

        {/* Tiny footer inside the capture zone so shared image is branded */}
        <div style={{
          marginTop: 20, paddingTop: 16,
          borderTop: `2px dashed ${PALETTE.black}`,
          textAlign: "center",
          fontFamily: "'Space Mono', monospace",
          fontSize: 10, letterSpacing: 2, opacity: 0.6,
        }}>
          ★ BOIS.TRIP — GET YOUR OWN AT justacoupleofboistrip.vercel.app ★
        </div>
      </div>

      {/* Action buttons cluster */}
      <div style={{ marginTop: 28, display: "grid", gap: 10 }}>
        {/* Share row - 2 buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button
            onClick={() => snapshotToImage(fullRef, "full-plan")}
            className="neo-card neo-shadow"
            style={{
              padding: "16px 12px",
              fontFamily: "'Bowlby One', sans-serif",
              fontSize: 14, letterSpacing: 0.5, lineHeight: 1.1,
              background: PALETTE.cyan, color: PALETTE.black,
            }}
          >
            📸 SHARE AS<br/>IMAGE
          </button>
          <button
            onClick={copyShareLink}
            className="neo-card neo-shadow"
            style={{
              padding: "16px 12px",
              fontFamily: "'Bowlby One', sans-serif",
              fontSize: 14, letterSpacing: 0.5, lineHeight: 1.1,
              background: linkCopied ? PALETTE.lime : PALETTE.pink,
              color: linkCopied ? PALETTE.black : "white",
            }}
          >
            🔗 {linkCopied ? "COPIED!" : "COPY REMIX LINK"}
          </button>
        </div>

        {/* Status toast */}
        {shareMsg && (
          <div className="slidein" style={{
            padding: 10,
            background: PALETTE.black, color: PALETTE.lime,
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, letterSpacing: 1, fontWeight: 700,
            textAlign: "center",
            border: `2px solid ${PALETTE.black}`,
          }}>
            {shareMsg}
          </div>
        )}

        {/* Reroll / Remix row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
          <button
            onClick={onReroll}
            className="neo-card neo-shadow"
            style={{
              padding: "16px 12px",
              fontFamily: "'Bowlby One', sans-serif",
              fontSize: 14, letterSpacing: 0.5, lineHeight: 1.1,
              background: PALETTE.yellow, color: PALETTE.black,
            }}
          >
            🎲 RE-ROLL<br/>SAME INPUTS
          </button>
          <button
            onClick={onRemix}
            className="neo-card neo-shadow"
            style={{
              padding: "16px 12px",
              fontFamily: "'Bowlby One', sans-serif",
              fontSize: 14, letterSpacing: 0.5, lineHeight: 1.1,
              background: PALETTE.purple, color: "white",
            }}
          >
            ✎ REMIX<br/>EDIT INPUTS
          </button>
        </div>
      </div>

      <div style={{
        marginTop: 24,
        padding: 12,
        background: "white",
        border: `2px dashed ${PALETTE.black}`,
        fontFamily: "'Space Mono', monospace",
        fontSize: 10, letterSpacing: 0.5, lineHeight: 1.4,
        opacity: 0.75,
      }}>
        <strong>💡 HOW THIS WORKS:</strong> Image share drops a PNG in your group chat. Copy remix link lets the bois open your plan, tweak inputs, and regenerate their own picks. Re-roll keeps your inputs and asks for fresh destinations.
      </div>

      <div style={{
        marginTop: 24, textAlign: "center",
        fontFamily: "'Space Mono', monospace",
        fontSize: 10, letterSpacing: 2, opacity: 0.5,
      }}>
        ※ NOW GO TEXT THE GROUP CHAT ※
      </div>
    </div>
  );
}

function Chip({ children, color }) {
  return (
    <span style={{
      background: color || "white",
      border: `2px solid ${PALETTE.black}`,
      padding: "4px 9px",
      fontFamily: "'Space Mono', monospace",
      fontSize: 10, fontWeight: 700, letterSpacing: 1,
      boxShadow: `2px 2px 0 ${PALETTE.black}`,
    }}>
      {children}
    </span>
  );
}

function RecCard({ rec, index, color, onShareSingle }) {
  const [expanded, setExpanded] = useState(index === 0);
  const cardRef = React.useRef(null);

  return (
    <div ref={cardRef} className="slidein" style={{
      animationDelay: `${index * 0.12}s`,
      background: "white",
      border: `2.5px solid ${PALETTE.black}`,
      boxShadow: `6px 6px 0 ${PALETTE.black}`,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        background: color,
        borderBottom: `2.5px solid ${PALETTE.black}`,
        padding: "10px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10, letterSpacing: 2, fontWeight: 700,
        }}>
          PICK #{String(index + 1).padStart(2, "0")}
        </div>
        {index === 0 && (
          <div style={{
            background: PALETTE.black, color: PALETTE.lime,
            padding: "3px 8px",
            fontFamily: "'Space Mono', monospace",
            fontSize: 9, letterSpacing: 2,
          }}>
            ★ TOP MATCH ★
          </div>
        )}
      </div>

      <div style={{ padding: "20px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ fontSize: 48, lineHeight: 1 }}>{rec.emoji || "📍"}</div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Bowlby One', sans-serif",
              fontSize: 28, lineHeight: 0.95,
              color: PALETTE.black,
            }}>
              {(rec.name || "").toUpperCase()}
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 11, letterSpacing: 1, marginTop: 4, opacity: 0.7,
            }}>
              📍 {rec.region}
            </div>
          </div>
        </div>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14, lineHeight: 1.5, marginTop: 14,
        }}>
          {rec.blurb}
        </p>

        {rec.travel && rec.travel.trim().length > 0 && (
          <div style={{
            marginTop: 12,
            padding: "10px 12px",
            background: "white",
            border: `2px solid ${PALETTE.black}`,
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <div style={{ fontSize: 16, lineHeight: 1 }}>✈️</div>
            <div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9, letterSpacing: 2, fontWeight: 700,
                marginBottom: 2,
              }}>
                GETTING THERE
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12, lineHeight: 1.4, fontWeight: 500,
              }}>
                {rec.travel}
              </div>
            </div>
          </div>
        )}

        {rec.currentEvent && rec.currentEvent.trim().length > 0 && (
          <div style={{
            marginTop: 12,
            padding: "10px 12px",
            background: PALETTE.yellow,
            border: `2px solid ${PALETTE.black}`,
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <div style={{ fontSize: 16, lineHeight: 1 }}>🔴</div>
            <div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9, letterSpacing: 2, fontWeight: 700,
                marginBottom: 2,
              }}>
                HAPPENING SOON
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12, lineHeight: 1.4, fontWeight: 600,
              }}>
                {rec.currentEvent}
              </div>
            </div>
          </div>
        )}

        {expanded && (
          <div className="slidein" style={{ marginTop: 16 }}>
            <SectionLabel color={color}>WHAT TO DO</SectionLabel>
            <ul style={{ margin: "8px 0 0", paddingLeft: 0, listStyle: "none" }}>
              {(rec.activities || []).map((a, i) => (
                <li key={i} style={{
                  display: "flex", gap: 8, alignItems: "flex-start",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13, lineHeight: 1.5,
                  marginBottom: 6,
                }}>
                  <span style={{ color: color, fontWeight: 700, flexShrink: 0 }}>▸</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>

            {/* Accommodation — two options */}
            <div style={{ marginTop: 14 }}>
              <SectionLabel color={color}>WHERE TO STAY</SectionLabel>
              <div style={{
                marginTop: 8,
                padding: 10,
                background: "white",
                border: `2px solid ${PALETTE.black}`,
                display: "flex", gap: 8, alignItems: "flex-start",
              }}>
                <div style={{ fontSize: 18, lineHeight: 1 }}>🏨</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 8, letterSpacing: 1.5, fontWeight: 700, opacity: 0.65,
                    marginBottom: 2,
                  }}>
                    HOTEL / AREA
                  </div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13, lineHeight: 1.4,
                  }}>
                    {rec.stay}
                  </div>
                </div>
              </div>

              {rec.coolStay && rec.coolStay.trim().length > 0 && (
                <div style={{
                  marginTop: 8,
                  padding: 10,
                  background: color,
                  border: `2px solid ${PALETTE.black}`,
                  display: "flex", gap: 8, alignItems: "flex-start",
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute",
                    top: -8, right: 10,
                    background: PALETTE.black,
                    color: color,
                    padding: "2px 6px",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 8, letterSpacing: 1.5, fontWeight: 700,
                    border: `1.5px solid ${PALETTE.black}`,
                  }}>
                    ★ BOI PICK
                  </div>
                  <div style={{ fontSize: 18, lineHeight: 1 }}>🏡</div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 8, letterSpacing: 1.5, fontWeight: 700,
                      marginBottom: 2, color: PALETTE.black,
                    }}>
                      COOL AIRBNB / UNIQUE STAY
                    </div>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13, lineHeight: 1.4, fontWeight: 500,
                      color: PALETTE.black,
                    }}>
                      {rec.coolStay}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{
              marginTop: 16, padding: 12,
              background: PALETTE.black, color: "white",
              border: `2px solid ${PALETTE.black}`,
            }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 9, letterSpacing: 2, color: color,
                marginBottom: 4,
              }}>
                ★ THE SIGNATURE BOI MOMENT
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontStyle: "italic", lineHeight: 1.4 }}>
                "{rec.moment}"
              </div>
            </div>
          </div>
        )}

        {/* Bottom action row: expand + share-this-one */}
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              flex: 1,
              padding: "10px",
              fontFamily: "'Space Mono', monospace",
              fontSize: 11, letterSpacing: 2, fontWeight: 700,
              background: PALETTE.black, color: "white",
              border: `2px solid ${PALETTE.black}`,
            }}
          >
            {expanded ? "↑ HIDE" : "↓ SEE THE PLAN"}
          </button>
          {onShareSingle && (
            <button
              onClick={() => onShareSingle(cardRef)}
              style={{
                padding: "10px 14px",
                fontFamily: "'Space Mono', monospace",
                fontSize: 11, letterSpacing: 1, fontWeight: 700,
                background: color, color: PALETTE.black,
                border: `2px solid ${PALETTE.black}`,
                boxShadow: `2px 2px 0 ${PALETTE.black}`,
              }}
              title="Share just this pick"
            >
              📸 SHARE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children, color }) {
  return (
    <div style={{
      display: "inline-block",
      background: color,
      border: `2px solid ${PALETTE.black}`,
      padding: "3px 8px",
      fontFamily: "'Space Mono', monospace",
      fontSize: 10, letterSpacing: 2, fontWeight: 700,
    }}>
      {children}
    </div>
  );
}
