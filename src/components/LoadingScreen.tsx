"use client";

import { useState, useEffect } from "react";

export default function LoadingScreen({
  onLoadComplete,
}: {
  onLoadComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we get closer to 100
        const increment =
          prev < 60
            ? Math.random() * 15
            : prev < 85
              ? Math.random() * 5 + 2 // Medium: 2-7
              : prev < 95
                ? Math.random() * 10
                : Math.random() * 2 + 0.5; // Slow: 0.5-2.5

        const next = Math.min(prev + increment, 99);

        // Once we hit 99, jump to 100 and finish
        if (next >= 99) {
          setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
              onLoadComplete();
            }, 500);
          }, 300);
          clearInterval(interval);
          return 99;
        }

        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onLoadComplete]);

  return (
    <div className="loading-screen">
      <div className="loading-number">{Math.floor(progress)}</div>
    </div>
  );
}
