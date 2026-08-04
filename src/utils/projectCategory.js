// Project types shown as filter chips in the Portfolio Showcase.
//
// A project can carry several types at once — Ayokost is both an AI/LLM project
// and a web platform — so filtering matches any tag rather than one bucket.
//
// Tags come from the project's `Categories` (array) or `Category` (string, or
// comma-separated) column in Supabase when either is filled in. Otherwise they
// are inferred from the project's TechStack and Title using the rules below.
// Every rule that matches contributes a tag.
const TAG_RULES = [
  {
    label: "Machine Learning",
    keywords: ["scikit-learn", "sklearn", "xgboost", "statsmodels", "pmdarima", "tf-idf"],
  },
  {
    label: "Deep Learning & CV",
    keywords: [
      "pytorch",
      "tensorflow",
      "keras",
      "conformer",
      "bilstm",
      "ctc",
      "cnn",
      "opencv",
      "mediapipe",
      "cvzone",
      "inksight",
    ],
  },
  {
    label: "NLP & LLM",
    keywords: [
      "rag",
      "llama",
      "groq",
      "faiss",
      "hugging face",
      "sentence transformer",
      "tf-idf",
    ],
  },
  {
    label: "Forecasting",
    keywords: ["forecast", "time series", "pmdarima", "statsmodels"],
  },
  {
    label: "Data Analysis",
    keywords: ["pandas", "seaborn", "jupyter", "sql"],
  },
  {
    label: "Dashboards",
    keywords: ["streamlit", "tableau", "folium", "power bi", "looker"],
  },
  {
    label: "Web Development",
    keywords: [
      "next.js",
      "react",
      "typescript",
      "node",
      "supabase",
      "tailwind",
      "fastapi",
      "html",
      "javascript",
      "uvicorn",
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

  // Title is included so intent that never shows up as a library — "Forecasting"
  // — still gets picked up.
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
