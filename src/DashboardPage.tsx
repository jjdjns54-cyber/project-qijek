import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  CircleUserRound,
  LayoutGrid,
  LockKeyhole,
  Menu,
  MessageCircle,
  Paperclip,
  Plus,
  RefreshCw,
  ScanFace,
  Search,
  Settings2,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Target,
  WandSparkles,
  X,
} from "lucide-react";
import Brand from "./Brand";
import {
  analysisCatalog,
  methodLabels,
  metricGroups,
  type AnalysisMetric,
  type MetricGroup,
  type MetricMethod,
} from "./analysisCatalog";

type AppView = "overview" | "analysis" | "plan" | "simulate" | "doodeegpt";
type PillarId = "harmony" | "angularity" | "dimorphism" | "features";
type FaceAngle = "front" | "side";
type AnalysisMode = "results" | "library";

type RatioMetric = {
  id: string;
  name: string;
  value: string;
  score: number;
  ideal: string;
  status: "Ideal" | "Strong" | "Balanced" | "Review" | "Priority";
  detail: string;
  mayIndicate: string;
  affected: string[];
};

type PlanAction = {
  title: string;
  category: "Foundational" | "Non-Invasive" | "Minimally Invasive" | "Surgical";
  detail: string;
  impact: string;
  cost: string;
  time: string;
  locked?: boolean;
};

const views: { id: AppView; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "analysis", label: "Analysis" },
  { id: "plan", label: "Plan" },
  { id: "simulate", label: "Simulate" },
  { id: "doodeegpt", label: "DOODEE GPT" },
];

const pillars: {
  id: PillarId;
  label: string;
  score: string;
  note: string;
  locked?: boolean;
}[] = [
  {
    id: "harmony",
    label: "Harmony",
    score: "7.4",
    note: "Balanced proportions",
  },
  {
    id: "angularity",
    label: "Angularity",
    score: "7.0",
    note: "Shape and definition",
    locked: true,
  },
  {
    id: "dimorphism",
    label: "Dimorphism",
    score: "6.8",
    note: "Facial traits",
    locked: true,
  },
  {
    id: "features",
    label: "Features",
    score: "7.2",
    note: "Individual features",
    locked: true,
  },
];

