"use client";

import { useState, useSyncExternalStore } from "react";
import LoadingScreen from "@/components/LoadingScreen";

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
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
