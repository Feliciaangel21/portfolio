import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Hero from "../components/Hero";
import Reveal from "../components/Reveal";
import ProjectCard from "../components/ProjectCard";
import StackMarquee from "../components/StackMarquee";
import { usePortfolio } from "../context/usePortfolio";
import { MARQUEE_ROWS } from "../data/stack";
import { yearsBuilding } from "../data/profile";
import { getProjectTags } from "../utils/projectCategory";
import { EMAIL } from "../config";

const FEATURED_COUNT = 6;

const SectionRule = ({ title, children }) => (
  <div className="section-rule mb-8">
    <h2 className="text-3xl text-ink md:text-4xl">{title}</h2>
    <span className="flex-1" />
    {children}
  </div>
);

const MoreLink = ({ to, children }) => (
  <Link
    to={to}
    className="group inline-flex shrink-0 items-center gap-2 font-mono text-meta uppercase text-ink-muted transition-colors duration-150 ease-out hover:text-accent"
  >
    {children}
    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
  </Link>
);

const Landing = () => {
  const { projects, certificates, loading } = usePortfolio();
  const featured = projects.slice(0, FEATURED_COUNT);

  const facts = [
    { value: projects.length, label: "Projects", to: "/projects" },
    { value: certificates.length, label: "Certificates", to: "/certificates" },
    { value: yearsBuilding(), label: "Years building" },
  ];

  return (
    <>
      <Hero />

      {/* Work comes straight after the hero, image first. The three tall
          index rows that used to sit here pushed the projects below the fold
          to repeat navigation the header already provides. */}
      <section className="bg-paper pt-16 md:pt-20">
        <div className="shell">
          <Reveal>
            <SectionRule title="Featured Projects">
              {projects.length > FEATURED_COUNT && (
                <MoreLink to="/projects">All {projects.length}</MoreLink>
              )}
            </SectionRule>
          </Reveal>

          <Reveal delay={60}>
            {/* Small screens get a swipeable row rather than six cards stacked
                into a very long column. The negative margin lets it run to
                both edges of the screen, so the next card peeks in and the row
                reads as scrollable. From sm up it is the grid again. */}
            {featured.length ? (
              <ul className="-mx-6 flex snap-x snap-mandatory scroll-pl-6 gap-5 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-x-visible sm:scroll-pl-0 sm:px-0 sm:pb-0 lg:grid-cols-3">
                {featured.map((project) => (
                  <ProjectCard
                    key={project.id}
                    {...project}
                    Tags={getProjectTags(project)}
                    itemClassName="w-[76%] shrink-0 snap-start sm:w-auto sm:shrink"
                  />
                ))}
              </ul>
            ) : (
              <p className="border-y border-rule py-10 text-center text-sm text-ink-muted">
                {loading ? "Loading projects." : "No projects yet."}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {/* The marquee already says what the section is, so the band is just a
          label, a way through to the full list, and the marks themselves. */}
      <section className="mt-16 bg-ink py-10 md:mt-20 md:py-12">
        <div className="shell">
          <Reveal>
            <div className="mb-6 flex items-baseline gap-4">
              <h2 className="text-3xl text-paper md:text-4xl">Stack</h2>
              <span className="flex-1" />
              <Link
                to="/stack"
                className="group inline-flex shrink-0 items-center gap-2 font-mono text-meta uppercase text-paper-muted transition-colors duration-150 ease-out hover:text-accent-light"
              >
                View full stack
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={60}>
          <StackMarquee rows={MARQUEE_ROWS} dark />
        </Reveal>
      </section>

      {/* About, contact and the numbers folded into one band instead of three
          separate full-height sections. */}
      <section className="bg-surface py-16 md:py-20">
        <div className="shell">
          <Reveal>
            <div className="grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <p className="max-w-prose text-lg text-ink-body">
                  I enjoy taking systems from implementation to real-world use, then
                  refining them based on what happens in practice.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
                  <MoreLink to="/about">More about me</MoreLink>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="group inline-flex items-center gap-2 font-mono text-meta uppercase text-ink-muted transition-colors duration-150 ease-out hover:text-accent"
                  >
                    Email me
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </div>
              </div>

              {/* Three columns need about 150px each to hold "Certificates"
                  clear of the next divider, which a phone does not have: the
                  labels collided and "Years building" wrapped while the other
                  two did not, so the row read as uneven. Below sm it is a
                  list of rows instead, label against figure.

                  A list rather than a definition list, because two of the
                  three figures are doors to a page and the whole cell has to
                  be the target: a <dl> group cannot be wrapped in a link and
                  stay valid, and the figure alone is under the 44px a thumb
                  needs. */}
              <ul className="grid grid-cols-1 border-t border-rule sm:grid-cols-3 sm:border-t-0 lg:col-span-5 lg:col-start-8">
                {facts.map(({ value, label, to }, index) => {
                  const cell =
                    "flex items-baseline justify-between gap-4 py-3 sm:flex-col-reverse sm:items-start sm:gap-2 sm:py-0";
                  const figure = loading && !value ? "" : value;

                  return (
                    <li
                      key={label}
                      className={`border-b border-rule sm:border-b-0 ${
                        index ? "sm:border-l sm:border-rule sm:pl-5" : ""
                      }`}
                    >
                      {to ? (
                        // The label carries the site's underline so the cell
                        // reads as a link before anyone hovers it.
                        <Link to={to} className={`group ${cell}`}>
                          <span className="link-underline font-mono text-meta uppercase text-ink-muted transition-colors duration-150 ease-out group-hover:text-ink">
                            {label}
                          </span>
                          <span className="nums text-3xl text-accent transition-colors duration-150 ease-out group-hover:text-accent-hover sm:text-4xl">
                            {figure}
                          </span>
                        </Link>
                      ) : (
                        <div className={cell}>
                          <span className="font-mono text-meta uppercase text-ink-muted">
                            {label}
                          </span>
                          <span className="nums text-3xl text-accent sm:text-4xl">{figure}</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper pb-20">
        <div className="shell">
          <Reveal>
            <div className="border-t border-rule pt-10 sm:flex sm:items-end sm:justify-between sm:gap-10">
              <h2 className="max-w-[24ch] text-3xl text-ink md:text-4xl">
                Exploring roles across AI engineering and product development.
              </h2>
              <Link
                to="/contact"
                className="group mt-6 inline-flex shrink-0 items-center gap-2 bg-ink px-5 py-3 text-sm text-paper transition-colors duration-150 ease-out hover:bg-accent active:scale-[0.98] sm:mt-0"
              >
                Get in touch
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};

SectionRule.propTypes = { title: PropTypes.string.isRequired, children: PropTypes.node };
MoreLink.propTypes = { to: PropTypes.string.isRequired, children: PropTypes.node };

export default Landing;
