import PropTypes from "prop-types";
import { SectionHeading } from "../components/Section";
import TechMark from "../components/TechMark";
import { STACK_CATEGORIES } from "../data/stack";

// The page prints line by line, the way a terminal writes line-buffered
// output. Each line fades and lifts on its own delay; nothing animates the
// text itself, so there is no reflow and a screen reader gets the whole
// document at once. The global reduced-motion rule collapses it to a single
// instant paint.
const STEP = 38;
const MAX_DELAY = 900;

const printed = (line) => ({
  animation: `reveal 320ms cubic-bezier(0.23, 1, 0.32, 1) ${Math.min(
    line * STEP,
    MAX_DELAY
  )}ms both`,
});

// Items sit three to a row at desktop, so a category is its header, its
// description, and one line per row of items. Counting them keeps the printing
// in document order down the whole panel instead of restarting each section.
const PER_ROW = 3;
const linesFor = (items) => 2 + Math.ceil(items.length / PER_ROW);

// Techniques and formats have no brand mark. A marker of exactly the same size
// keeps the name column aligned and reads as a deliberate "no logo" rather
// than a missing image.
const Marker = () => (
  <span aria-hidden="true" className="grid h-4 w-4 shrink-0 place-items-center">
    <span className="h-1.5 w-1.5 border border-current opacity-60" />
  </span>
);

const Category = ({ number, title, path, description, note, items, firstLine }) => (
  <section className="group">
    <div
      style={printed(firstLine)}
      className="flex items-baseline gap-4 border-t border-rule pt-3"
    >
      <span className="nums text-meta text-accent">{number}</span>
      <h2 className="font-mono text-lg text-ink md:text-xl">{path}</h2>
      <span className="hidden font-mono text-meta uppercase text-ink-muted sm:inline">
        {title}
      </span>
      <span className="flex-1" />
      <span className="nums shrink-0 text-meta text-ink-muted">{items.length} tools</span>
    </div>

    <p
      style={printed(firstLine + 1)}
      className="mt-3 max-w-prose font-mono text-sm text-ink-body"
    >
      {description}
    </p>

    <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <li
          key={item.name}
          style={printed(firstLine + 2 + Math.floor(index / PER_ROW))}
          className="flex items-center gap-2.5 font-mono text-sm text-ink-body transition-colors duration-150 ease-out hover:text-accent"
        >
          {item.slug ? <TechMark slug={item.slug} className="h-4 w-4" /> : <Marker />}
          {item.name}
        </li>
      ))}
    </ul>

    <p className="mt-4 font-mono text-meta text-ink-muted opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100">
      # {note}
    </p>
  </section>
);

Category.propTypes = {
  number: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  note: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string.isRequired, slug: PropTypes.string })
  ).isRequired,
  firstLine: PropTypes.number.isRequired,
};

const Stack = () => {
  const total = STACK_CATEGORIES.reduce((sum, group) => sum + group.items.length, 0);

  let line = 1;
  const categories = STACK_CATEGORIES.map((group) => {
    const firstLine = line;
    line += linesFor(group.items);
    return { ...group, firstLine };
  });

  return (
    <div className="bg-paper pb-24 pt-20 md:pt-24">
      <div className="shell">
        <SectionHeading title="Stack" />

        {/* macOS Terminal, copied closely: 11px corners, traffic lights hard
            left, the title centred in the bar rather than beside them, a
            hairline under the chrome and a white content area. The counts
            moved down to the end-of-file line, because the real title bar
            carries nothing on the right. */}
        <div className="overflow-hidden rounded-window bg-paper shadow-window">
          <div className="relative flex items-center justify-center border-b border-rule bg-surface-deep px-4 py-2.5">
            <span aria-hidden="true" className="absolute left-4 flex gap-2">
              <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
              <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            </span>
            <span className="font-sans text-meta font-medium tracking-normal text-ink-body">
              stack.yaml
            </span>
          </div>

          {/* The panel scrolls its own contents, the way a terminal window
              does, instead of stretching the page to fit. It is focusable and
              labelled because nothing inside it is interactive, and a scroll
              region with no tab stop cannot be reached from the keyboard. */}
          <div
            role="region"
            aria-label="Stack readout"
            tabIndex={0}
            className="terminal-scroll max-h-[70vh] overflow-y-auto px-4 py-8 md:px-6 md:py-10"
          >
            <p style={printed(0)} className="mb-10 font-mono text-sm">
              <span className="text-accent">felicia@portfolio</span>
              <span className="text-ink-muted"> ~ % </span>
              <span className="text-ink">cat stack.yaml</span>
              <span
                aria-hidden="true"
                className="ml-2 inline-block h-3.5 w-1.5 animate-caret bg-accent align-middle"
              />
            </p>

            <div className="space-y-10 md:space-y-12">
              {categories.map((group) => (
                <Category key={group.number} {...group} />
              ))}
            </div>

            <p
              style={printed(line)}
              className="mt-12 flex flex-wrap items-baseline gap-x-4 border-t border-rule pt-3 font-mono text-meta uppercase text-ink-muted"
            >
              <span>End of file</span>
              <span className="flex-1" />
              <span className="nums">
                {STACK_CATEGORIES.length} categories &middot; {total} tools
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stack;
