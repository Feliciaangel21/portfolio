import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { fetchProject } from "../lib/portfolioApi";
import ProjectGallery from "./ProjectGallery";
import { Subheading } from "./Section";
import { getProjectTags } from "../utils/projectCategory";

const normalise = (data) => ({
  ...data,
  Features: data.Features || [],
  TechStack: data.TechStack || [],
  Github: data.Github || "https://github.com/Feliciaangel21",
});

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    const cached = storedProjects.find((entry) => String(entry.id) === id);

    if (cached) {
      setProject(normalise(cached));
      return;
    }

    fetchProject(id)
      .then((data) => (data ? setProject(normalise(data)) : setNotFound(true)))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-paper">
        <div className="shell max-w-prose">
          <h1 className="text-3xl">That project could not be found.</h1>
          <Link to="/" className="link-underline mt-6 inline-block text-ink-body hover:text-accent">
            Back to all work
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-paper">
        <p className="font-mono text-meta uppercase text-ink-muted">Loading</p>
      </div>
    );
  }

  const tags = getProjectTags(project);
  const isPrivateSource = project.Github === "Private";

  return (
    <article className="bg-paper pb-24 pt-20 md:pt-24">
      <div className="shell">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 font-mono text-meta uppercase text-ink-muted transition-colors duration-150 ease-out hover:text-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
          All work
        </button>

        <header className="mt-10 border-b border-rule pb-10">
          <h1 className="max-w-[20ch] text-4xl md:text-5xl">{project.Title}</h1>

          {project.Description ? (
            <p className="mt-6 max-w-prose text-lg text-ink-body">{project.Description}</p>
          ) : null}
        </header>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <ProjectGallery project={project} />
          </div>

          {/* Everything factual about the project in one column, as a table.
              The old page spread this across two gradient stat tiles and a row
              of badges; a table is denser and easier to scan. */}
          <aside className="lg:col-span-4 lg:col-start-9">
            <dl className="border-t border-rule">
              {tags.length > 0 && (
                <div className="border-b border-rule py-4">
                  <dt className="font-mono text-meta uppercase text-ink-muted">Type</dt>
                  <dd className="mt-2 text-sm text-ink-body">{tags.join(", ")}</dd>
                </div>
              )}

              {project.TechStack.length > 0 && (
                <div className="border-b border-rule py-4">
                  <dt className="font-mono text-meta uppercase text-ink-muted">Built with</dt>
                  <dd className="mt-2 text-sm text-ink-body">
                    {project.TechStack.join(", ")}
                  </dd>
                </div>
              )}

              <div className="border-b border-rule py-4">
                <dt className="font-mono text-meta uppercase text-ink-muted">Links</dt>
                <dd className="mt-2 space-y-2">
                  {project.Link ? (
                    <a
                      href={project.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-1.5 text-sm text-ink transition-colors duration-150 ease-out hover:text-accent"
                    >
                      <span className="link-underline">Live demo</span>
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  ) : (
                    <p className="text-sm text-ink-muted">No live demo</p>
                  )}

                  {isPrivateSource ? (
                    <p className="text-sm text-ink-muted">Source code is private</p>
                  ) : (
                    <a
                      href={project.Github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-1.5 text-sm text-ink transition-colors duration-150 ease-out hover:text-accent"
                    >
                      <span className="link-underline">Source on GitHub</span>
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  )}
                </dd>
              </div>
            </dl>
          </aside>
        </div>

        {project.Features.length > 0 && (
          <section className="mt-20">
            <Subheading title="Features" />
            <ul className="mt-8 grid max-w-4xl grid-cols-1 gap-x-10 sm:grid-cols-2">
              {project.Features.map((feature, index) => (
                <li
                  key={index}
                  className="flex gap-4 border-b border-rule py-4 text-sm text-ink-body"
                >
                  <span className="nums shrink-0 text-meta text-ink-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
};

export default ProjectDetails;