const ratios: Record<PillarId, RatioMetric[]> = {
  harmony: [
    {
      id: "facial-thirds",
      name: "Facial thirds",
      value: "33 · 34 · 33",
      score: 8.6,
      ideal: "31–35% per third",
      status: "Ideal",
      detail: "Compares the upper, middle and lower thirds of your face.",
      mayIndicate:
        "Balanced vertical proportions and a cohesive full-face structure.",
      affected: ["Upper third", "Middle third", "Lower third"],
    },
    {
      id: "canthal-tilt",
      name: "Canthal tilt",
      value: "+6.4°",
      score: 8.3,
      ideal: "+4° to +8°",
      status: "Ideal",
      detail: "Measures the angle from the inner to outer eye corner.",
      mayIndicate:
        "An upward eye angle that supports an alert, balanced eye area.",
      affected: ["Eye angle", "Eye symmetry"],
    },
    {
      id: "eye-separation",
      name: "Eye separation ratio",
      value: "46.8%",
      score: 9.2,
      ideal: "44–48%",
      status: "Strong",
      detail: "Compares pupil distance with facial width.",
      mayIndicate: "Balanced eye spacing relative to the width of the face.",
      affected: ["Intercanthal distance", "Eye-to-face ratio"],
    },
    {
      id: "fwhr",
      name: "Facial width-to-height ratio",
      value: "1.86×",
      score: 7.9,
      ideal: "1.80–1.95×",
      status: "Balanced",
      detail: "Compares bizygomatic width with upper-face height.",
      mayIndicate: "A balanced relationship between facial width and height.",
      affected: ["Face width", "Upper-face height"],
    },
    {
      id: "eye-aspect",
      name: "Eye aspect ratio",
      value: "2.90×",
      score: 7.6,
      ideal: "2.70–3.10×",
      status: "Balanced",
      detail: "Measures eye width relative to visible eye height.",
      mayIndicate:
        "Proportionate eye opening without excessive vertical exposure.",
      affected: ["Eye width", "Eyelid exposure"],
    },
    {
      id: "midface",
      name: "Midface ratio",
      value: "0.93×",
      score: 7.3,
      ideal: "0.90–1.00×",
      status: "Balanced",
      detail: "Measures eye-line to mouth distance relative to facial width.",
      mayIndicate:
        "A proportionate midface with room for improvement in projection.",
      affected: ["Midface length", "Cheek projection"],
    },
    {
      id: "jaw-face",
      name: "Jaw-to-face width ratio",
      value: "0.77×",
      score: 6.8,
      ideal: "0.80–0.88×",
      status: "Review",
      detail: "Compares jaw width with the widest point of the face.",
      mayIndicate: "A narrower lower face relative to the cheekbones.",
      affected: ["Jaw width", "Lower third"],
    },
    {
      id: "chin-projection",
      name: "Chin projection",
      value: "−2.1 mm",
      score: 5.9,
      ideal: "−1 to +2 mm",
      status: "Priority",
      detail: "Estimates how the chin sits relative to the lips and nose.",
      mayIndicate: "A mildly retrusive chin that affects side-profile balance.",
      affected: ["Profile balance", "Jaw relationship"],
    },
    {
      id: "nose-face",
      name: "Nose-to-face width ratio",
      value: "0.26×",
      score: 8.1,
      ideal: "0.24–0.28×",
      status: "Ideal",
      detail: "Compares alar width with facial width.",
      mayIndicate: "Nose width is in proportion with the face.",
      affected: ["Alar width", "Midface harmony"],
    },
    {
      id: "mouth-nose",
      name: "Mouth-to-nose ratio",
      value: "1.33×",
      score: 8.8,
      ideal: "1.30–1.50×",
      status: "Strong",
      detail: "Compares mouth width with nose width.",
      mayIndicate: "A mouth contour that is neither too wide nor too narrow.",
      affected: ["Mouth width", "Lip harmony"],
    },
    {
      id: "lower-third",
      name: "Lower-third proportion",
      value: "33.1%",
      score: 8.4,
      ideal: "32–35%",
      status: "Ideal",
      detail: "Measures nose base to chin relative to total facial height.",
      mayIndicate:
        "A balanced lower third with minor chin projection influence.",
      affected: ["Philtrum", "Chin height"],
    },
    {
      id: "brow-eye",
      name: "Brow-to-eye distance",
      value: "1.08×",
      score: 7.2,
      ideal: "0.95–1.15×",
      status: "Balanced",
      detail: "Evaluates eyebrow position relative to visible eye height.",
      mayIndicate: "A neutral brow position that supports the eye area.",
      affected: ["Brow position", "Upper eyelid"],
    },
  ],
  angularity: [
    {
      id: "gonial",
      name: "Gonial angle",
      value: "124.6°",
      score: 7.2,
      ideal: "118–128°",
      status: "Balanced",
      detail: "Measures the angle where the jaw body meets the ramus.",
      mayIndicate:
        "Moderate jaw angularity without an overly square appearance.",
      affected: ["Jaw angle", "Lower-face shape"],
    },
    {
      id: "jaw-width",
      name: "Jaw width",
      value: "87.4%",
      score: 6.9,
      ideal: "88–94%",
      status: "Review",
      detail: "Compares lower-face width with cheekbone width.",
      mayIndicate: "A slightly tapered lower face.",
      affected: ["Mandible", "Bizygomatic width"],
    },
    {
      id: "cheekbone",
      name: "Cheekbone prominence",
      value: "7.8/10",
      score: 7.8,
      ideal: "7.5–9.0",
      status: "Strong",
      detail: "Estimates lateral and forward cheekbone definition.",
      mayIndicate: "Visible cheekbone structure that supports facial shape.",
      affected: ["Zygomatic projection", "Midface width"],
    },
    {
      id: "jaw-definition",
      name: "Jawline definition",
      value: "6.7/10",
      score: 6.7,
      ideal: "7.5–9.0",
      status: "Review",
      detail: "Assesses the visual separation between the jaw and neck.",
      mayIndicate:
        "Definition could improve through body composition or structural options.",
      affected: ["Jaw border", "Neck contour"],
    },
    {
      id: "convexity",
      name: "Facial convexity",
      value: "168.4°",
      score: 7.1,
      ideal: "165–175°",
      status: "Balanced",
      detail: "Measures the overall curvature of the side profile.",
      mayIndicate: "A generally balanced profile with mild chin retrusion.",
      affected: ["Nose", "Lips", "Chin"],
    },
    {
      id: "mandible",
      name: "Mandibular projection",
      value: "−1.8 mm",
      score: 5.8,
      ideal: "0 to +3 mm",
      status: "Priority",
      detail: "Estimates forward position of the lower jaw.",
      mayIndicate: "A retrusive mandibular relationship in profile.",
      affected: ["Jaw projection", "Chin position"],
    },
    {
      id: "orbital",
      name: "Orbital definition",
      value: "7.1/10",
      score: 7.1,
      ideal: "7.5–9.0",
      status: "Balanced",
      detail: "Evaluates the shape and definition around the eyes.",
      mayIndicate: "Moderate eye-area definition with balanced support.",
      affected: ["Brow ridge", "Upper orbit"],
    },
    {
      id: "chin-angle",
      name: "Chin angle",
      value: "118.2°",
      score: 6.3,
      ideal: "112–117°",
      status: "Review",
      detail: "Measures the lower-lip to chin transition.",
      mayIndicate: "A softer chin transition than the reference range.",
      affected: ["Mentolabial angle", "Chin contour"],
    },
  ],
  dimorphism: [
    {
      id: "brow-ridge",
      name: "Brow ridge",
      value: "6.8/10",
      score: 6.8,
      ideal: "7.0–8.5",
      status: "Balanced",
      detail: "Evaluates upper-orbital structure and projection.",
      mayIndicate: "Moderate upper-face dimorphism.",
      affected: ["Upper orbit", "Brow position"],
    },
    {
      id: "lower-width",
      name: "Lower-face width",
      value: "0.82×",
      score: 7.0,
      ideal: "0.82–0.90×",
      status: "Ideal",
      detail: "Compares lower-face width with midface width.",
      mayIndicate: "A proportionate lower-face shape.",
      affected: ["Jaw width", "Lower third"],
    },
    {
      id: "eye-height",
      name: "Eye height ratio",
      value: "0.31×",
      score: 6.5,
      ideal: "0.28–0.34×",
      status: "Balanced",
      detail: "Compares visible eye height with eye width.",
      mayIndicate: "Neutral eye openness for the selected reference.",
      affected: ["Eye aperture", "Eyelid exposure"],
    },
    {
      id: "lip-fullness",
      name: "Lip fullness",
      value: "7.4/10",
      score: 7.4,
      ideal: "6.5–8.0",
      status: "Strong",
      detail: "Assesses visible lip volume and balance.",
      mayIndicate: "Proportionate lip volume relative to surrounding features.",
      affected: ["Upper lip", "Lower lip"],
    },
    {
      id: "neck-width",
      name: "Neck width",
      value: "91.2%",
      score: 6.6,
      ideal: "92–101%",
      status: "Review",
      detail: "Compares neck width with jaw width.",
      mayIndicate: "A slightly narrow neck relative to the lower face.",
      affected: ["Neck", "Jaw silhouette"],
    },
    {
      id: "jaw-angularity",
      name: "Jaw angularity",
      value: "6.9/10",
      score: 6.9,
      ideal: "7.3–8.8",
      status: "Balanced",
      detail: "Combines jaw angle, width and definition.",
      mayIndicate: "Moderate structural angularity.",
      affected: ["Gonial angle", "Jaw definition"],
    },
  ],
  features: [
    {
      id: "nose-width",
      name: "Nose width",
      value: "35.2 mm",
      score: 8.0,
      ideal: "33–38 mm",
      status: "Ideal",
      detail: "Measures alar width across the nose.",
      mayIndicate: "Nose width is proportionate to facial width.",
      affected: ["Alar width", "Nose proportion"],
    },
    {
      id: "nose-length",
      name: "Nose length",
      value: "52.8 mm",
      score: 7.7,
      ideal: "49–56 mm",
      status: "Balanced",
      detail: "Measures the bridge-to-tip vertical length.",
      mayIndicate: "Balanced nose length for the midface.",
      affected: ["Nasal bridge", "Midface"],
    },
    {
      id: "lip-ratio",
      name: "Upper/lower lip ratio",
      value: "1:1.58",
      score: 8.5,
      ideal: "1:1.4–1.7",
      status: "Strong",
      detail: "Compares visible upper- and lower-lip height.",
      mayIndicate: "Balanced lip proportions.",
      affected: ["Upper lip", "Lower lip"],
    },
    {
      id: "philtrum",
      name: "Philtrum length",
      value: "14.2 mm",
      score: 7.0,
      ideal: "12–15 mm",
      status: "Balanced",
      detail: "Measures nose base to upper-lip distance.",
      mayIndicate: "A proportionate central upper-lip area.",
      affected: ["Philtrum", "Upper lip"],
    },
    {
      id: "hairline",
      name: "Hairline proportion",
      value: "31.9%",
      score: 7.3,
      ideal: "30–34%",
      status: "Balanced",
      detail: "Estimates forehead height using the visible hairline.",
      mayIndicate: "A balanced upper third when the hairline is visible.",
      affected: ["Forehead", "Upper third"],
    },
    {
      id: "skin-texture",
      name: "Skin texture",
      value: "7.1/10",
      score: 7.1,
      ideal: "7.5–10",
      status: "Review",
      detail: "Estimates visible texture consistency in the captured image.",
      mayIndicate: "Minor unevenness that may respond to skincare.",
      affected: ["Texture", "Pores"],
    },
    {
      id: "under-eye",
      name: "Under-eye area",
      value: "6.5/10",
      score: 6.5,
      ideal: "7.5–10",
      status: "Review",
      detail: "Assesses darkness, hollowness and lower-eyelid support.",
      mayIndicate: "Mild under-eye darkness or hollowing.",
      affected: ["Lower eyelid", "Midface support"],
    },
    {
      id: "symmetry",
      name: "Facial symmetry",
      value: "92.4%",
      score: 8.7,
      ideal: "90–100%",
      status: "Strong",
      detail: "Compares landmark positions between the left and right sides.",
      mayIndicate: "High visible symmetry within normal human variation.",
      affected: ["Eyes", "Nose", "Mouth", "Jaw"],
    },
  ],
};

