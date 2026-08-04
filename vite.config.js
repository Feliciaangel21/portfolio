import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Social preview tags need absolute URLs, but the Vercel domain is not
// hardcoded anywhere — Vercel exposes it at build time, so resolve it here and
// substitute %SITE_URL% in index.html. Locally there is no domain, so the tags
// that require one are dropped rather than left pointing at localhost.
const resolveSiteUrl = () => {
  const domain =
    process.env.VITE_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL

  if (!domain) return null
  return domain.startsWith('http') ? domain : `https://${domain}`
}

const socialMeta = () => ({
  name: 'social-meta-urls',
  transformIndexHtml(html) {
    const siteUrl = resolveSiteUrl()

    if (siteUrl) return html.replaceAll('%SITE_URL%', siteUrl)

    // Drop any tag whose URL could not be resolved.
    return html
      .split('\n')
      .filter((line) => !line.includes('%SITE_URL%'))
      .join('\n')
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), socialMeta()],
})
