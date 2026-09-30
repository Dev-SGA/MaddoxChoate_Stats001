"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { GameStats } from "@/lib/stats";

type VideoLinksContextValue = {
  backFootPassingVideoLink: string;
  setBackFootPassingVideoLink: (value: string) => void;
  oneVoneFinishingVideoLink: string;
  setOneVoneFinishingVideoLink: (value: string) => void;
  mergeIntoStats: (stats: GameStats) => GameStats;
};

const VideoLinksContext = createContext<VideoLinksContextValue | null>(null);

type VideoLinksProviderProps = {
  initialBackFootPassingVideoLink: string;
  initialOneVoneFinishingVideoLink: string;
  children: ReactNode;
};

export function VideoLinksProvider({
  initialBackFootPassingVideoLink,
  initialOneVoneFinishingVideoLink,
  children,
}: VideoLinksProviderProps) {
  const [backFootPassingVideoLink, setBackFootPassingVideoLink] = useState(initialBackFootPassingVideoLink);
  const [oneVoneFinishingVideoLink, setOneVoneFinishingVideoLink] = useState(initialOneVoneFinishingVideoLink);

  const value = useMemo<VideoLinksContextValue>(
    () => ({
      backFootPassingVideoLink,
      setBackFootPassingVideoLink,
      oneVoneFinishingVideoLink,
      setOneVoneFinishingVideoLink,
      mergeIntoStats(stats) {
        return {
          ...stats,
          backFootPassing: { ...stats.backFootPassing, videoLink: backFootPassingVideoLink },
          oneVoneFinishing: { ...stats.oneVoneFinishing, videoLink: oneVoneFinishingVideoLink },
        };
      },
    }),
    [backFootPassingVideoLink, oneVoneFinishingVideoLink],
  );

  return <VideoLinksContext.Provider value={value}>{children}</VideoLinksContext.Provider>;
}

export function useVideoLinks(): VideoLinksContextValue {
  const ctx = useContext(VideoLinksContext);
  if (!ctx) {
    throw new Error("useVideoLinks must be used within VideoLinksProvider");
  }
  return ctx;
}
