import PropTypes from "prop-types";
import { markFor } from "../data/institutionMarks";

// An organization's mark, at whatever size the caller asks for: a small crest
// beside an entry, or an oversized faint one behind a panel.
//
// It is decorative in both places, since the organization is named in type
// right next to it, so it carries no alt text and is hidden from assistive
// technology rather than read out twice.
const InstitutionMark = ({ organization, className = "" }) => {
  const mark = markFor(organization);
  if (!mark) return null;

  return (
    <img
      src={mark.src}
      alt=""
      aria-hidden="true"
      width={mark.width}
      height={mark.height}
      loading="lazy"
      decoding="async"
      className={`select-none ${className}`}
    />
  );
};

InstitutionMark.propTypes = {
  organization: PropTypes.string,
  className: PropTypes.string,
};

export default InstitutionMark;
