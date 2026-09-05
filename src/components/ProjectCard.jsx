import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { getTagTone } from "../utils/projectCategory";

// The landing-page treatment: preview image first, title and tags under it,
// no description. The full row with the write-up lives on /projects, so the
// landing stays a visual index rather than a wall of paragraphs.
const ProjectCard = ({ Img, Title, Link: ProjectLink, id, Tags = [], itemClassName = "" }) => {
  const inner = (
    <>
      <div className="overflow-hidden bg-surface-deep shadow-plate transition-shadow duration-200 ease-out group-hover:shadow-lift">
        {Img ? (
          <img
            src={Img}
            alt=""
            loading="lazy"
            decoding="async"
            className="aspect-video w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="aspect-video w-full" />
        )}
      </div>

      {/* One line, always. Reserving two lines kept the tag rows aligned but
          left a gap under every short title; clamping to one gives the same
          alignment and a tighter card. The full title is on the project page
          and in the index on /projects. */}
      <div className="mt-5 flex items-start gap-3">
        <h3 className="line-clamp-1 flex-1 text-lg leading-6 text-ink transition-colors duration-150 ease-out group-hover:text-accent">
          {Title}
        </h3>
        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>

      {Tags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {Tags.slice(0, 2).map((tag) => (
            <li key={tag} className={`font-mono text-meta uppercase ${getTagTone(tag)}`}>
              {tag}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  const className = "group block";

  if (id)
    return (
      <li className={itemClassName}>
        <Link to={`/project/${id}`} className={className}>
          {inner}
        </Link>
      </li>
    );
  if (ProjectLink)
    return (
      <li className={itemClassName}>
        <a href={ProjectLink} target="_blank" rel="noopener noreferrer" className={className}>
          {inner}
        </a>
      </li>
    );
  return <li className={`block ${itemClassName}`}>{inner}</li>;
};

ProjectCard.propTypes = {
  Img: PropTypes.string,
  Title: PropTypes.string,
  Link: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  Tags: PropTypes.arrayOf(PropTypes.string),
  itemClassName: PropTypes.string,
};

export default ProjectCard;
