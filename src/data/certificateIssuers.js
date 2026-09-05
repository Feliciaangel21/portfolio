// Who issued each certificate. This is not a column on the `certificates`
// table, which stores only an id and an image, so it is read from the stored
// file path instead.
//
// Uploads made through the admin are named `<issuer>--<uuid>.<ext>`, which
// makes this exact for anything added from now on. Coursera and Udemy also
// name their own downloads predictably, so those are matched directly. The
// handful of rows that predate all of that are listed by id below.
export const ISSUERS = ["AWS", "Coursera", "Udemy", "Other"];

export const slugFor = (issuer) => issuer.toLowerCase();

// Verified against the certificate images themselves, not guessed from the
// file names, which are opaque UUIDs for these rows.
const LEGACY_BY_ID = {
  1: "Udemy", // The Complete 2021 Web Development Bootcamp
  14: "AWS", // AWS Technical Essentials
  15: "Coursera", // Generative AI with Large Language Models
  16: "AWS", // Building Agentic AI with Amazon Bedrock AgentCore
  17: "Other", // Daewoong Foundation scholarship
};

// The certificates table stores only an image, so the course names below were
// read off the certificates themselves rather than guessed from file names.
// A `Title` column, if one is ever added, takes priority over this map, and a
// certificate that is not listed here simply shows no caption rather than a
// placeholder.
const TITLES_BY_ID = {
  1: "The Complete 2021 Web Development Bootcamp",
  2: "Prepare Data for Exploration",
  3: "Foundations: Data, Data, Everywhere",
  4: "Google Data Analytics Capstone: Complete a Case Study",
  5: "Google Data Analytics Professional Certificate",
  6: "Ask Questions to Make Data-Driven Decisions",
  7: "Analyze Data to Answer Questions",
  8: "Share Data Through the Art of Visualization",
  9: "Process Data from Dirty to Clean",
  10: "Data Science Real World Projects in Python",
  11: "The Data Science Course 2021: Complete Data Science Bootcamp",
  12: "Data Analysis with R Programming",
  14: "AWS Technical Essentials",
  15: "Generative AI with Large Language Models",
  16: "Building Agentic AI with Amazon Bedrock AgentCore",
  17: "Daewoong Foundation Project 2023",
  19: "Korea University Mentoring Program",
};

export const getTitle = (certificate) =>
  certificate?.Title?.trim() || TITLES_BY_ID[certificate?.id] || "";

const fileName = (url) => {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
  } catch {
    return "";
  }
};

export const getIssuer = (certificate) => {
  const stated = certificate?.Issuer?.trim();
  if (stated) return ISSUERS.includes(stated) ? stated : "Other";

  const name = fileName(certificate?.Img || "");

  const prefix = name.split("--")[0].toLowerCase();
  const uploaded = ISSUERS.find((issuer) => slugFor(issuer) === prefix);
  if (uploaded) return uploaded;

  if (name.startsWith("Coursera ")) return "Coursera";
  if (name.startsWith("UC-")) return "Udemy";

  return LEGACY_BY_ID[certificate?.id] || "Other";
};

// Certificates in issuer order, with the empty groups dropped.
export const groupByIssuer = (certificates) =>
  ISSUERS.map((issuer) => ({
    issuer,
    items: certificates.filter((certificate) => getIssuer(certificate) === issuer),
  })).filter((group) => group.items.length > 0);
