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
  /** Optional direction note, e.g. "Only 1 forward — rest backwards". */
  note?: string;
  videoLink?: string;
};

/** 1v1 situations that turned into shots. */
export type OneVoneFinishing = {
  shots: number;
  duelsWon: number;
  /** Total 1v1 duels attempted. */
  total?: number;
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

function rate(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

export type ProgressPoint = {
  id: string;
  label: string;
  shortLabel: string;
  logo?: string;
  quantity: number;
  /** Success rate in percent (0-100). */
  quality?: number;
  qualityDetail?: string;
};

export type ProgressMetric = {
  id: string;
  title: string;
  phase: "hold-up-play" | "attacking" | "finishing";
  quantityLabel: string;
  qualityLabel?: string;
  points: ProgressPoint[];
};

/** Match-by-match trend metrics; only matches with back-to-goal play are compared. */
export function progressMetrics(allMatches: MatchStats[]): ProgressMetric[] {
  const matches = allMatches.filter((match) => match.backToGoalPlay);
  if (matches.length === 0) return [];

  const base = (match: MatchStats) => ({
    id: match.id,
    label: match.label,
    shortLabel: match.shortLabel,
    logo: match.logo,
  });
  const every = (pick: (match: MatchStats) => unknown) => matches.every((match) => pick(match) != null);
  const everyOneVoneTotal = matches.every((match) => match.oneVoneFinishing?.total != null);

  const metrics: (ProgressMetric | null)[] = [
    every((match) => match.backToGoalDuels)
      ? {
          id: "back-to-goal-duels",
          title: "Back-to-Goal Duels",
          phase: "hold-up-play",
          quantityLabel: "Hold-ups",
          points: matches.map((match) => ({ ...base(match), quantity: match.backToGoalDuels?.heldOff ?? 0 })),
        }
      : null,
    {
      id: "vertical-passes",
      title: "Vertical Passes",
      phase: "hold-up-play",
      quantityLabel: "Vertical passes",
      qualityLabel: "Pass completion",
      points: matches.map((match) => {
        const play = match.backToGoalPlay!;
        const attempts = play.completed + play.incomplete;
        return {
          ...base(match),
          quantity: play.verticalPasses,
          quality: rate(play.completed, attempts),
          qualityDetail: `${play.completed} of ${attempts} completed`,
        };
      }),
    },
    {
      id: "key-passes",
      title: "Key Passes",
      phase: "hold-up-play",
      quantityLabel: "Key passes",
      points: matches.map((match) => ({ ...base(match), quantity: match.backToGoalPlay!.keyPasses })),
    },
    every((match) => match.oneVoneFinishing)
      ? {
          id: "one-v-one",
          title: "1v1 Duels Won",
          phase: "finishing",
          quantityLabel: "Won",
          ...(everyOneVoneTotal ? { qualityLabel: "Win rate" } : {}),
          points: matches.map((match) => {
            const won = match.oneVoneFinishing!.duelsWon;
            const total = match.oneVoneFinishing!.total;
            return {
              ...base(match),
              quantity: won,
              ...(everyOneVoneTotal && total != null
                ? { quality: rate(won, total), qualityDetail: `${won} of ${total} won` }
                : {}),
            };
          }),
        }
      : null,
    every((match) => match.finishing)
      ? {
          id: "shots",
          title: "Shots",
          phase: "finishing",
          quantityLabel: "Shots",
          qualityLabel: "On target",
          points: matches.map((match) => {
            const { shots, onTarget } = match.finishing!;
            return {
              ...base(match),
              quantity: shots,
              quality: rate(onTarget, shots),
              qualityDetail: `${onTarget} of ${shots} on target`,
            };
          }),
        }
      : null,
    every((match) => match.finishing)
      ? {
          id: "goals",
          title: "Goals",
          phase: "finishing",
          quantityLabel: "Goals",
          points: matches.map((match) => ({ ...base(match), quantity: match.finishing!.goals ?? 0 })),
        }
      : null,
  ];

  return metrics.filter((metric): metric is ProgressMetric => metric !== null);
}
