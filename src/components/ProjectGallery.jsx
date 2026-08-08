import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import PropTypes from "prop-types";
import { getProjectImages } from "../utils/projectImages";

export default function ProjectGallery({ project }) {
  const images = getProjectImages(project);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setActiveIndex(0), [project?.id]);

  const showImage = (offset) => setActiveIndex((current) => (current + offset + images.length) % images.length);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
      if (event.key === "ArrowLeft") setActiveIndex((current) => (current - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setActiveIndex((current) => (current + 1) % images.length);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, images.length]);

  if (!images.length) return null;

  const navigation = images.length > 1 && <>
    <button type="button" onClick={(event) => { event.stopPropagation(); showImage(-1); }} aria-label="Previous image" className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-[#030014]/75 p-2 text-white backdrop-blur transition hover:bg-[#030014]"><ChevronLeft className="h-5 w-5" /></button>
    <button type="button" onClick={(event) => { event.stopPropagation(); showImage(1); }} aria-label="Next image" className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-[#030014]/75 p-2 text-white backdrop-blur transition hover:bg-[#030014]"><ChevronRight className="h-5 w-5" /></button>
  </>;

  return <div className="space-y-3">
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-2xl">
      <button type="button" onClick={() => setIsOpen(true)} aria-label="View full-size image" className="block w-full cursor-zoom-in">
        <img src={images[activeIndex]} alt={`${project.Title} screenshot ${activeIndex + 1}`} className="aspect-video w-full object-contain transition-transform duration-500 group-hover:scale-[1.015]" />
        <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-[#030014]/75 p-2 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"><Maximize2 className="h-4 w-4" /></span>
      </button>
      {navigation}
      {images.length > 1 && <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-[#030014]/75 px-3 py-1 text-xs text-white/80 backdrop-blur">{activeIndex + 1} / {images.length}</span>}
    </div>
    {images.length > 1 && <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">{images.map((image, index) =>
      <button key={`${image}-${index}`} type="button" onClick={() => setActiveIndex(index)} className={`overflow-hidden rounded-lg border-2 transition ${index === activeIndex ? "border-purple-400" : "border-transparent opacity-60 hover:opacity-100"}`}><img src={image} alt="" className="aspect-video h-full w-full object-cover" loading="lazy" /></button>
    )}</div>}
    {isOpen && createPortal(
      <div role="dialog" aria-modal="true" aria-label={`${project.Title} image viewer`} onClick={() => setIsOpen(false)} className="fixed inset-0 z-[100] flex flex-col bg-black/95 p-3 backdrop-blur-md sm:p-6">
        <button type="button" onClick={() => setIsOpen(false)} aria-label="Close image viewer" className="absolute right-4 top-4 z-20 rounded-full border border-white/20 bg-black/60 p-2.5 text-white transition hover:bg-white/10"><X className="h-6 w-6" /></button>
        <div className="relative flex min-h-0 flex-1 items-center justify-center" onClick={(event) => event.stopPropagation()}>
          <img src={images[activeIndex]} alt={`${project.Title} screenshot ${activeIndex + 1}`} className="max-h-full max-w-full object-contain" />
          {navigation}
        </div>
        {images.length > 1 && <div className="mt-3 flex shrink-0 justify-center gap-2 overflow-x-auto" onClick={(event) => event.stopPropagation()}>{images.map((image, index) =>
          <button key={`modal-${image}-${index}`} type="button" onClick={() => setActiveIndex(index)} aria-label={`View image ${index + 1}`} className={`h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition sm:h-16 sm:w-24 ${index === activeIndex ? "border-purple-400" : "border-transparent opacity-50 hover:opacity-100"}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>
        )}</div>}
      </div>,
      document.body,
    )}
  </div>;
}

ProjectGallery.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    Title: PropTypes.string.isRequired,
    Img: PropTypes.string,
    Images: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};
