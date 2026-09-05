// The stack, in two shapes: a curated set for the moving strip on the landing
// page, and the full categorised reference for /stack. The landing page is a
// teaser, so it deliberately shows a fraction of the list.

// `slug` names an icon in /public/icons, vendored from Simple Icons. The mark
// is rendered as a CSS mask so every logo takes the current text colour rather
// than arriving as a wall of brand colours. Items with no slug are techniques
// or formats rather than branded products, and get a neutral marker instead.
export const MARQUEE_ROWS = [
  [
    { name: "Python", slug: "python" },
    { name: "PyTorch", slug: "pytorch" },
    { name: "Hugging Face", slug: "huggingface" },
    { name: "FastAPI", slug: "fastapi" },
    { name: "Django", slug: "django" },
    { name: "PostgreSQL", slug: "postgresql" },
  ],
  [
    { name: "React", slug: "react" },
    { name: "Next.js", slug: "nextdotjs" },
    { name: "TypeScript", slug: "typescript" },
    { name: "Docker", slug: "docker" },
    { name: "Supabase", slug: "supabase" },
    { name: "Tailwind CSS", slug: "tailwindcss" },
  ],
];

export const STACK_CATEGORIES = [
  {
    number: "01",
    title: "AI & Machine Learning",
    path: "ai/",
    description: "Model development, retrieval, evaluation, and applied AI systems.",
    note: "models to real-world systems",
    items: [
      { name: "Python", slug: "python" },
      { name: "PyTorch", slug: "pytorch" },
      { name: "Hugging Face", slug: "huggingface" },
      { name: "RAG" },
      { name: "FAISS" },
      { name: "Sentence Transformers" },
      { name: "TensorFlow", slug: "tensorflow" },
      { name: "scikit-learn", slug: "scikitlearn" },
      { name: "XGBoost" },
      { name: "OpenCV", slug: "opencv" },
      { name: "MediaPipe", slug: "mediapipe" },
    ],
  },
  {
    number: "02",
    title: "Backend",
    path: "backend/",
    description: "APIs, services, authentication, and application logic.",
    note: "APIs and services",
    items: [
      { name: "Django", slug: "django" },
      { name: "FastAPI", slug: "fastapi" },
      { name: "Node.js", slug: "nodedotjs" },
      { name: "Supabase", slug: "supabase" },
    ],
  },
  {
    number: "03",
    title: "Frontend",
    path: "frontend/",
    description: "Interfaces and user-facing product development.",
    note: "interfaces people use",
    items: [
      { name: "React", slug: "react" },
      { name: "Next.js", slug: "nextdotjs" },
      { name: "TypeScript", slug: "typescript" },
      { name: "JavaScript", slug: "javascript" },
      { name: "Tailwind CSS", slug: "tailwindcss" },
    ],
  },
  {
    number: "04",
    title: "Data & Databases",
    path: "data/",
    description: "Data storage, processing, and application data flows.",
    note: "data flows",
    items: [
      { name: "PostgreSQL", slug: "postgresql" },
      { name: "SQL" },
      { name: "Oracle", slug: "oracle" },
      { name: "Pandas", slug: "pandas" },
      { name: "NumPy", slug: "numpy" },
    ],
  },
  {
    number: "05",
    title: "Infrastructure & Tools",
    path: "infra/",
    description: "Development, deployment, and collaboration.",
    note: "build and deploy",
    items: [
      { name: "Docker", slug: "docker" },
      { name: "Git", slug: "git" },
      { name: "AWS", slug: "amazonwebservices" },
    ],
  },
];
