import { ArrowUpRight } from "lucide-react";
import Reveal from "../components/Reveal";
import ExperienceRow from "../components/ExperienceRow";
import InstitutionMark from "../components/InstitutionMark";
import { SectionHeading } from "../components/Section";
import { usePortfolio } from "../context/usePortfolio";
import { CV_URL } from "../config";
import { currentRole, formatSpan } from "../utils/experience";

// An editorial profile: a statement, an institutional module, then the
// experience timeline, which is the substance of the page.
//
// This is the one route that runs on crimson rather than the site's sage.
// Treating it as a section colour keeps the institutional cue honest without
// putting two rival accents in a single view.
const About = () => {
  const { experiences } = usePortfolio();

  const current = currentRole(experiences);
  const span = formatSpan(experiences);

  // Anything countable or datable is derived, so the page cannot fall out of
  // step with the database the way a written-down figure would.
  const marks = ["Seoul, KR", "AI Engineering", "Full-stack", span].filter(Boolean);

  return (
    <div className="bg-paper pb-24 pt-20 md:pt-24">
      <div className="shell">
        <SectionHeading title="About" />

        <div className="grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="font-display text-2xl leading-[1.28] text-ink md:text-[2.25rem]">
              I build AI products across the full system, from model and retrieval work
              to backend services and user-facing products.
            </p>

            <a
              href={CV_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-2 text-sm text-ink transition-colors duration-150 ease-out hover:text-crimson"
            >
              <span className="link-underline hover:decoration-crimson">CV</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>

            <p className="mt-10 border-t border-rule pt-4 font-mono text-meta uppercase tracking-[0.14em] text-ink-muted">
              {marks.map((mark, index) => (
                <span key={mark}>
                  {index > 0 ? (
                    <span aria-hidden="true" className="mx-2.5 text-crimson-line">
                      /
                    </span>
                  ) : null}
                  {mark}
                </span>
              ))}
            </p>
          </Reveal>

          {/* Academic profile and technical identity in one plate: a filing
              card, not a dashboard tile. Square corners, no shadow, one rule
              of colour along the top edge. */}
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={80}>
            <div className="relative overflow-hidden bg-surface px-6 py-7">
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-crimson" />

              {/* The crest again, oversized and bled off the corner, at an
                  opacity where it reads as paper texture rather than as a
                  second logo. */}
              <InstitutionMark
                organization="Korea University"
                className="pointer-events-none absolute -bottom-20 -right-16 h-80 w-auto opacity-[0.05]"
              />

              <dl className="relative">
                <div>
                  <dt className="font-mono text-meta uppercase tracking-[0.14em] text-crimson">
                    Studying
                  </dt>
                  <dd className="mt-3 flex items-center gap-2.5">
                    <InstitutionMark
                      organization="Korea University"
                      className="h-7 w-auto shrink-0"
                    />
                    <span className="font-display text-xl text-ink">Korea University</span>
                  </dd>
                  <dd className="mt-2.5 text-sm text-ink-body">BSc Data Science</dd>
                  <dd className="text-sm text-ink-body">
                    Double major in Artificial Intelligence
                  </dd>
                </div>

                {current ? (
                  <div className="mt-6 border-t border-crimson-line pt-5">
                    <dt className="font-mono text-meta uppercase tracking-[0.14em] text-crimson">
                      Currently
                    </dt>
                    <dd className="mt-3 font-display text-xl text-ink">
                      {current.organization}
                    </dd>
                    <dd className="mt-1.5 text-sm text-ink-body">{current.role}</dd>
                  </div>
                ) : null}
              </dl>

              <p className="relative mt-6 border-t border-rule pt-4 font-mono text-meta uppercase tracking-[0.14em] text-ink-muted">
                Seoul, South Korea
              </p>
            </div>
          </Reveal>
        </div>

        {experiences.length > 0 ? (
          <section className="mt-20 md:mt-28">
            <div className="section-rule mb-8 md:mb-10">
              <h2 className="text-3xl text-ink md:text-4xl">Experience</h2>
              <span className="flex-1" />
              {span ? (
                <span className="nums shrink-0 text-meta uppercase text-ink-muted">{span}</span>
              ) : null}
            </div>

            {/* `timeline-rule` draws one hairline down the chronology gutter
                for the whole list, so it does not break between entries. */}
            <ul className="timeline-rule relative">
              {experiences.map((experience, index) => (
                <Reveal
                  key={experience.id}
                  as="li"
                  delay={Math.min(index, 5) * 60}
                  className={`group border-t py-8 md:py-10 ${
                    experience.is_current ? "border-crimson/45" : "border-rule"
                  }`}
                >
                  <ExperienceRow experience={experience} index={index} />
                </Reveal>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default About;
