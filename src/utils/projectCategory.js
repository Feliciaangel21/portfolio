// Project types shown as filter chips on the projects page.
//
// A project can carry several types at once (Ayokost is both a retrieval
// system and a full-stack product), so filtering matches any tag rather than
// forcing each project into one bucket.
//
// Tags are inferred from the project's TechStack and Title using the rules
// below; every rule that matches contributes a tag. A `Categories` (array) or
// `Category` (comma-separated string) column overrides the inference, but the
// table has no such column yet, so today every tag is inferred.
//
// A keyword only belongs here if it tells the categories apart. pandas, numpy,
// seaborn, matplotlib and jupyter are in almost every Python project on this
// site, so keying "Data & Analytics" off them tagged four modelling projects
// as analytics work: a CNN paper implementation and a gesture-control system
// were being filed next to an Airbnb EDA notebook. Generic plumbing is left
// out, and intent that never appears as a library is matched from the title
// instead.
//
// Ordered by how much weight each carries for an AI engineering role: the
// chips render in this order, so retrieval and model work lead.
const TAG_RULES = [
  {
    // Agent work leads, since it is the strongest signal for the roles this
    // portfolio is aimed at. "agent" matches on a leading word boundary, so
    // it fires on "Agentic" and "Multi-Agent" without catching "urgent".
    label: "Agentic AI",
    keywords: [
      "agentic",
      "multi-agent",
      "agent",
      "negotiation",
      "autogen",
      "crewai",
      "bedrock",
    ],
  },
  {
    label: "LLM & RAG",
    keywords: [
      "rag",
      "llama",
      "groq",
      "faiss",
      "hugging face",
      "huggingface",
      "sentence transformer",
      "langchain",
      "openai",
      "anthropic",
      "embedding",
      "vector",
      "prompt",
      "qwen",
      "bge",
    ],
  },
  {
    label: "Machine Learning",
    keywords: [
      "scikit-learn",
      "sklearn",
      "xgboost",
      "statsmodels",
      "pmdarima",
      "tf-idf",
      "pytorch",
      "tensorflow",
      "keras",
      "conformer",
      "bilstm",
      "ctc",
      "whisper",
      "silero",
      "forecast",
      "time series",
    ],
  },
  {
    label: "Computer Vision",
    keywords: ["opencv", "mediapipe", "cvzone", "cnn", "yolo", "inksight"],
  },
  {
    // Server and data layers only. Every front end here is React with
    // TypeScript, so matching those claimed a full stack for work that is
    // browser-only; something has to be serving or storing.
    label: "Full-Stack",
    keywords: [
      "next.js",
      "node",
      "fastapi",
      "express",
      "django",
      "flask",
      "uvicorn",
      "supabase",
      "postgresql",
      "oracle",
    ],
  },
  {
    // Tools someone reaches for when the deliverable is the analysis, plus
    // the intent words, since "Data Analysis" is a title, not a dependency.
    label: "Data & Analytics",
    keywords: [
      "streamlit",
      "tableau",
      "power bi",
      "looker",
      "folium",
      "sql",
      "dashboard",
      "analysis",
      "analytics",
      "eda",
    ],
  },
];

const FALLBACK_TAG = "Other";

// Tags set by hand in Supabase, in either supported shape.
const explicitTags = (project) => {
  if (Array.isArray(project?.Categories)) return project.Categories.filter(Boolean);
  if (typeof project?.Category === "string" && project.Category.trim()) {
    return project.Category.split(",").map((tag) => tag.trim()).filter(Boolean);
  }
  return null;
};

// Matched on a leading word boundary so "sql" does not fire on "PostgreSQL",
// while trailing plurals still count ("forecast" matches "Forecasting").
const matchesKeyword = (haystack, keyword) => {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}`).test(haystack);
};

export const getProjectTags = (project) => {
  const explicit = explicitTags(project);
  if (explicit?.length) return explicit;

  // Title is included so intent that never shows up as a library ("Forecasting")
  // still gets picked up.
  const haystack = [...(project?.TechStack || []), project?.Title || ""]
    .join(" ")
    .toLowerCase();

  const matched = TAG_RULES.filter((rule) =>
    rule.keywords.some((keyword) => matchesKeyword(haystack, keyword))
  ).map((rule) => rule.label);

  return matched.length ? matched : [FALLBACK_TAG];
};

export const projectHasTag = (project, tag) => getProjectTags(project).includes(tag);

// Tags present in the given projects, kept in TAG_RULES order so the chips do
// not reshuffle when the project list changes.
export const getAvailableTags = (projects) => {
  const present = new Set(projects.flatMap(getProjectTags));
  const ordered = TAG_RULES.map((rule) => rule.label).filter((label) => present.has(label));

  present.forEach((label) => {
    if (!ordered.includes(label) && label !== FALLBACK_TAG) ordered.push(label);
  });

  if (present.has(FALLBACK_TAG)) ordered.push(FALLBACK_TAG);

  return ordered;
};

// Category colour coding. Only the three domains that define the work get a
// hue; everything else stays neutral, so colour reads as information rather
// than decoration.
const TAG_TONES = {
  "LLM & RAG": "text-accent",
  "Machine Learning": "text-sea",
  "Computer Vision": "text-ochre",
};

export const getTagTone = (tag) => TAG_TONES[tag] || "text-ink-muted";
