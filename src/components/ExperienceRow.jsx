import PropTypes from "prop-types";
import { ArrowUpRight } from "lucide-react";
import InstitutionMark from "./InstitutionMark";
import { formatPeriod, readHighlights, sectorFor } from "../utils/experience";

// One entry in the experience timeline, set in three rails: chronology on the
// left, the entry itself in the middle, placement and proof on the right.
// Structure is carried by type and hairlines. No cards, no badges, no logos.
const ExperienceRow = ({ experience, index }) => {
  const {
    organization,
    team_or_department: team,
    role,
    location,
    experience_type: type,
    summary,
    tags,
    external_url: url,
    is_current: isCurrent,
  } = experience;

  const highlights = readHighlights(experience);
  const period = formatPeriod(experience);
  const number = String(index + 1).padStart(2, "0");
  const sector = sectorFor(experience);

  // Placement, sector and status read as one column of small facts rather
  // than three separately styled things.
  const facts = [
    location ? { key: "location", text: location } : null,
    { key: "sector", text: sector },
    isCurrent ? { key: "current", text: "Current", accent: true } : null,
  ].filter(Boolean);

  return (
    <div className="relative z-[2] grid grid-cols-12 gap-x-5 gap-y-5">
      {/* Left rail. On narrow screens the chronology collapses onto one line
          above the entry instead of holding its own column. */}
      <div className="col-span-12 flex flex-wrap items-baseline gap-x-4 gap-y-1 md:col-span-3 md:block">
        <span
          className={`nums text-meta transition-colors duration-200 ease-out ${
            isCurrent ? "text-crimson" : "text-ink-muted group-hover:text-crimson"
          }`}
        >
          {number}
        </span>
        {period ? (
          <span className="nums text-meta uppercase text-ink-body md:mt-2.5 md:block">
            {period}
          </span>
        ) : null}
        {type ? (
          <span className="font-mono text-meta uppercase tracking-[0.1em] text-ink-muted md:mt-1.5 md:block">
            {type}
          </span>
        ) : null}
      </div>

      {/* Centre. Sits clear of the vertical hairline the list draws down the
          first gutter. */}
      <div className="col-span-12 md:col-span-6 md:pl-6 lg:pl-8">
        <div className="flex items-center gap-3">
          <InstitutionMark organization={organization} className="h-6 w-auto shrink-0" />
          <h3
            className={`font-display text-ink transition-transform duration-300 ease-out group-hover:translate-x-1 ${
              isCurrent ? "text-2xl md:text-[1.6rem]" : "text-xl md:text-2xl"
            }`}
          >
            {organization}
          </h3>
        </div>

        {/* Transform only, so this stays off the layout and off the main
            thread; reduced motion flattens it to an instant state change. */}
        <span
          aria-hidden="true"
          className="mt-2.5 block h-px w-12 origin-left scale-x-0 bg-crimson transition-transform duration-300 ease-out group-hover:scale-x-100"
        />

        <p className="mt-2.5 text-base text-ink-body">
          {role}
          {team ? <span className="text-ink-muted"> · {team}</span> : null}
        </p>

        {summary ? (
          <p className="mt-4 max-w-prose text-sm text-ink-body">{summary}</p>
        ) : null}

        {(tags?.length || url) && (
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* Metadata, not badges: mono text separated by slashes. */}
            {tags?.length ? (
              <p className="font-mono text-meta uppercase tracking-[0.08em] text-ink-muted">
                {tags.join("  /  ")}
              </p>
            ) : null}

            {/* Only rendered when there is somewhere to go. An arrow that does
                nothing is worse than no arrow. */}
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1.5 font-mono text-meta uppercase text-ink-muted transition-colors duration-150 ease-out hover:text-crimson"
              >
                Visit
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ) : null}
          </div>
        )}
      </div>

      {/* Right rail: where it was, which world it belongs to, and one piece of
          proof when there is one worth printing. */}
      <div className="col-span-12 md:col-span-3">
        <ul className="space-y-1.5">
          {facts.map((fact) => (
            <li
              key={fact.key}
              className={`font-mono text-meta uppercase tracking-[0.1em] ${
                fact.accent ? "text-crimson" : "text-ink-muted"
              }`}
            >
              {fact.text}
            </li>
          ))}
        </ul>

        {/* Optional PROBLEM / WORK / RESULT detail, stored per entry. Rows
            without it are complete as they are, so nothing is reserved when
            it is absent. */}
        {highlights.length > 0 ? (
          <dl className="mt-5 space-y-4 border-t border-rule pt-4">
            {highlights.map(({ label, body }) => (
              <div key={label}>
                <dt className="font-mono text-meta uppercase tracking-[0.1em] text-ink-muted transition-colors duration-200 ease-out group-hover:text-crimson">
                  {label}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-ink-body">{body}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </div>
  );
};

ExperienceRow.propTypes = {
  experience: PropTypes.shape({
    organization: PropTypes.string.isRequired,
    team_or_department: PropTypes.string,
    role: PropTypes.string.isRequired,
    experience_type: PropTypes.string,
    location: PropTypes.string,
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    is_current: PropTypes.bool,
    summary: PropTypes.string,
    highlights: PropTypes.array,
    tags: PropTypes.arrayOf(PropTypes.string),
    external_url: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

export default ExperienceRow;
