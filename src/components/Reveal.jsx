import { useEffect, useRef, useState } from "react";

function Reveal({
  children,
  delay = 0,
  rootMargin = "0px 0px -50% 0px",
}) {
  const [visible, setVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [rootMargin]);

  return (
    <div
      ref={elementRef}
      className={visible ? "animate-reveal visible" : "animate-reveal"}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default Reveal;
