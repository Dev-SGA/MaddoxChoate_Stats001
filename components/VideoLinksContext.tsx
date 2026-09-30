"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { GameStats } from "@/lib/stats";

type VideoLinksContextValue = {
  backToGoalPlayVideoLink: string;
  setBackToGoalPlayVideoLink: (value: string) => void;
  finishingVideoLink: string;
  setFinishingVideoLink: (value: string) => void;
  mergeIntoStats: (stats: GameStats) => GameStats;
};

const VideoLinksContext = createContext<VideoLinksContextValue | null>(null);

type VideoLinksProviderProps = {
  initialBackToGoalPlayVideoLink: string;
  initialFinishingVideoLink: string;
  children: ReactNode;
};

export function VideoLinksProvider({
  initialBackToGoalPlayVideoLink,
  initialFinishingVideoLink,
  children,
}: VideoLinksProviderProps) {
  const [backToGoalPlayVideoLink, setBackToGoalPlayVideoLink] = useState(initialBackToGoalPlayVideoLink);
  const [finishingVideoLink, setFinishingVideoLink] = useState(initialFinishingVideoLink);

  const value = useMemo<VideoLinksContextValue>(
    () => ({
      backToGoalPlayVideoLink,
      setBackToGoalPlayVideoLink,
      finishingVideoLink,
      setFinishingVideoLink,
      mergeIntoStats(stats) {
        return {
          ...stats,
          backToGoalPlay: { ...stats.backToGoalPlay, videoLink: backToGoalPlayVideoLink },
          finishing: { ...stats.finishing, videoLink: finishingVideoLink },
        };
      },
    }),
    [backToGoalPlayVideoLink, finishingVideoLink],
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
