// Public read path for the site.
//
// The rest of the app used @supabase/supabase-js for these two GET requests,
// which pulled the whole SDK (auth, realtime, storage) into the bundle every
// visitor downloads. The public site only ever reads two tables, so it talks
// to PostgREST directly and the SDK is left to the admin screens, which
// genuinely need auth and storage and are loaded on demand.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../config";

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  Accept: "application/json",
};

const request = async (path) => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
};

// Same request, but a table that does not exist yet resolves to an empty list
// instead of failing the whole page load. PostgREST answers 404 with code
// PGRST205 until the migration has been applied.
const optionalRequest = async (path) => {
  try {
    return await request(path);
  } catch {
    return [];
  }
};

export const fetchProjects = () => request("projects?select=*&order=id.desc");

export const fetchCertificates = () => request("certificates?select=*&order=id.asc");

// Hidden entries are already excluded by row level security; the filter is
// here so the request does not depend on the policy alone.
export const fetchExperiences = () =>
  optionalRequest(
    "work_experiences?select=*&is_visible=eq.true&order=sort_order.asc,start_date.desc"
  );

export const fetchProject = async (id) => {
  const rows = await request(`projects?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
  return rows[0] || null;
};
