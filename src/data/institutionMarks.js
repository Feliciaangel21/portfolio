// Organization marks, keyed by the organization name exactly as it is stored
// in `work_experiences`. Adding an entry here is all it takes to give a new
// organization a mark; nothing in the components changes.
//
// The Korea University file is the university's own global symbol, recoloured
// to the page's single crimson so it sits in the palette rather than arriving
// in its own. It is used nominatively, to say where the work happened.
//
// Companies are deliberately absent. A timeline studded with assorted
// corporate logos loses its typographic rhythm, and the UNIVERSITY / INDUSTRY
// labels already carry that distinction.
const MARKS = {
  "korea university": { src: "/ku-symbol.svg", width: 19, height: 26 },
};

export const markFor = (organization) =>
  MARKS[String(organization || "").trim().toLowerCase()] || null;
