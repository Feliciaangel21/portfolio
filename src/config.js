// Everything environment-specific in one place. The email and CV link were
// repeated across five files, so changing either meant hunting for copies.
//
// Supabase credentials come from .env (VITE_SUPABASE_URL and
// VITE_SUPABASE_ANON_KEY). The anon key is public by design: it ships in the
// client bundle and row-level security is what actually protects the data.
const env = import.meta.env;

const required = (key) => {
  const value = env[key];
  if (!value) {
    throw new Error(
      `${key} is missing. Copy .env.example to .env and fill it in, then restart the dev server.`
    );
  }
  return value;
};

export const SUPABASE_URL = required("VITE_SUPABASE_URL");
export const SUPABASE_ANON_KEY = required("VITE_SUPABASE_ANON_KEY");

export const ADMIN_EMAIL = (env.VITE_ADMIN_EMAIL || "").toLowerCase();

export const EMAIL = env.VITE_CONTACT_EMAIL || "feliciaangel21@gmail.com";

export const CV_URL =
  env.VITE_CV_URL ||
  "https://drive.google.com/drive/folders/145YCdfFjO6zP6_Dh1Bicw3hxD2wg0bqh?usp=sharing";

export const SOCIAL = {
  linkedin: "https://www.linkedin.com/in/felicia-angel-1b0a46254/",
  github: "https://github.com/Feliciaangel21",
};
