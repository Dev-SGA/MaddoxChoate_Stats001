"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { GameStats } from "@/lib/stats";

type VideoLinksContextValue = {
  backToGoalPlayVideoLink: string;
  setBackToGoalPlayVideoLink: (value: string) => void;
  oneVoneFinishingVideoLink: string;
  setOneVoneFinishingVideoLink: (value: string) => void;
  mergeIntoStats: (stats: GameStats) => GameStats;
};

const VideoLinksContext = createContext<VideoLinksContextValue | null>(null);

type VideoLinksProviderProps = {
  initialBackToGoalPlayVideoLink: string;
  initialOneVoneFinishingVideoLink: string;
  children: ReactNode;
};

export function VideoLinksProvider({
  initialBackToGoalPlayVideoLink,
  initialOneVoneFinishingVideoLink,
  children,
}: VideoLinksProviderProps) {
  const [backToGoalPlayVideoLink, setBackToGoalPlayVideoLink] = useState(initialBackToGoalPlayVideoLink);
  const [oneVoneFinishingVideoLink, setOneVoneFinishingVideoLink] = useState(initialOneVoneFinishingVideoLink);

  const value = useMemo<VideoLinksContextValue>(
    () => ({
      backToGoalPlayVideoLink,
      setBackToGoalPlayVideoLink,
      oneVoneFinishingVideoLink,
      setOneVoneFinishingVideoLink,
      mergeIntoStats(stats) {
        return {
          ...stats,
          backToGoalPlay: { ...stats.backToGoalPlay, videoLink: backToGoalPlayVideoLink },
          oneVoneFinishing: { ...stats.oneVoneFinishing, videoLink: oneVoneFinishingVideoLink },
        };
      },
    }),
    [backToGoalPlayVideoLink, oneVoneFinishingVideoLink],
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
