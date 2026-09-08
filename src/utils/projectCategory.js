// Project types shown as filter chips on the projects page.
//
// A project can carry several types at once (Ayokost is both a retrieval
// system and a full-stack product), so filtering matches any tag rather than
// forcing each project into one bucket.
//
// Tags come from the project's `Categories` (array) or `Category` (string, or
// comma-separated) column in Supabase when either is filled in. Otherwise they
// are inferred from the project's TechStack and Title using the rules below.
// Every rule that matches contributes a tag.
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
      "forecast",
      "time series",
      "whisper",
      "silero",
    ],
  },
  {
    label: "Computer Vision",
    keywords: ["opencv", "mediapipe", "cvzone", "cnn", "yolo", "inksight"],
  },
  {
    label: "Full-Stack",
    keywords: [
      "next.js",
      "react",
      "typescript",
      "node",
      "supabase",
      "tailwind",
      "fastapi",
      "express",
      "html",
      "javascript",
      "uvicorn",
      "vite",
    ],
  },
  {
    label: "Data & Analytics",
    keywords: [
      "pandas",
      "numpy",
      "seaborn",
      "matplotlib",
      "jupyter",
      "sql",
      "streamlit",
      "tableau",
      "folium",
      "power bi",
      "looker",
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
