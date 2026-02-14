"use client";

import { useState, useEffect, useRef } from "react";

export default function LoadingScreen({
  onLoadComplete,
}: {
  onLoadComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number>(null);

  useEffect(() => {
    const duration = 2000; // Total loading time in ms (2 seconds)

    // Initialize start time here instead of during render
    if (startTimeRef.current === null) {
      startTimeRef.current = performance.now();
    }

    const startTime = startTimeRef.current;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progressPercent = Math.min((elapsed / duration) * 100, 100);

      // Easing function for smooth deceleration (ease-out)
      const easeOut = (t: number) => t * (2 - t);

      const easedProgress = easeOut(progressPercent / 100) * 100;

      setProgress(easedProgress);

      if (progressPercent < 100) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Finished loading
        setTimeout(() => {
          onLoadComplete();
        }, 400);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onLoadComplete]);

  return (
    <div className="loading-screen">
      <div className="loading-number">{Math.floor(progress)}</div>
    </div>
  );
}
