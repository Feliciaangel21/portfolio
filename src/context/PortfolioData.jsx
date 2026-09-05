import { useCallback, useEffect, useMemo, useState } from "react";
import { PortfolioContext } from "./portfolioContext";
import PropTypes from "prop-types";
import { fetchProjects, fetchCertificates, fetchExperiences } from "../lib/portfolioApi";

// Projects, certificates and experience are needed by several routes now, so
// they are fetched once here instead of by whichever page happened to render
// first.
// This also replaces the `portfolio:data` custom event the single-page build
// used to get counts from the work section over to the about section.

const readCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const PortfolioProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => readCache("projects"));
  const [certificates, setCertificates] = useState(() => readCache("certificates"));
  const [experiences, setExperiences] = useState(() => readCache("experiences"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [projectData, certificateData, experienceData] = await Promise.all([
        fetchProjects(),
        fetchCertificates(),
        fetchExperiences(),
      ]);

      setProjects(projectData);
      setCertificates(certificateData);
      setExperiences(experienceData);
      setError(null);
      localStorage.setItem("projects", JSON.stringify(projectData));
      localStorage.setItem("certificates", JSON.stringify(certificateData));
      localStorage.setItem("experiences", JSON.stringify(experienceData));
    } catch (caught) {
      console.error("Could not load portfolio data:", caught.message);
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({ projects, certificates, experiences, loading, error, reload: load }),
    [projects, certificates, experiences, loading, error, load]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};

PortfolioProvider.propTypes = { children: PropTypes.node };
