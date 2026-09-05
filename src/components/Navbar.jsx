import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navItems = [
  { to: "/projects", label: "Projects" },
  { to: "/stack", label: "Stack" },
  { to: "/certificates", label: "Certificates" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const sentinelRef = useRef(null);
  const { pathname } = useLocation();

  // IntersectionObserver rather than a scroll listener: it does the same job
  // without running layout-reading code on every scroll event.
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(([entry]) => setPinned(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  // Close the mobile sheet whenever the route changes, otherwise it stays open
  // over the page the reader just navigated to.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event) => event.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const linkClass = ({ isActive }) =>
    `font-mono text-meta uppercase transition-colors duration-150 ease-out ${
      isActive ? "text-accent" : "text-ink-muted hover:text-ink"
    }`;

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="absolute top-0 h-px w-full" />

      <header
        className={`fixed inset-x-0 top-0 z-40 border-b border-rule bg-paper/90 backdrop-blur-[2px] transition-shadow duration-200 ease-out ${
          pinned ? "shadow-nav" : ""
        }`}
      >
        <div className="shell flex h-16 items-center justify-between">
          {/* The monogram, drawn through a mask so it takes the current text
              colour and picks up the same hover and current-page states as
              the rest of the nav. It needs about 36px: below roughly 30 the
              orbit and the sparkle lose their hairlines and go muddy.
              `end` so this is only marked current on the landing page itself;
              without it a NavLink to "/" matches every route below it. */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `inline-flex items-center transition-colors duration-150 ease-out ${
                isActive ? "text-accent" : "text-ink hover:text-accent"
              }`
            }
          >
            <span
              aria-hidden="true"
              className="tech-mark h-9 w-11"
              style={{
                WebkitMaskImage: "url(/brand-mark-mask.png)",
                maskImage: "url(/brand-mark-mask.png)",
              }}
            />
            <span className="sr-only">Home</span>
          </NavLink>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={linkClass}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="-mr-2 grid h-11 w-11 place-items-center text-ink md:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {isOpen && (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-30 bg-paper pt-16 md:hidden"
          style={{ animation: "reveal 200ms cubic-bezier(0.23, 1, 0.32, 1) both" }}
        >
          <nav aria-label="Primary" className="shell pt-8">
            <ul className="divide-y divide-rule border-y border-rule">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-baseline justify-between py-5 font-display text-2xl ${
                        isActive ? "text-accent" : "text-ink"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;
