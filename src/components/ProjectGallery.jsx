import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PropTypes from "prop-types";
import { getProjectImages } from "../utils/projectImages";

export default function ProjectGallery({ project }) {
  const images = getProjectImages(project);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => setActiveIndex(0), [project?.id]);
  if (!images.length) return null;

  const showImage = (offset) => setActiveIndex((current) => (current + offset + images.length) % images.length);

  return <div className="space-y-3">
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-2xl group">
      <img src={images[activeIndex]} alt={`${project.Title} screenshot ${activeIndex + 1}`} className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
      {images.length > 1 && <>
        <button type="button" onClick={() => showImage(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-[#030014]/75 p-2 text-white backdrop-blur hover:bg-[#030014]"><ChevronLeft className="h-5 w-5" /></button>
        <button type="button" onClick={() => showImage(1)} aria-label="Next image" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-[#030014]/75 p-2 text-white backdrop-blur hover:bg-[#030014]"><ChevronRight className="h-5 w-5" /></button>
        <span className="absolute bottom-3 right-3 rounded-full bg-[#030014]/75 px-3 py-1 text-xs text-white/80 backdrop-blur">{activeIndex + 1} / {images.length}</span>
      </>}
    </div>
    {images.length > 1 && <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">{images.map((image, index) =>
      <button key={`${image}-${index}`} type="button" onClick={() => setActiveIndex(index)} className={`overflow-hidden rounded-lg border-2 transition ${index === activeIndex ? "border-purple-400" : "border-transparent opacity-60 hover:opacity-100"}`}><img src={image} alt="" className="aspect-video h-full w-full object-cover" loading="lazy" /></button>
    )}</div>}
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
