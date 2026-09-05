import { useMemo, useState } from "react";
import { usePortfolio } from "../context/usePortfolio";
import ProjectList from "../components/ProjectList";
import { SectionHeading } from "../components/Section";
import { getAvailableTags, projectHasTag } from "../utils/projectCategory";

const ALL = "All";

const Projects = () => {
  const { projects, loading } = usePortfolio();
  const [activeCategory, setActiveCategory] = useState(ALL);

  const categories = useMemo(() => getAvailableTags(projects), [projects]);

  const filtered = useMemo(
    () =>
      activeCategory === ALL
        ? projects
        : projects.filter((project) => projectHasTag(project, activeCategory)),
    [projects, activeCategory]
  );

  return (
    <div className="bg-paper pb-24 pt-20 md:pt-24">
      <div className="shell">
        <SectionHeading
          title="Projects"
          aside={projects.length ? String(filtered.length) : null}
        />

        {categories.length > 0 && (
          <div
            role="group"
            aria-label="Filter projects by type"
            className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2"
          >
            {[ALL, ...categories].map((category) => {
              const isActive = category === activeCategory;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={isActive}
                  className={`font-mono text-meta uppercase transition-colors duration-150 ease-out ${
                    isActive
                      ? "text-accent underline decoration-1 underline-offset-4"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}

        <ProjectList
          projects={filtered}
          emptyMessage={loading ? "Loading projects." : "No projects match this filter."}
        />
      </div>
    </div>
  );
};

export default Projects;