const strengths = [
  {
    name: "Eye separation",
    score: "9.2",
    detail: "Balanced spacing across the eye area.",
    ratios: ["Intercanthal distance 9.3", "Eye-to-face ratio 9.1"],
  },
  {
    name: "Mouth width",
    score: "8.8",
    detail: "Well aligned with your nose and lower face.",
    ratios: ["Mouth-to-nose 8.8", "Lip width 8.7"],
  },
  {
    name: "Facial symmetry",
    score: "8.7",
    detail: "Landmarks remain closely balanced across both sides.",
    ratios: ["Eye symmetry 8.9", "Jaw symmetry 8.5"],
  },
];

const improvements = [
  {
    name: "Chin projection",
    score: "−0.42",
    level: "Priority",
    detail: "The side profile has the clearest opportunity for balance.",
    ratios: ["Profile balance 5.9", "Jaw relationship 6.1"],
  },
  {
    name: "Jaw definition",
    score: "−0.31",
    level: "Moderate",
    detail: "Lower-face structure can read more clearly.",
    ratios: ["Jaw border 6.7", "Neck contour 6.4"],
  },
  {
    name: "Under-eye area",
    score: "−0.18",
    level: "Review",
    detail: "A smaller contribution to overall feature clarity.",
    ratios: ["Lower-eyelid support 6.5", "Midface support 6.8"],
  },
];

const planActions: PlanAction[] = [
  {
    title: "Hairstyle and brow structure",
    category: "Foundational",
    detail:
      "Use more height at the crown and cleaner brow edges to reinforce facial shape.",
    impact: "+0.18",
    cost: "$0–$80",
    time: "Start today",
  },
  {
    title: "Skin texture routine",
    category: "Foundational",
    detail:
      "Build a simple routine around sunscreen, retinoid tolerance and barrier support.",
    impact: "+0.14",
    cost: "$20–$90",
    time: "6–12 weeks",
  },
  {
    title: "Neck and posture training",
    category: "Foundational",
    detail:
      "Use chin tucks and progressive neck work to improve the lower-face silhouette.",
    impact: "+0.11",
    cost: "$0–$30",
    time: "8–16 weeks",
  },
  {
    title: "Masseter assessment",
    category: "Non-Invasive",
    detail:
      "Discuss whether muscle activity contributes to lower-face width or asymmetry.",
    impact: "+0.09",
    cost: "$250–$700",
    time: "2–6 weeks",
    locked: true,
  },
  {
    title: "Chin profile consultation",
    category: "Minimally Invasive",
    detail:
      "Review projection goals with a qualified professional using the side profile.",
    impact: "+0.17",
    cost: "$500–$1,500",
    time: "1–2 weeks",
    locked: true,
  },
  {
    title: "Under-eye support review",
    category: "Non-Invasive",
    detail: "Discuss skin quality, volume and structural support separately.",
    impact: "+0.08",
    cost: "$350–$1,200",
    time: "1–3 weeks",
    locked: true,
  },
  {
    title: "Rhinoplasty direction",
    category: "Surgical",
    detail:
      "Explore a conservative bridge and tip direction without changing facial identity.",
    impact: "+0.13",
    cost: "$5,000–$15,000",
    time: "2–4 weeks",
    locked: true,
  },
  {
    title: "Jaw contour review",
    category: "Surgical",
    detail:
      "Use the 3D consultation view to compare structural and soft-tissue options.",
    impact: "+0.12",
    cost: "$6,000–$18,000",
    time: "3–6 weeks",
    locked: true,
  },
];

const treatments = [
  "Rhinoplasty",
  "Chin profile",
  "Jaw contour",
  "Eye area",
  "Skin quality",
];

function getStoredScan() {
  try {
    return (
      window.sessionStorage.getItem("doodee:last-scan-front") ||
      (new URLSearchParams(window.location.search).has("demo")
        ? "/assets/sample-face-front.png"
        : null)
    );
  } catch {
    return new URLSearchParams(window.location.search).has("demo")
      ? "/assets/sample-face-front.png"
      : null;
  }
}

function getInitialView(): AppView {
  const value = window.location.hash.replace("#", "") as AppView;
  return views.some((view) => view.id === value) ? value : "overview";
}

