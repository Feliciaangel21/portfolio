import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

// Replaces AOS. AOS was initialised in three places, re-ran on every resize,
// and in About it used `once: false` so animations replayed on every scroll
// past. It also had no reduced-motion path.
//
// This does the same job with one IntersectionObserver per element, fires
// once, and returns immediately-visible content when the visitor has asked
// for reduced motion.
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const Reveal = ({ children, delay = 0, as: Tag = "div", className = "" }) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (shown || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={
        shown
          ? { animation: `reveal 420ms cubic-bezier(0.23, 1, 0.32, 1) ${delay}ms both` }
          : { opacity: 0 }
      }
    >
      {children}
    </Tag>
  );
};

Reveal.propTypes = {
  children: PropTypes.node,
  delay: PropTypes.number,
  as: PropTypes.elementType,
  className: PropTypes.string,
};

export default Reveal;
