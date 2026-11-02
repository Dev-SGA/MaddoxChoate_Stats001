import gameStats from "@/data/gameStats.json";

export type MatchVideo = {
  label: string;
  url: string;
};

/** Successful back-to-goal duels where the striker held the ball up. */
export type BackToGoalDuels = {
  heldOff: number;
};

export type BackToGoalPlay = {
  verticalPasses: number;
  keyPasses: number;
  completed: number;
  incomplete: number;
  videoLink?: string;
};

/** 1v1 situations that turned into shots. */
export type OneVoneFinishing = {
  shots: number;
  duelsWon: number;
  goals: number;
  videoLink?: string;
};

/** 1v1 offensive duels judged by play outcome. */
export type Duels1v1 = {
  total: number;
  positive: number;
  negative: number;
  /** Duels that ended in a goal. */
  goals: number;
  /** Positive plays where the duel progressed the attack and ended in a goal. */
  progressedToGoal?: number;
  /** Positive plays won but without progression afterwards. */
  wonNoProgression?: number;
  videoLink?: string;
};

/** "Movimentos de ruptura" — off-ball runs in behind the defensive line. */
export type RunsInBehind = {
  runs: number;
  received: number;
  shots: number;
  goals: number;
  videoLink?: string;
};

export type Passing = {
  finalThird: number;
  intoBox: number;
  videoLink?: string;
};

export type Finishing = {
  shots: number;
  onTarget: number;
  goals?: number;
  offTarget: number;
  blocked: number;
  woodwork?: number;
  videoLink?: string;
};

export type MatchStats = {
  id: string;
  label: string;
  shortLabel: string;
  logo?: string;
  backToGoalDuels?: BackToGoalDuels | null;
  backToGoalPlay?: BackToGoalPlay | null;
  oneVoneFinishing?: OneVoneFinishing | null;
  duels1v1?: Duels1v1 | null;
  runsInBehind?: RunsInBehind | null;
  passing?: Passing | null;
  finishing?: Finishing | null;
  videos?: MatchVideo[];
};

export type StatsReport = {
  meta: {
    title: string;
    subtitle: string;
    session: string;
  };
  player: {
    name: string;
    club: string;
    clubLogo?: string;
    photo: string;
  };
  matches: MatchStats[];
};

export type GameStats = {
  meta: StatsReport["meta"] & { fileSlug: string };
  player: StatsReport["player"];
  opponentLogo?: string;
  backToGoalDuels?: BackToGoalDuels | null;
  backToGoalPlay?: BackToGoalPlay | null;
  oneVoneFinishing?: OneVoneFinishing | null;
  duels1v1?: Duels1v1 | null;
  runsInBehind?: RunsInBehind | null;
  passing?: Passing | null;
  finishing?: Finishing | null;
  videos?: MatchVideo[];
};

export function clipUrl(videos: MatchVideo[] | undefined, ...aliases: string[]): string | undefined {
  if (!videos?.length) return undefined;
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const keys = new Set(aliases.map(normalize));
  return videos.find((video) => keys.has(normalize(video.label)))?.url;
}

export function getStatsReport(): StatsReport {
  return gameStats as StatsReport;
}

/** Whole numbers stay as they are; averages show one decimal. */
export function formatCount(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return (Math.round(value * 10) / 10).toFixed(1).replace(/\.0$/, "");
}

export function toGameStats(report: StatsReport, match: MatchStats): GameStats {
  return {
    meta: {
      ...report.meta,
      subtitle: match.label,
      fileSlug: `${report.meta.session}-${match.id}`,
    },
    player: report.player,
    opponentLogo: match.logo,
    backToGoalDuels: match.backToGoalDuels ?? null,
    backToGoalPlay: match.backToGoalPlay ?? null,
    oneVoneFinishing: match.oneVoneFinishing ?? null,
    duels1v1: match.duels1v1 ?? null,
    runsInBehind: match.runsInBehind ?? null,
    passing: match.passing ?? null,
    finishing: match.finishing ?? null,
    videos: match.videos,
  };
}
