import PropTypes from "prop-types";

// Simple Icons, vendored into /public/icons and drawn as a mask so each mark
// inherits the current text colour.
// Brand colours would pull the eye around the page and fight the restrained
// palette; a single ink tone keeps the strip reading as typography with marks
// rather than a logo wall.
const ICON_BASE = "/icons";

const TechMark = ({ slug, className = "h-5 w-5" }) => (
  <span
    aria-hidden="true"
    className={`tech-mark shrink-0 ${className}`}
    style={{
      WebkitMaskImage: `url(${ICON_BASE}/${slug}.svg)`,
      maskImage: `url(${ICON_BASE}/${slug}.svg)`,
    }}
  />
);

TechMark.propTypes = {
  slug: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default TechMark;
