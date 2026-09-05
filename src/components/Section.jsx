import PropTypes from "prop-types";

// One heading per section, hanging under a two-pixel ink rule, with optional
// right-aligned metadata. An earlier version paired a small label with a
// descriptive sentence, which forced every section to invent one and produced
// filler ("Projects, most recent first."). The section name is the heading.
export const SectionHeading = ({ title, aside, id }) => (
  <header className="mb-6 md:mb-8">
    <div className="section-rule">
      <h2 id={id} className="text-3xl text-ink md:text-4xl">
        {title}
      </h2>
      <span className="flex-1" />
      {aside ? (
        <span className="nums shrink-0 text-meta text-ink-muted">{aside}</span>
      ) : null}
    </div>
  </header>
);

export const Subheading = ({ title, aside }) => (
  <div className="section-rule section-rule--sub">
    <h3 className="text-xl text-ink">{title}</h3>
    <span className="flex-1" />
    {aside ? (
      <span className="nums shrink-0 text-meta text-ink-muted">{aside}</span>
    ) : null}
  </div>
);

export const Section = ({ id, children, className = "", tone = "paper" }) => (
  <section
    id={id}
    className={`${tone === "surface" ? "bg-surface" : "bg-paper"} py-20 md:py-28 ${className}`}
  >
    <div className="shell">{children}</div>
  </section>
);

SectionHeading.propTypes = {
  title: PropTypes.string.isRequired,
  aside: PropTypes.string,
  id: PropTypes.string,
};

Subheading.propTypes = {
  title: PropTypes.string.isRequired,
  aside: PropTypes.string,
};

Section.propTypes = {
  id: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  tone: PropTypes.oneOf(["paper", "surface"]),
};

export default Section;
