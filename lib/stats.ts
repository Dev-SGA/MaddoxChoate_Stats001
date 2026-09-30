import gameStats from "@/data/gameStats.json";

export type GameStats = {
  meta: {
    title: string;
    subtitle: string;
    session: string;
  };
  player: {
    name: string;
    club: string;
    photo: string;
  };
  backToGoalDuels: {
    heldOff: number;
  };
  backToGoalPlay: {
    verticalPasses: number;
    keyPasses: number;
    completed: number;
    incomplete: number;
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
