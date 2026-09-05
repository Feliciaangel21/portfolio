import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { getTagTone } from "../utils/projectCategory";

// Replaces CardProject. The old version was a glass card in a 3-up grid: same
// size, same structure, repeated. A list of rules reads as an index of work,
// scans faster, and lets the titles set the rhythm instead of the boxes.
const ProjectRow = ({ Img, Title, Description, Link: ProjectLink, id, Tags = [], index }) => {
  const body = (
    <>
      <div className="col-span-12 sm:col-span-3">
        {Img ? (
          <img
            src={Img}
            alt=""
            loading="lazy"
            decoding="async"
            className="aspect-video w-full bg-surface-deep object-contain shadow-plate transition-[transform,box-shadow] duration-300 ease-out group-hover:scale-[1.02] group-hover:shadow-lift"
          />
        ) : (
          <div className="aspect-video w-full bg-surface-deep shadow-plate" />
        )}
      </div>

      <div className="col-span-12 sm:col-span-8 sm:col-start-5">
        <div className="flex items-baseline gap-3">
          <span className="nums text-meta text-ink-muted">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-xl text-ink transition-colors duration-150 ease-out group-hover:text-accent">
            {Title}
          </h3>
          <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 translate-y-1 text-ink-muted transition-transform duration-200 ease-out group-hover:-translate-y-0 group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>

        {Description ? (
          <p className="mt-3 max-w-prose text-sm text-ink-body line-clamp-3">{Description}</p>
        ) : null}

        {Tags.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
            {Tags.map((tag) => (
              <li key={tag} className={`font-mono text-meta uppercase ${getTagTone(tag)}`}>
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );

  const rowClass =
    "group grid grid-cols-12 gap-x-5 gap-y-4 border-b border-rule py-8 transition-colors duration-150 ease-out hover:border-ink";

  // The whole row is the link when there is a detail page. Falls back to the
  // live demo, and stays a plain row when neither exists, rather than
  // rendering a link that alerts the visitor that it does not work.
  if (id) {
    return (
      <li>
        <Link to={`/project/${id}`} className={rowClass}>
          {body}
        </Link>
      </li>
    );
  }

  if (ProjectLink) {
    return (
      <li>
        <a href={ProjectLink} target="_blank" rel="noopener noreferrer" className={rowClass}>
          {body}
        </a>
      </li>
    );
  }

  return <li className={rowClass.replace("group ", "")}>{body}</li>;
};

ProjectRow.propTypes = {
  Img: PropTypes.string,
  Title: PropTypes.string,
  Description: PropTypes.string,
  Link: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  Tags: PropTypes.arrayOf(PropTypes.string),
  index: PropTypes.number.isRequired,
};

export default ProjectRow;
