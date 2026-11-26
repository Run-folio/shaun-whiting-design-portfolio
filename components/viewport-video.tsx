"use client";

import { useEffect, useRef } from "react";

type ViewportVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  autoplayOnView?: boolean;
};

export function ViewportVideo({ src, poster, className, autoplayOnView }: ViewportVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoplayOnView || !("IntersectionObserver" in window)) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    let startedAutomatically = false;
    const minVisibility = 0.45;

    function sync() {
      if (inView && !document.hidden && !motion.matches) {
        startedAutomatically = true;
        void video!.play().catch(() => { startedAutomatically = false; });
      } else if (startedAutomatically) {
        video!.pause();
        startedAutomatically = false;
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= minVisibility;
      sync();
    }, { threshold: minVisibility });

    observer.observe(video);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [autoplayOnView]);

  return (
    <video ref={videoRef} className={className} poster={poster} controls muted playsInline
      preload="metadata" loop={autoplayOnView}>
      <source src={src} type="video/mp4" />
    </video>
  );
}