function GlassCard({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const move = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--glass-x",
      `${event.clientX - rect.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--glass-y",
      `${event.clientY - rect.top}px`,
    );
  };
  const leave = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.removeProperty("--glass-x");
    event.currentTarget.style.removeProperty("--glass-y");
  };
  return (
    <article
      className={`app-glass ${className}`}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      {children}
    </article>
  );
}

function ScoreCurve() {
  return (
    <svg
      className="score-curve"
      viewBox="0 0 760 220"
      role="img"
      aria-label="Your score compared with the reference range"
    >
      <defs>
        <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1687ff" stopOpacity=".2" />
          <stop offset="1" stopColor="#1687ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        className="score-curve__grid"
        d="M40 174H720M40 128H720M40 82H720"
      />
      <path
        className="score-curve__fill"
        d="M42 174C158 174 195 167 249 140C308 111 322 44 380 38C438 44 452 111 511 140C565 167 602 174 718 174V200H42Z"
      />
      <path
        className="score-curve__line"
        d="M42 174C158 174 195 167 249 140C308 111 322 44 380 38C438 44 452 111 511 140C565 167 602 174 718 174"
      />
      <line
        className="score-curve__marker"
        x1="488"
        y1="80"
        x2="488"
        y2="181"
      />
      <circle cx="488" cy="145" r="7" />
      <text x="488" y="66" textAnchor="middle">
        YOU · 7.4
      </text>
    </svg>
  );
}

function InsightList({
  kind,
  items,
}: {
  kind: "strength" | "improve";
  items: typeof strengths | typeof improvements;
}) {
  const [open, setOpen] = useState(0);
  const [expanded, setExpanded] = useState(false);
  return (
    <GlassCard className={`insight-panel insight-panel--${kind}`}>
      <header>
        <div>
          <span className="eyebrow">
            {kind === "strength" ? "Key strengths" : "Areas to improve"}
          </span>
          <h2>
            {kind === "strength"
              ? "What already works."
              : "Where effort matters."}
          </h2>
        </div>
        <span className="insight-count">
          {expanded ? "All shown" : "3 of 18"}
        </span>
      </header>
      <div className="insight-list">
        {items.map((item, index) => (
          <button
            className={open === index ? "is-open" : ""}
            type="button"
            onClick={() => setOpen(open === index ? -1 : index)}
            key={item.name}
          >
            <span className="insight-status">
              {"level" in item ? item.level : "Ideal"}
            </span>
            <strong>{item.name}</strong>
            <b>{item.score}</b>
            <ChevronDown />
            <div className="insight-detail">
              <p>{item.detail}</p>
              <small>Contributing ratios</small>
              {item.ratios.map((ratio) => (
                <span key={ratio}>{ratio}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
      <button
        className="insight-more"
        type="button"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Show less" : "Show 15 more"}
        <ChevronDown />
      </button>
    </GlassCard>
  );
}

function Overview({
  scanImage,
  openView,
  onUnlock,
}: {
  scanImage: string;
  openView: (view: AppView) => void;
  onUnlock: () => void;
}) {
  const current = pillars[0];
  return (
    <div className="app-view app-overview">
      <section className="app-pillar-grid" aria-label="Score pillars">
        {pillars.map((item) => (
          <button
            className={`pillar-card app-glass ${item.id === "harmony" ? "is-active" : ""} ${item.locked ? "is-locked" : ""}`}
            data-pillar={item.id}
            type="button"
            onClick={() =>
              item.locked ? onUnlock() : openView("analysis")
            }
            key={item.id}
          >
            <span className={`pillar-art pillar-art--${item.id}`} aria-hidden="true" />
            <span className="pillar-card__head">
              <i className={`pillar-mark pillar-mark--${item.id}`} />
              {item.label}
              <ArrowRight />
            </span>
            <strong aria-hidden={item.locked}>
              {item.score}
              <small>/10</small>
            </strong>
            {item.locked ? (
              <span className="pillar-unlock">
                <LockKeyhole /> Unlock your score
              </span>
            ) : (
              <span className="pillar-unlock pillar-unlock--open">
                <ArrowRight /> View harmony ratios
              </span>
            )}
          </button>
        ))}
      </section>

      <GlassCard className="overall-card">
        <header>
          <div>
            <span className="eyebrow">Overall score</span>
            <h1>{current.label}</h1>
          </div>
          <span className="overall-card__count">1 of 4 pillars</span>
        </header>
        <div className="overall-card__body">
          <div className="overall-score">
            <strong>{current.score}</strong>
            <span>/10</span>
            <p>{current.note}</p>
            <div className="score-portrait-pair">
              <figure>
                <img src={scanImage} alt="Your front scan" />
                <figcaption>Front</figcaption>
              </figure>
              <figure>
                <img src={scanImage} alt="Your side scan" className="is-side" />
                <figcaption>Side</figcaption>
              </figure>
            </div>
          </div>
          <div className="overall-distribution">
            <div className="overall-distribution__blur">
              <ScoreCurve />
              <div className="curve-legend">
                <span>Lower</span>
                <span>Reference range</span>
                <span>Higher</span>
              </div>
            </div>
            <button type="button" onClick={onUnlock}>
              <LockKeyhole /> See your reference position
            </button>
          </div>
        </div>
      </GlassCard>

      <section className="insight-grid">
        <InsightList kind="strength" items={strengths} />
        <InsightList kind="improve" items={improvements} />
      </section>

      <GlassCard className="score-card-lock">
        <div>
          <span className="eyebrow">Score card</span>
          <h2>Your card.</h2>
          <p>Save it. Share it.</p>
        </div>
        <div className="score-card-lock__preview">
          <LockKeyhole />
          <strong>Save your shareable analysis card</strong>
          <span>One image, ready to save or share.</span>
        </div>
        <button type="button" onClick={onUnlock}>
          Get access to the complete analysis <ArrowRight />
        </button>
      </GlassCard>
      <GlassCard className="pillar-progress-card">
        <div className="pillar-progress-mark">
          <span>H</span>
          <span>A</span>
          <span>D</span>
          <span>F</span>
        </div>
        <div>
          <span className="eyebrow">1 of 4 pillars analyzed</span>
          <h2>Complete your facial profile.</h2>
          <p>
            Finish every pillar for a more accurate understanding of your face.
          </p>
        </div>
        <button type="button" onClick={() => openView("analysis")}>
          Continue your analysis <ArrowRight />
        </button>
      </GlassCard>
    </div>
  );
}

function RatioModal({
  metric,
  index,
  total,
  scanImage,
  onClose,
}: {
  metric: RatioMetric;
  index: number;
  total: number;
  scanImage: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState("Overview");
  return (
    <div
      className="app-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ratio-modal-title"
    >
      <button
        className="app-modal__scrim"
        type="button"
        onClick={onClose}
        aria-label="Close ratio details"
      />
      <section className="ratio-modal app-glass">
        <header>
          <span>
            {index + 1} / {total}
          </span>
          <h2 id="ratio-modal-title">{metric.name}</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </header>
        <div className="ratio-modal__hero">
          <figure>
            <img src={scanImage} alt={`Your ${metric.name} measurement`} />
            <span>{metric.value}</span>
          </figure>
          <div className="ratio-modal__score">
            <span className="eyebrow">Score</span>
            <strong>
              {metric.score.toFixed(1)}
              <small>/10</small>
            </strong>
            <div className="ratio-range">
              <i
                style={{
                  left: `${Math.min(92, Math.max(8, metric.score * 10))}%`,
                }}
              />
              <span>Reference</span>
            </div>
            <b>{metric.value}</b>
            <p>Ideal {metric.ideal}</p>
          </div>
        </div>
        <nav>
          {["Overview", "Simulate", "Celebrities", "Edit"].map((item) => (
            <button
              className={tab === item ? "is-active" : ""}
              type="button"
              onClick={() => setTab(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </nav>
        {tab === "Overview" ? (
          <div className="ratio-modal__content">
            <div>
              <span className="eyebrow">About this ratio</span>
              <p>{metric.detail}</p>
            </div>
            <div>
              <span className="eyebrow">May indicate</span>
              <p>{metric.mayIndicate}</p>
            </div>
            <div>
              <span className="eyebrow">Affected measurements</span>
              <div className="ratio-chips">
                {metric.affected.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        ) : tab === "Simulate" ? (
          <div className="ratio-modal__empty">
            <WandSparkles />
            <h3>See a direction.</h3>
            <p>
              Open this measurement in Simulate to compare an illustrative
              change.
            </p>
          </div>
        ) : tab === "Celebrities" ? (
          <div className="ratio-modal__empty">
            <CircleUserRound />
            <h3>Reference examples.</h3>
            <p>Compare the ratio range, not a person's overall appearance.</p>
          </div>
        ) : (
          <div className="ratio-modal__empty">
            <SlidersHorizontal />
            <h3>Correct the landmark.</h3>
            <p>
              Adjust this measurement if the captured landmark is inaccurate.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function MeasurementLibrary({ onUnlock }: { onUnlock: () => void }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<MetricGroup | "All">("All");
  const [method, setMethod] = useState<MetricMethod | "All">("All");
  const [selected, setSelected] = useState<AnalysisMetric>(analysisCatalog[0]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return analysisCatalog.filter(
      (metric) =>
        (group === "All" || metric.group === group) &&
        (method === "All" || metric.method === method) &&
        (!term ||
          metric.name.toLowerCase().includes(term) ||
          metric.group.toLowerCase().includes(term)),
    );
  }, [group, method, query]);
  const counts = useMemo(
    () =>
      analysisCatalog.reduce(
        (total, metric) => ({
          ...total,
          [metric.method]: total[metric.method] + 1,
        }),
        { landmark: 0, scale: 0, profile: 0 },
      ),
    [],
  );

  return (
    <section className="metric-library" aria-label="Explore measurements">
      <GlassCard className="metric-library__head">
        <div>
          <span className="eyebrow">Explore measurements</span>
          <h1>{analysisCatalog.length} measurements mapped</h1>
          <p>See what the scan can measure—and where a different view or scale is needed.</p>
        </div>
        <dl>
          <div>
            <dt>2D landmark</dt>
            <dd>{counts.landmark}</dd>
          </div>
          <div>
            <dt>Needs scale</dt>
            <dd>{counts.scale}</dd>
          </div>
          <div>
            <dt>Side profile</dt>
            <dd>{counts.profile}</dd>
          </div>
        </dl>
      </GlassCard>
      <GlassCard className="metric-library__workspace">
        <div className="metric-library__toolbar">
          <label>
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search measurements"
              aria-label="Search measurements"
            />
          </label>
          <div className="metric-methods" aria-label="Measurement method">
            {(["All", "landmark", "scale", "profile"] as const).map(
              (item) => (
                <button
                  className={method === item ? "is-active" : ""}
                  type="button"
                  onClick={() => setMethod(item)}
                  key={item}
                >
                  {item === "All" ? "All methods" : methodLabels[item]}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="metric-groups" aria-label="Measurement categories">
          {(["All", ...metricGroups] as const).map((item) => (
            <button
              className={group === item ? "is-active" : ""}
              type="button"
              onClick={() => setGroup(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="metric-library__body">
          <div className="metric-catalog">
            {filtered.map((metric) => {
              const number = analysisCatalog.indexOf(metric) + 1;
              return (
                <button
                  className={selected.id === metric.id ? "is-active" : ""}
                  type="button"
                  onClick={() => setSelected(metric)}
                  key={metric.id}
                >
                  <span>{String(number).padStart(3, "0")}</span>
                  <div>
                    <strong>{metric.name}</strong>
                    <small>{metric.group}</small>
                  </div>
                  <em className={`metric-method metric-method--${metric.method}`}>
                    {methodLabels[metric.method]}
                  </em>
                  <ChevronDown />
                </button>
              );
            })}
            {!filtered.length && (
              <div className="metric-catalog__empty">
                <Search />
                <strong>No measurement matches this search.</strong>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setGroup("All");
                    setMethod("All");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
          <aside className="metric-detail">
            <span className={`metric-method metric-method--${selected.method}`}>
              {methodLabels[selected.method]}
            </span>
            <h2>{selected.name}</h2>
            <p>{selected.description}</p>
            <dl>
              <div>
                <dt>Capture needed</dt>
                <dd>{selected.view}</dd>
              </div>
              <div>
                <dt>Your result</dt>
                <dd className="is-locked">
                  <LockKeyhole /> Reveal this measurement
                </dd>
              </div>
            </dl>
            <div className="metric-limit">
              <CircleHelp />
              <p>{selected.limitation}</p>
            </div>
            <button type="button" onClick={onUnlock}>
              Get access to the complete analysis <ArrowRight />
            </button>
          </aside>
        </div>
      </GlassCard>
      <div className="measurement-policy">
        <strong>Measurement rules</strong>
        <span>No millimetres without scale calibration.</span>
        <span>No projection score without a side view or 3D.</span>
        <span>No skin diagnosis from a phone photo.</span>
        <span>No universal beauty score.</span>
      </div>
    </section>
  );
}

function UnlockModal({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<"unlocking" | "offer">("unlocking");

  useEffect(() => {
    const timer = window.setTimeout(() => setStage("offer"), 1050);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      className="app-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unlock-title"
    >
      <button
        className="app-modal__scrim"
        type="button"
        onClick={onClose}
        aria-label="Close unlock dialog"
      />
      <section className={`unlock-modal app-glass unlock-modal--${stage}`}>
        <button
          className="unlock-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          <X />
        </button>
        {stage === "unlocking" ? (
          <div className="unlock-loading" aria-live="polite">
            <div className="unlock-loading__visual" aria-hidden="true">
              <img src="/assets/doodee-analysis-glass-v1.png" alt="" />
              <span className="unlock-loading__scan" />
              <span className="unlock-loading__landmarks" />
              <div className="unlock-loading__pill">
                <i /> Unlocking…
              </div>
            </div>
            <div className="unlock-loading__copy">
              <span className="eyebrow">DOODEE Complete</span>
              <h2 id="unlock-title">Preparing the complete view.</h2>
              <p>Checking all {analysisCatalog.length} facial measurements.</p>
              <div className="unlock-loading__progress"><i /></div>
            </div>
          </div>
        ) : (
          <div className="unlock-offer">
            <div className="unlock-modal__heading">
              <div className="unlock-orb">
                <LockKeyhole />
              </div>
              <div>
                <span className="eyebrow">DOODEE Complete</span>
                <h2 id="unlock-title">See every measured detail.</h2>
                <p>85+ measurements, clear limits and a plan that keeps pace with your progress.</p>
              </div>
            </div>
            <div className="unlock-price">
              <strong>$19.99</strong>
              <span>/ month</span>
              <small>Monthly plan</small>
            </div>
            <ul>
              <li>
                <Check />
                All {analysisCatalog.length} measured factors
              </li>
              <li>
                <Check />
                Understand confidence, capture needs and limitations
              </li>
              <li>
                <Check />
                Personalized monthly improvement plan
              </li>
              <li>
                <Check />
                Illustrative previews and a consultation-ready report
              </li>
            </ul>
            <a href="/login">Get access to Complete <ArrowRight /></a>
            <button className="unlock-modal__free" type="button" onClick={onClose}>
              Continue with included analysis
            </button>
            <small>
              Educational guidance only. Results are not a diagnosis or a measure
              of human worth.
            </small>
          </div>
        )}
      </section>
    </div>
  );
}

function Analysis({
  scanImage,
  onUnlock,
  openView,
}: {
  scanImage: string;
  onUnlock: () => void;
  openView: (view: AppView) => void;
}) {
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("results");
  const [pillar, setPillar] = useState<PillarId>("harmony");
  const [angle, setAngle] = useState<FaceAngle>("front");
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState<RatioMetric | null>(
    null,
  );
  const list = ratios[pillar];
  const visible = showAll ? list : list.slice(0, 7);
  const pillarLocked = pillar !== "harmony";

  useEffect(() => {
    setShowAll(false);
    setActiveIndex(0);
  }, [pillar, angle]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedMetric(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <div className="app-view analysis-view analysis-view--deep">
      <nav className="analysis-pillar-nav" aria-label="Analysis pillars">
        {pillars.map((item) => (
          <button
            className={
              analysisMode === "results" && pillar === item.id
                ? "is-active"
                : ""
            }
            type="button"
            onClick={() => {
              setAnalysisMode("results");
              setPillar(item.id);
            }}
            key={item.id}
          >
            {item.label}
            {item.locked && <LockKeyhole />}
          </button>
        ))}
        <button
          className={analysisMode === "library" ? "is-active" : ""}
          type="button"
          onClick={() => {
            setAnalysisMode("library");
            setSelectedMetric(null);
          }}
        >
          All {analysisCatalog.length}
        </button>
      </nav>
      <div
        className={`analysis-results ${analysisMode === "library" ? "is-hidden" : ""}`}
      >
      <GlassCard className="analysis-profile-strip">
        <button
          className={angle === "front" ? "is-active" : ""}
          type="button"
          onClick={() => setAngle("front")}
        >
          <img src={scanImage} alt="Front view" />
          <span>
            <small>Front</small>
            <strong>{pillar === "harmony" ? "7.4" : "Locked"}</strong>
          </span>
        </button>
        <button
          className={angle === "side" ? "is-active" : ""}
          type="button"
          onClick={() => setAngle("side")}
        >
          <img className="is-side" src={scanImage} alt="Side view" />
          <span>
            <small>Side</small>
            <strong>5.9</strong>
          </span>
        </button>
        <div>
          <span className="eyebrow">{analysisCatalog.length} measurements mapped</span>
          <strong>
            {pillars.find((item) => item.id === pillar)?.label} analysis
          </strong>
          <small>
            {angle === "front" ? "Front ratios" : "Side-profile ratios"}
          </small>
        </div>
      </GlassCard>

      <div className="analysis-deep-layout">
        <GlassCard
          className={`analysis-face-card analysis-face-card--${angle}`}
        >
          <img src={scanImage} alt={`Your ${angle} facial analysis`} />
          <svg viewBox="0 0 600 760" aria-hidden="true">
            <path d="M145 230H455M130 327H470M157 468H443M188 596H412M300 185V630" />
            <circle cx="300" cy="327" r="5" />
            <circle cx="300" cy="468" r="5" />
          </svg>
          <div className="analysis-face-overlay">
            <span>
              {angle} {pillars.find((item) => item.id === pillar)?.label}
            </span>
            <strong>
              {pillarLocked
                ? "Locked"
                : `${list[activeIndex]?.score.toFixed(1)}/10`}
            </strong>
            <small>{list[activeIndex]?.name}</small>
          </div>
          <div className="analysis-face-controls">
            <button
              type="button"
              onClick={() => setAngle("front")}
              aria-label="Previous angle"
            >
              <ArrowLeft />
            </button>
            <button
              type="button"
              onClick={() => setAngle(angle === "front" ? "side" : "front")}
              aria-label="Reset angle"
            >
              <RefreshCw />
            </button>
            <button
              type="button"
              onClick={() => setAngle("side")}
              aria-label="Next angle"
            >
              <ArrowRight />
            </button>
          </div>
        </GlassCard>

        <GlassCard className="ratio-panel">
          <header>
            <div>
              <span className="eyebrow">
                Understanding{" "}
                {pillars.find((item) => item.id === pillar)?.label}
              </span>
              <h1>Your {angle === "front" ? "Front" : "Side"} Ratios</h1>
            </div>
            <div>
              <button type="button" onClick={() => openView("doodeegpt")}>
                <MessageCircle /> Ask DOODEE GPT
              </button>
              <button className="ratio-unlock" type="button" onClick={onUnlock}>
                <LockKeyhole /> Get access to 70+ ratios
              </button>
            </div>
          </header>
          <p className="ratio-panel__intro">
            {pillar === "harmony"
              ? "How your features work together as one face."
              : pillar === "angularity"
                ? "Shape, projection and definition across your facial structure."
                : pillar === "dimorphism"
                  ? "How selected traits compare with your chosen reference."
                  : "The individual proportions that shape your overall appearance."}
          </p>
          <div className="ratio-list">
            {visible.map((metric, index) => {
              const locked = pillarLocked || index > 2;
              return (
                <button
                  className={`ratio-row ${activeIndex === index ? "is-active" : ""} ${locked ? "is-locked" : ""}`}
                  type="button"
                  onPointerEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() =>
                    locked ? onUnlock() : setSelectedMetric(metric)
                  }
                  key={metric.id}
                >
                  <span>
                    <strong>{metric.name}</strong>
                    <small>{metric.status}</small>
                  </span>
                  <div className="ratio-row__track">
                    <i style={{ width: `${metric.score * 10}%` }} />
                    <b style={{ left: `${metric.score * 10}%` }} />
                  </div>
                  <em>{locked ? <LockKeyhole /> : metric.value}</em>
                  <span className="ratio-score">
                    {locked ? "?.?" : metric.score.toFixed(1)}
                  </span>
                  <ChevronDown />
                </button>
              );
            })}
          </div>
          {list.length > 7 && (
            <button
              className="ratio-show-more"
              type="button"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll
                ? "Show fewer ratios"
                : `Show ${list.length - 7} more ratios`}
              <ChevronDown />
            </button>
          )}
        </GlassCard>
      </div>

      <section className="analysis-insight-stack">
        <InsightList kind="strength" items={strengths} />
        <InsightList kind="improve" items={improvements} />
      </section>
      <GlassCard className="continue-analysis">
        <div className="continue-analysis__letters">
          <span className="is-done">H</span>
          <span>A</span>
          <span>D</span>
          <span>F</span>
        </div>
        <div>
          <span className="eyebrow">Progress</span>
          <h2>1 of 4 pillars analyzed</h2>
          <p>Explore each pillar for a fuller view of your face.</p>
        </div>
        <div className="continue-analysis__actions">
          <button type="button" onClick={() => setPillar("angularity")}>
            Explore Angularity
          </button>
          <button type="button" onClick={() => setPillar("dimorphism")}>
            Explore Dimorphism
          </button>
          <button type="button" onClick={() => setPillar("features")}>
            Explore Features
          </button>
        </div>
      </GlassCard>
      {selectedMetric && (
        <RatioModal
          metric={selectedMetric}
          index={list.findIndex((item) => item.id === selectedMetric.id)}
          total={list.length}
          scanImage={scanImage}
          onClose={() => setSelectedMetric(null)}
        />
      )}
      </div>
      {analysisMode === "library" && <MeasurementLibrary onUnlock={onUnlock} />}
    </div>
  );
}

function Plan({
  scanImage,
  onUnlock,
}: {
  scanImage: string;
  onUnlock: () => void;
}) {
  const [mode, setMode] = useState("Timeline");
  const [open, setOpen] = useState(0);
  return (
    <div className="app-view plan-view plan-view--deep">
      <div className="app-page-title">
        <span className="eyebrow">Your plan</span>
        <h1>Know what to do next.</h1>
        <p>Prioritized by impact, effort and estimated value.</p>
      </div>
      <GlassCard className="potential-card potential-card--deep">
        <div>
          <span className="eyebrow">Current</span>
          <strong>
            7.4 <small>today</small>
          </strong>
        </div>
        <ArrowRight />
        <div>
          <span className="eyebrow">Your target</span>
          <strong>
            8.2 <small>with your plan</small>
          </strong>
        </div>
        <div className="potential-profile">
          <img src={scanImage} alt="Front profile" />
          <img className="is-side" src={scanImage} alt="Side profile" />
        </div>
        <div className="potential-meta">
          <span>
            <b>{planActions.length}</b> actions
          </span>
          <span>
            <b>$0–$1.5k</b> estimated investment
          </span>
          <span>
            <b>94%</b> coverage
          </span>
        </div>
        <div className="potential-track">
          <span />
        </div>
      </GlassCard>
      <div className="plan-mode">
        <div>
          {["Population", "Timeline", "Impact"].map((item) => (
            <button
              className={mode === item ? "is-active" : ""}
              type="button"
              onClick={() => setMode(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        <span>
          {mode === "Timeline"
            ? "Track what you change and what follows"
            : mode === "Impact"
              ? "Highest expected impact first"
              : "Compared with your reference group"}
        </span>
      </div>
      <GlassCard className="plan-timeline">
        <header>
          <div>
            <span className="eyebrow">Your timeline</span>
            <h2>Top actions in your plan</h2>
          </div>
          <button type="button" onClick={onUnlock}>
            <LockKeyhole /> Get access to full analysis
          </button>
        </header>
        <div className="plan-action-list">
          {planActions.map((action, index) => (
            <article
              className={`${open === index ? "is-open" : ""} ${action.locked ? "is-locked" : ""}`}
              key={action.title}
            >
              <button
                className="plan-action-main"
                type="button"
                onClick={() =>
                  action.locked
                    ? onUnlock()
                    : setOpen(open === index ? -1 : index)
                }
              >
                <span className="plan-action-number">{index + 1}</span>
                <div>
                  <strong>{action.title}</strong>
                  <span
                    className={`plan-category plan-category--${action.category.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {action.category}
                  </span>
                  <p>{action.detail}</p>
                </div>
                <b>{action.locked ? <LockKeyhole /> : action.impact}</b>
                <ChevronDown />
              </button>
              <div className="plan-action-detail">
                <span>
                  <small>Expected impact</small>
                  <b>{action.impact} pts</b>
                </span>
                <span>
                  <small>Estimated investment</small>
                  <b>{action.cost}</b>
                </span>
                <span>
                  <small>Time or recovery</small>
                  <b>{action.time}</b>
                </span>
                <button type="button">
                  See details <ArrowRight />
                </button>
              </div>
            </article>
          ))}
        </div>
      </GlassCard>
      <p className="education-note">
        <CircleHelp /> Educational guidance only. Discuss medical options with a
        qualified professional.
      </p>
    </div>
  );
}

