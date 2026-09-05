// Dates arrive from PostgREST as plain "YYYY-MM-DD" strings. They are read as
// text rather than passed through `new Date`, which parses a bare date as UTC
// midnight and can report the previous month for anyone west of Greenwich.
const parts = (value) => {
  const match = /^(\d{4})-(\d{2})/.exec(String(value || ""));
  return match ? { year: match[1], month: match[2] } : null;
};

export const formatMonth = (value) => {
  const found = parts(value);
  return found ? `${found.year}.${found.month}` : "";
};

export const startYear = (experience) => parts(experience?.start_date)?.year || "";

// "2026.09 – Present" for a current role, "2025.11 – 2026.03" otherwise, and
// just the start when an ended role has no end date recorded.
export const formatPeriod = (experience) => {
  const from = formatMonth(experience?.start_date);
  if (!from) return "";
  if (experience?.is_current) return `${from} – Present`;
  const to = formatMonth(experience?.end_date);
  return to ? `${from} – ${to}` : from;
};

// The span shown beside the section heading, derived from the entries rather
// than written down anywhere.
export const formatSpan = (experiences) => {
  const years = experiences.map(startYear).filter(Boolean);
  if (!years.length) return "";
  const first = years.reduce((low, year) => (year < low ? year : low));
  if (experiences.some((experience) => experience.is_current)) return `${first} – Now`;
  const ends = experiences
    .map((experience) => parts(experience.end_date)?.year)
    .filter(Boolean);
  const last = ends.length ? ends.reduce((high, year) => (year > high ? year : high)) : first;
  return first === last ? first : `${first} – ${last}`;
};

export const currentRole = (experiences) =>
  experiences.find((experience) => experience.is_current) || null;

// Highlights are stored as [{ label, body }]. Anything that is not a usable
// pair is dropped, so a half-filled row cannot render an empty block.
export const readHighlights = (experience) => {
  const raw = experience?.highlights;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => ({
      label: String(item?.label || "").trim(),
      body: String(item?.body || "").trim(),
    }))
    .filter((item) => item.label && item.body);
};

// UNIVERSITY or INDUSTRY, read from the organization name rather than stored
// in a column. Deriving it means a new entry is labelled correctly without
// anyone remembering to set a field, and there is no way for the label and
// the organization to disagree.
const ACADEMIC = /universit|college|\buniv\b|\bacademy\b|\binstitute\b/i;

export const sectorFor = (experience) =>
  ACADEMIC.test(experience?.organization || "") ? "University" : "Industry";
