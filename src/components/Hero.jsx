import { memo } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { EMAIL } from "../config";

// Staggered on load rather than on scroll: this block is above the fold, so
// there is nothing to observe. Short steps, and the global reduced-motion rule
// collapses all of it to an instant paint.
const step = (index) => ({
  animation: `reveal 460ms cubic-bezier(0.23, 1, 0.32, 1) ${index * 80}ms both`,
});

// A registration mark, the kind that sits in the trim area of a printed page.
// Purely a texture detail, so it is hidden from assistive technology.
const Cross = ({ className }) => (
  <span
    aria-hidden="true"
    className={`pointer-events-none absolute font-mono text-base leading-none text-accent/70 ${className}`}
  >
    +
  </span>
);

Cross.propTypes = { className: PropTypes.string };

// The CV used to hang off the hero as a link straight out to the file. The
// About page now covers the same ground in the site's own type, and carries
// the CV link itself, so the hero points there instead of out.
const links = [
  { label: "Experience", to: "/about" },
  { label: "Email", href: `mailto:${EMAIL}` },
];

const secondaryLink =
  "group inline-flex items-center gap-2 text-ink-muted transition-colors duration-150 ease-out hover:text-accent";

const Hero = () => (
  <section className="relative overflow-hidden bg-paper pb-8 pt-24 md:pb-14 md:pt-28">
    <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />

    <div className="shell relative">
      <div className="grid grid-cols-12 items-center gap-x-5 gap-y-9 lg:gap-y-0">
        {/* Identity sits above the portrait in the stacking order so the
            oversized name keeps its counters clean where the two columns
            overlap at wide widths. */}
        {/* Identity and the copy below it are separate grid children so the
            portrait can sit beside the name when the layout is narrow, and
            beside both of them when it is wide. Identity is above the
            portrait in the stacking order so the oversized name keeps its
            counters clean where the two overlap. */}
        <div className="relative z-10 col-span-8 lg:col-span-5 lg:row-start-1">
          <p style={step(0)} className="font-mono text-meta uppercase text-accent">
            AI Engineer <span className="text-ink-muted">&times;</span> Full-Stack Developer
            <span
              aria-hidden="true"
              className="ml-2 inline-block h-3 w-1.5 animate-caret bg-accent align-middle"
            />
          </p>

          {/* Set in the sans at 600 and broken by hand into two lines: the
              name is the largest thing on the page, so it sets the left edge
              that everything below aligns to. */}
          <h1
            style={step(1)}
            className="mt-7 font-sans text-hero font-semibold text-ink-deep"
          >
            Felicia Angel
            <br />
            Wijaya
          </h1>
        </div>

        <div
          style={step(2)}
          className="col-span-4 lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:-ml-24 lg:self-center"
        >
          <div className="relative mx-auto w-full max-w-[150px] sm:max-w-[210px] lg:max-w-[330px]">
            {/* Filled panel, rotated and running off the right edge, so the
                composition is anchored off-centre rather than boxed. */}
            <div
              aria-hidden="true"
              className="absolute bottom-[13%] left-[34%] right-[-3%] top-[17%] -rotate-2 bg-accent-deep lg:right-[-10%]"
            />

            {/* A second panel drawn as a rule only, counter-rotated. Two
                weights of the same rectangle read as layers; two filled
                panels would just read as mud. */}
            <div
              aria-hidden="true"
              className="absolute bottom-[9%] left-[-13%] right-[7%] top-[2%] hidden rotate-[1.5deg] border border-accent/55 lg:block"
            >
              <Cross className="-left-1 -top-2" />
              <Cross className="-right-1 -top-2" />
              <Cross className="-bottom-2 -left-1" />
              <Cross className="-bottom-2 -right-1" />
            </div>

            <div
              aria-hidden="true"
              className="absolute bottom-0 left-0 right-[-6%] hidden h-px bg-accent/35 lg:left-[-34%] lg:block"
            />

            <img
              src="/portrait-cut-400.webp"
              srcSet="/portrait-cut-400.webp 400w, /portrait-cut-800.webp 800w"
              sizes="(min-width: 1024px) 330px, (min-width: 640px) 210px, 150px"
              alt="Felicia Angel Wijaya"
              width="818"
              height="922"
              fetchPriority="high"
              decoding="async"
              className="relative block w-full select-none"
            />

            {/* Annotations. Both sit clear of the face, and neither carries
                anything the page needs elsewhere. */}
            <p
              aria-hidden="true"
              className="absolute -bottom-7 left-0 hidden items-center gap-2 font-mono text-meta uppercase text-accent lg:left-[-34%] lg:flex"
            >
              <span className="inline-block h-px w-6 bg-accent/60" />
              Seoul, KR
            </p>

            <p
              aria-hidden="true"
              className="vertical-label absolute right-[1%] top-[20%] hidden font-mono text-meta uppercase tracking-[0.15em] text-paper/60 lg:block"
            >
              AI / Software / Product
            </p>

          </div>
        </div>
        <div className="col-span-12 lg:col-span-5 lg:col-start-1 lg:row-start-2">
          {/* The one place the serif is used, as a deliberate counterweight to
              the sans above it. */}
          <p
            style={step(2)}
            className="mt-8 max-w-[42ch] font-display text-xl leading-relaxed text-ink-body"
          >
            I build end-to-end software products across AI and full-stack
            development, with a focus on how systems perform in real use.
          </p>

          <div
            style={step(3)}
            className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 font-mono text-meta uppercase"
          >
            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 text-ink transition-colors duration-150 ease-out hover:text-accent"
            >
              <span className="link-underline">Selected Projects</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
            </Link>

            {/* A route stays in the site and takes the travelling arrow; only
                what leaves the page gets the one that points out. */}
            {links.map(({ label, to, href }) =>
              to ? (
                <Link key={label} to={to} className={secondaryLink}>
                  <span className="link-underline">{label}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <a key={label} href={href} className={secondaryLink}>
                  <span className="link-underline">{label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              )
            )}
          </div>
        </div>

        {/* The negative margin pulls the composition back across the gutter so
            the two halves interlock instead of reading as two columns. */}
      </div>
    </div>
  </section>
);

export default memo(Hero);