function Simulate({
  scanImage,
  notify,
}: {
  scanImage: string;
  notify: (text: string) => void;
}) {
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const generate = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      notify(`${treatments[selected]} preview is ready`);
    }, 700);
  };
  return (
    <div className="app-view simulate-view">
      <div className="app-page-title">
        <span className="eyebrow">Simulation</span>
        <h1>Explore a direction.</h1>
        <p>Illustrative possibilities, kept separate from your score.</p>
      </div>
      <div className="simulate-layout">
        <GlassCard className="treatment-picker">
          <header>
            <h2>Treatments</h2>
            <SlidersHorizontal />
          </header>
          {treatments.map((item, index) => (
            <button
              className={selected === index ? "is-active" : ""}
              type="button"
              onClick={() => setSelected(index)}
              key={item}
            >
              <span>{index + 1}</span>
              {item}
              <ArrowRight />
            </button>
          ))}
        </GlassCard>
        <GlassCard className="simulation-stage">
          <div className={`simulation-image ${loading ? "is-loading" : ""}`}>
            <img src={scanImage} alt="Illustrative treatment simulation" />
            <span>Current</span>
            <span>Preview</span>
            <i />
          </div>
          <footer>
            <div>
              <small>Selected direction</small>
              <strong>{treatments[selected]}</strong>
            </div>
            <button type="button" onClick={generate} disabled={loading}>
              {loading ? (
                <RefreshCw className="is-spinning" />
              ) : (
                <WandSparkles />
              )}
              {loading ? "Generating" : "Generate preview"}
            </button>
          </footer>
        </GlassCard>
      </div>
      <GlassCard className="simulation-note">
        <CircleHelp />
        <div>
          <strong>Possibilities, not promises.</strong>
          <p>Previews are illustrative and do not predict a medical outcome.</p>
        </div>
      </GlassCard>
    </div>
  );
}

