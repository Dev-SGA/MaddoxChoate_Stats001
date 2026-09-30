import gameStats from "@/data/gameStats.json";

export type GameStats = {
  meta: {
    title: string;
    subtitle: string;
  };
  player: {
    name: string;
    club: string;
    photo: string;
  };
  backFootDuels: {
    successfulPressure: number;
  };
  backFootPassing: {
    verticalPasses: number;
    keyPasses: number;
    correct: number;
    wrong: number;
    videoLink: string;
  };
  oneVoneFinishing: {
    shots: number;
    duelsWon: number;
    goals: number;
    videoLink: string;
  };
  finishing: {
    shots: number;
    onTarget: number;
    offTarget: number;
    blocked: number;
  };
};

export function getGameStats(): GameStats {
  return gameStats as GameStats;
}
