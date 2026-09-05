import PropTypes from "prop-types";
import TechMark from "./TechMark";

// A seamless loop needs the travelled distance to land on an identical frame,
// and it needs enough copies that the row is never shorter than the viewport.
// Four copies travelling exactly half the track width satisfies both: the
// half-way frame is identical to the start, and two copies comfortably exceed
// any viewport width. Rendering the list only twice left visible gaps on wide
// screens once the shorter row came round.
const REPEATS = 4;

const Row = ({ items, duration, reverse, tone }) => {
  const track = Array.from({ length: REPEATS }, () => items).flat();

  return (
    <div className="marquee overflow-hidden py-1.5">
      <div
        aria-hidden="true"
        className="marquee-track flex w-max animate-marquee items-center gap-14"
        style={{
          "--marquee-duration": duration,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {track.map((item, index) => (
          <span
            key={`${item.slug}-${index}`}
            className={`flex shrink-0 items-center gap-3 transition-colors duration-200 ease-out ${tone}`}
          >
            <TechMark slug={item.slug} className="h-5 w-5" />
            <span className="whitespace-nowrap font-mono text-meta uppercase">{item.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

Row.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string, slug: PropTypes.string })
  ).isRequired,
  duration: PropTypes.string.isRequired,
  reverse: PropTypes.bool,
  tone: PropTypes.string.isRequired,
};

// Two rows travelling against each other, on durations that do not divide into
// one another so they never settle into moving as a single block.
const StackMarquee = ({ rows, dark = false }) => {
  const tone = dark
    ? "text-paper-muted hover:text-paper"
    : "text-ink-muted hover:text-ink";
  return (
  <div className="space-y-7">
    <Row items={rows[0]} duration="64s" tone={tone} />
    <Row items={rows[1]} duration="79s" reverse tone={tone} />

    {/* The animated rows are decorative duplicates, so they are hidden from
        assistive tech and the real list is exposed once, here. */}
    <ul className="sr-only">
      {rows.flat().map((item) => (
        <li key={item.slug}>{item.name}</li>
      ))}
    </ul>
  </div>
  );
};

StackMarquee.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.array).isRequired,
  dark: PropTypes.bool,
};

export default StackMarquee;
