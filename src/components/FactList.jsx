import PropTypes from "prop-types";

// Counts come from Supabase, so on a first visit with an empty cache they are
// briefly 0. Rendering that 0 would state something false ("no projects"), so
// while the fetch is in flight the figure is held blank and the row keeps its
// height instead of jumping when the real number lands.
const FactList = ({ facts, loading }) => (
  <dl className="border-t border-rule">
    {facts.map(({ value, label, live }) => (
      <div
        key={label}
        className="flex items-baseline justify-between gap-4 border-b border-rule py-3.5"
      >
        <dt className="text-sm text-ink-body">{label}</dt>
        <dd className="nums min-w-[2ch] text-right text-2xl text-ink">
          {live && loading ? <span className="sr-only">Loading</span> : value}
        </dd>
      </div>
    ))}
  </dl>
);

FactList.propTypes = {
  facts: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number,
      label: PropTypes.string.isRequired,
      live: PropTypes.bool,
    })
  ).isRequired,
  loading: PropTypes.bool,
};

export default FactList;
