import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation, Link } from "react-router-dom";
import "./index.css";
import { PortfolioProvider } from "./context/PortfolioData";
import Navbar from "./components/Navbar";
import Landing from "./Pages/Landing";
import Projects from "./Pages/Projects";
import About from "./Pages/About";
import Stack from "./Pages/Stack";
import Certificates from "./Pages/Certificates";
import ContactPage from "./Pages/Contact";
import NotFoundPage from "./Pages/404";

const ProjectDetails = lazy(() => import("./components/ProjectDetail"));
const Admin = lazy(() => import("./Pages/Admin"));

const RouteFallback = () => (
  <div className="grid min-h-[60vh] place-items-center bg-paper">
    <p className="font-mono text-meta uppercase text-ink-muted">Loading</p>
  </div>
);

// A routed site needs to answer both of these on every navigation: put the
// reader at the top of the new page, and tell them where they are.
const RouteEffects = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    const titles = {
      "/": "Felicia Angel, AI Engineer",
      "/projects": "Projects, Felicia Angel",
      "/about": "About, Felicia Angel",
      "/stack": "Stack, Felicia Angel",
      "/certificates": "Certificates, Felicia Angel",
      "/contact": "Contact, Felicia Angel",
    };
    document.title = titles[pathname] || "Felicia Angel, AI Engineer";
  }, [pathname]);

  return null;
};

const Footer = () => (
  <footer className="bg-paper">
    <div className="shell border-t border-rule py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-baseline sm:justify-between">
        {/* The monogram, not the full lockup: the lockup's wordmark is set
            with very wide tracking and thin strokes, and stops being legible
            below about 60px. The mark reads fine small, with the name set in
            type beside it. */}
        <div className="flex items-center gap-3">
          <img
            src="/brand-mark.png"
            alt=""
            width="401"
            height="338"
            loading="lazy"
            className="h-9 w-auto"
          />
          <p className="font-mono text-meta uppercase text-ink-muted">Felicia Angel Wijaya</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { to: "/projects", label: "Projects" },
              { to: "/stack", label: "Stack" },
              { to: "/certificates", label: "Certificates" },
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="font-mono text-meta uppercase text-ink-muted transition-colors duration-150 ease-out hover:text-accent"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="nums text-meta text-ink-muted">{new Date().getFullYear()}</p>
      </div>
    </div>
  </footer>
);

const SiteLayout = () => (
  <>
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
    >
      Skip to content
    </a>
    <Navbar />
    <main id="main">
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <PortfolioProvider>
        <RouteEffects />
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/projects" element={<Projects />} />
            {/* The page used to live at /work. Anything already shared with
                that link keeps working. */}
            <Route path="/work" element={<Navigate to="/projects" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/stack" element={<Stack />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
          </Route>
          <Route
            path="/admin"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Admin />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PortfolioProvider>
    </BrowserRouter>
  );
}

export default App;
