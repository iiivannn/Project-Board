"use client";

import { useState, useSyncExternalStore } from "react";
import LoadingScreen from "@/components/LoadingScreen";

// Helper to detect if we are on the server or client
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // Client result
    () => false, // Server (initial) result
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const isClient = useIsClient();

  if (!isClient) return null;

  return (
    <>
      {isLoading && (
        <LoadingScreen onLoadComplete={() => setIsLoading(false)} />
      )}
      <div className={`app-content ${isLoading ? "loading" : "loaded"}`}>
        {children}
      </div>
    </>
  );
}
