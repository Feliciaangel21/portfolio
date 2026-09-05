import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Reveal from "../components/Reveal";
import { SectionHeading } from "../components/Section";
import { usePortfolio } from "../context/usePortfolio";
import { ISSUERS, getIssuer, getTitle } from "../data/certificateIssuers";

const ALL = "All";

const Certificates = () => {
  const { certificates, loading } = usePortfolio();
  const [issuer, setIssuer] = useState(ALL);
  const [openIndex, setOpenIndex] = useState(null);
  const dialogRef = useRef(null);
  const gridRef = useRef(null);

  // Only the issuers actually present get a tab, so the row does not offer a
  // filter that leads to an empty grid.
  const tabs = useMemo(() => {
    const present = new Set(certificates.map(getIssuer));
    return [ALL, ...ISSUERS.filter((name) => present.has(name))];
  }, [certificates]);

  const flat = useMemo(
    () =>
      issuer === ALL
        ? certificates
        : certificates.filter((certificate) => getIssuer(certificate) === issuer),
    [certificates, issuer]
  );

  const selectTab = (name) => {
    setOpenIndex(null);
    setIssuer(name);
  };

  const step = useCallback(
    (offset) =>
      setOpenIndex((current) =>
        current === null ? current : (current + offset + flat.length) % flat.length
      ),
    [flat.length]
  );

  // One viewer for the whole set. The previous version mounted a separate
  // dialog per thumbnail, so moving between certificates meant closing one and
  // opening the next.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openIndex !== null && !dialog.open) dialog.showModal();
    if (openIndex === null && dialog.open) dialog.close();
  }, [openIndex]);

  useEffect(() => {
    if (openIndex === null) return undefined;
    const onKey = (event) => {
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, step]);

  // Returning focus to the thumbnail that opened the viewer keeps keyboard
  // users where they were. The buttons come back in DOM order, which is the
  // same order as the flattened list.
  const close = () => {
    const index = openIndex;
    setOpenIndex(null);
    if (index !== null) gridRef.current?.querySelectorAll("button")[index]?.focus();
  };

  const active = openIndex === null ? null : flat[openIndex];
  const label = (index) => `Certificate ${String(index + 1).padStart(2, "0")}`;

  return (
    <div className="bg-paper pb-24 pt-20 md:pt-24">
      <div className="shell">
        <SectionHeading
          title="Certificates"
          aside={certificates.length ? String(flat.length) : null}
        />

        {tabs.length > 2 && (
          <div
            role="group"
            aria-label="Filter certificates by issuer"
            className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2"
          >
            {tabs.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => selectTab(name)}
                aria-pressed={name === issuer}
                className={`font-mono text-meta uppercase transition-colors duration-150 ease-out ${
                  name === issuer
                    ? "text-accent underline decoration-1 underline-offset-4"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {flat.length ? (
          <ul
            ref={gridRef}
            className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-4"
          >
            {flat.map((certificate, index) => (
              <li key={certificate.id ?? index}>
                <Reveal delay={Math.min(index, 7) * 40}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(index)}
                    className="group block w-full text-left"
                  >
                    <span className="block overflow-hidden bg-surface-deep shadow-plate transition-shadow duration-200 ease-out group-hover:shadow-lift">
                      <img
                        src={certificate.Img}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="aspect-[4/3] w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                      />
                    </span>
                    {/* The course name, not the issuer: the active tab
                        already says who issued it, so repeating that under
                        every thumbnail told the reader nothing. A certificate
                        with no known name shows its number alone rather than
                        a placeholder. */}
                    <span className="mt-3 flex items-baseline gap-3">
                      <span className="nums shrink-0 text-meta text-ink-muted">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {getTitle(certificate) ? (
                        <span className="flex-1 text-sm leading-snug text-ink transition-colors duration-150 ease-out group-hover:text-accent">
                          {getTitle(certificate)}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-y border-rule py-16 text-center text-sm text-ink-muted">
            {loading ? "Loading certificates." : "No certificates yet."}
          </p>
        )}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setOpenIndex(null)}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
        aria-label="Certificate viewer"
        className="max-h-[92vh] w-full max-w-[min(1100px,94vw)] bg-transparent p-0 backdrop:bg-ink/80"
      >
        {active && (
          <div className="relative">
            <img
              src={active.Img}
              alt={getTitle(active) || label(openIndex)}
              className="mx-auto max-h-[80vh] w-auto max-w-full object-contain"
            />

            <div className="mt-3 flex items-baseline gap-4 bg-paper px-4 py-3">
              <p className="flex-1 text-sm text-ink">
                {getTitle(active) || label(openIndex)}
              </p>
              <p className="nums shrink-0 text-meta text-ink-muted">
                {openIndex + 1} / {flat.length}
              </p>
            </div>

            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 grid h-11 w-11 place-items-center bg-paper text-ink transition-colors duration-150 ease-out hover:text-accent"
            >
              <X className="h-5 w-5" />
            </button>

            {flat.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous certificate"
                  className="absolute left-3 top-[40%] grid h-11 w-11 place-items-center bg-paper text-ink transition-colors duration-150 ease-out hover:text-accent"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next certificate"
                  className="absolute right-3 top-[40%] grid h-11 w-11 place-items-center bg-paper text-ink transition-colors duration-150 ease-out hover:text-accent"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
};

export default Certificates;
