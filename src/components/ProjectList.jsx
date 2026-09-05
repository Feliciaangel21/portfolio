import PropTypes from "prop-types";
import ProjectRow from "./ProjectRow";
import { getProjectTags } from "../utils/projectCategory";

// Shared by the landing page (a short featured set) and the work page (the
// full, filterable index) so the row treatment cannot drift between them.
const ProjectList = ({ projects, emptyMessage = "Nothing here yet." }) => {
  if (!projects.length) {
    return (
      <p className="border-y border-rule py-12 text-center text-sm text-ink-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="border-t border-rule">
      {projects.map((project, index) => (
        <ProjectRow
          key={project.id ?? index}
          index={index}
          {...project}
          Tags={getProjectTags(project)}
        />
      ))}
    </ul>
  );
};

ProjectList.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  emptyMessage: PropTypes.string,
};

export default ProjectList;
