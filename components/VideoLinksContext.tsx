"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { GameStats } from "@/lib/stats";

type VideoLinksContextValue = {
  videoLinks: Record<string, string>;
  setVideoLink: (key: string, value: string) => void;
  mergeIntoStats: (stats: GameStats) => GameStats;
};

const VideoLinksContext = createContext<VideoLinksContextValue | null>(null);

type VideoLinksProviderProps = {
  initialVideoLinks: Record<string, string>;
  children: ReactNode;
};

export function VideoLinksProvider({ initialVideoLinks, children }: VideoLinksProviderProps) {
  const [videoLinks, setVideoLinks] = useState<Record<string, string>>(initialVideoLinks);

  const value = useMemo<VideoLinksContextValue>(
    () => ({
      videoLinks,
      setVideoLink(key, value) {
        setVideoLinks((prev) => ({ ...prev, [key]: value }));
      },
      mergeIntoStats(stats) {
        const override = <T extends { videoLink?: string }>(key: string, group: T | null | undefined) =>
          group && videoLinks[key] != null ? { ...group, videoLink: videoLinks[key] } : group;
        return {
          ...stats,
          backToGoalPlay: override("backToGoalPlay", stats.backToGoalPlay),
          oneVoneFinishing: override("oneVoneFinishing", stats.oneVoneFinishing),
          duels1v1: override("duels1v1", stats.duels1v1),
          runsInBehind: override("runsInBehind", stats.runsInBehind),
          passing: override("passing", stats.passing),
          finishing: override("finishing", stats.finishing),
        };
      },
    }),
    [videoLinks],
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