function DoodeeGPT({ scanImage }: { scanImage: string }) {
  const suggestions = [
    "What's my harmony score?",
    "What are my strongest features?",
    "How can I improve first?",
    "Explain my jaw assessment",
    "Which options should I discuss?",
    "Build a simple 30-day plan",
  ];
  const [value, setValue] = useState("");
  const [mode, setMode] = useState("Normal");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const submit = (text = value) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((items) => [...items, { role: "user", text: clean }]);
    setValue("");
    window.setTimeout(
      () =>
        setMessages((items) => [
          ...items,
          {
            role: "assistant",
            text: "Your harmony score is 7.4/10. Eye separation and mouth width are your strongest measured areas. Chin projection has the clearest opportunity, but start with practical changes before considering a procedure.",
          },
        ]),
      420,
    );
  };
  return (
    <div className="app-view gpt-view">
      <GlassCard className="gpt-history">
        <header>
          <div className="gpt-mini-brand">
            <ScanFace />
            <strong>DOODEE GPT</strong>
          </div>
          <button type="button" onClick={() => setMessages([])}>
            <Plus /> New chat
          </button>
        </header>
        <label>
          <Search />
          <input placeholder="Search chats" />
        </label>
        <span className="eyebrow">Recent</span>
        {messages.length ? (
          <button className="gpt-history-item" type="button">
            <MessageCircle />
            <span>
              <strong>{messages[0].text}</strong>
              <small>Just now</small>
            </span>
          </button>
        ) : (
          <div className="gpt-history-empty">
            <MessageCircle />
            <p>No chat history yet</p>
            <small>Start a conversation to see it here.</small>
          </div>
        )}
        <a href="/app#overview">
          <ArrowLeft /> Back to dashboard
        </a>
      </GlassCard>
      <GlassCard className="gpt-chat">
        <header>
          <button
            className="gpt-mode"
            type="button"
            onClick={() =>
              setMode(mode === "Normal" ? "Deep analysis" : "Normal")
            }
          >
            <SlidersHorizontal /> {mode}
            <ChevronDown />
          </button>
          <div>
            <img src={scanImage} alt="Your analysis profile" />
            <span>
              <strong>My analysis</strong>
              <small>85+ measurements connected</small>
            </span>
          </div>
        </header>
        <div
          className={`gpt-conversation ${messages.length ? "has-messages" : ""}`}
        >
          {messages.length ? (
            messages.map((message, index) => (
              <div
                className={`gpt-message is-${message.role}`}
                key={`${message.role}-${index}`}
              >
                {message.role === "assistant" && (
                  <span>
                    <ScanFace />
                  </span>
                )}
                <p>{message.text}</p>
              </div>
            ))
          ) : (
            <div className="gpt-empty">
              <div className="gpt-orb">
                <MessageCircle />
              </div>
              <span className="eyebrow">DOODEE GPT</span>
              <h1>Ready to understand your face?</h1>
              <p>Ask about your measurements, plan and preview directions.</p>
              <div className="gpt-suggestions">
                {suggestions.map((item) => (
                  <button type="button" onClick={() => submit(item)} key={item}>
                    {item}
                    <ArrowRight />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            aria-label="Attach file"
          >
            <Paperclip />
          </button>
          <input
            ref={fileRef}
            type="file"
            hidden
            onChange={(event) =>
              setFileName(event.target.files?.[0]?.name ?? "")
            }
          />
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={fileName || "Ask anything"}
            aria-label="Ask DOODEE GPT"
            rows={1}
          />
          <button type="submit" aria-label="Send" disabled={!value.trim()}>
            <ArrowRight />
          </button>
        </form>
        <small className="gpt-disclaimer">
          DOODEE GPT can make mistakes. Medical decisions require a qualified
          professional.
        </small>
      </GlassCard>
    </div>
  );
}

export default function DashboardPage() {
  const [scanImage, setScanImage] = useState(getStoredScan);
  const [view, setView] = useState<AppView>(getInitialView);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [toolPanel, setToolPanel] = useState<"settings" | "help" | null>(null);
  const [toast, setToast] = useState("");
  const activeLabel = useMemo(
    () => views.find((item) => item.id === view)?.label ?? "Overview",
    [view],
  );

  useEffect(() => {
    if (!scanImage) window.location.replace("/scan");
  }, [scanImage]);
  useEffect(() => {
    const onHash = () => setView(getInitialView());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUnlockOpen(false);
        setToolPanel(null);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const openView = (next: AppView) => {
    setView(next);
    setMenuOpen(false);
    setToolPanel(null);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#${next}`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const notify = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 1800);
  };
  const share = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
    notify("Analysis link copied");
  };
  const clearScan = () => {
    try {
      window.sessionStorage.removeItem("doodee:last-scan-front");
    } catch {}
    setScanImage(null);
  };

  if (!scanImage)
    return <main className="doodee-app doodee-app--handoff" aria-busy="true" />;
  return (
    <main className="doodee-app">
      <aside className={`app-sidebar ${menuOpen ? "is-open" : ""}`}>
        <div className="sidebar-head">
          <Brand href="/app" />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>
        <div className="sidebar-profile">
          <CircleUserRound />
          <span>
            <strong>My analysis</strong>
            <small>Included analysis</small>
          </span>
          <Settings2 />
        </div>
        <button
          className="sidebar-upgrade"
          type="button"
          onClick={() => setUnlockOpen(true)}
        >
          <Sparkles /> Get access to the complete analysis
        </button>
        <div className="sidebar-section">
          <span>History</span>
          <a className="sidebar-new" href="/scan">
            <Plus /> New scan
          </a>
        </div>
        <button
          className="history-card is-active"
          type="button"
          onClick={() => openView("overview")}
        >
          <img src={scanImage} alt="Latest scan" />
          <span>
            <strong>Latest scan</strong>
            <small>Just now · 7.4</small>
          </span>
          <ArrowRight />
        </button>
        <nav className="sidebar-nav" aria-label="Dashboard">
          <span>Explore</span>
          {views.map((item) => (
            <button
              className={view === item.id ? "is-active" : ""}
              type="button"
              onClick={() => openView(item.id)}
              key={item.id}
            >
              {item.id === "overview" ? (
                <LayoutGrid />
              ) : item.id === "analysis" ? (
                <BarChart3 />
              ) : item.id === "plan" ? (
                <Target />
              ) : item.id === "simulate" ? (
                <WandSparkles />
              ) : (
                <MessageCircle />
              )}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button type="button" onClick={clearScan}>
            Delete scan
          </button>
        </div>
      </aside>
      <div className="app-shell">
        <header className="app-topbar">
          <button
            className="app-menu"
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <span className="app-mobile-title">{activeLabel}</span>
          <nav aria-label="Analysis sections">
            {views.map((item) => (
              <button
                className={view === item.id ? "is-active" : ""}
                type="button"
                onClick={() => openView(item.id)}
                key={item.id}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="app-tools">
            <button type="button" onClick={share} aria-label="Share">
              <Share2 />
            </button>
            <button
              type="button"
              onClick={() =>
                setToolPanel(toolPanel === "settings" ? null : "settings")
              }
              aria-label="Settings"
            >
              <Settings2 />
            </button>
            <button
              type="button"
              onClick={() => setToolPanel(toolPanel === "help" ? null : "help")}
              aria-label="Help"
            >
              <CircleHelp />
            </button>
            {toolPanel && (
              <div className="app-tool-panel">
                <strong>
                  {toolPanel === "settings"
                    ? "Analysis settings"
                    : "Need help?"}
                </strong>
                <p>
                  {toolPanel === "settings"
                    ? "Reference: Male · Global"
                    : "Review capture guidance or contact support."}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    notify(
                      toolPanel === "settings"
                        ? "Settings saved"
                        : "Help center opened",
                    )
                  }
                >
                  {toolPanel === "settings" ? "Save settings" : "Open help"}
                </button>
              </div>
            )}
          </div>
        </header>
        <div className="app-content">
          {view === "overview" && (
            <Overview
              scanImage={scanImage}
              openView={openView}
              onUnlock={() => setUnlockOpen(true)}
            />
          )}
          {view === "analysis" && (
            <Analysis
              scanImage={scanImage}
              openView={openView}
              onUnlock={() => setUnlockOpen(true)}
            />
          )}
          {view === "plan" && (
            <Plan scanImage={scanImage} onUnlock={() => setUnlockOpen(true)} />
          )}
          {view === "simulate" && (
            <Simulate scanImage={scanImage} notify={notify} />
          )}
          {view === "doodeegpt" && <DoodeeGPT scanImage={scanImage} />}
        </div>
      </div>
      {menuOpen && (
        <button
          className="app-scrim"
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}
      {unlockOpen && <UnlockModal onClose={() => setUnlockOpen(false)} />}
      {toast && (
        <div className="app-toast" role="status">
          <Check />
          {toast}
        </div>
      )}
    </main>
  );
}
