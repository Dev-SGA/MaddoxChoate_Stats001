"use client";

import { AthleteProfileCard } from "@/components/AthleteProfileCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { ClipLinks } from "@/components/ClipLinks";
import { VideoLinksProvider } from "@/components/VideoLinksContext";
import { SgaBrand } from "@/components/SgaBrand";
import { SgaCornerBrand } from "@/components/SgaCornerBrand";
import { TopicsBoard, type Topic } from "@/components/TopicsBoard";
import { BRAND } from "@/lib/brand";
import type { GameStats } from "@/lib/stats";

type GameStatsReportProps = {
  stats: GameStats;
};

type Tone = "accent" | "positive" | "negative" | "muted";

function percent(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

type Tile = {
  label: string;
  value: number;
  tone?: Tone;
  detail?: string;
};

type Rate = {
  label: string;
  value: number;
  note: string;
  segments: { label: string; value: number; tone: Tone }[];
};

function StatPanel({
  value,
  unit,
  description,
  tiles,
  rate,
  goalHighlight,
}: {
  value: number;
  unit: string;
  description?: string;
  tiles?: Tile[];
  rate?: Rate;
  goalHighlight?: number;
}) {
  const rateTotal = rate ? rate.segments.reduce((sum, segment) => sum + segment.value, 0) : 0;

  return (
    <div className="stat-panel">
      <div className="stat-panel__top">
        <div className="stat-panel__hero">
          <span className="stat-panel__value">{value}</span>
          <span className="stat-panel__unit">{unit}</span>
        </div>
        {tiles ? (
          <ul className="stat-tiles">
            {tiles.map((tile) => (
              <li key={tile.label} className="stat-tile">
                <span className={`stat-tile__value${tile.tone ? ` stat-tile__value--${tile.tone}` : ""}`}>
                  {tile.value}
                </span>
                <span className="stat-tile__label">{tile.label}</span>
                {tile.detail ? <span className="stat-tile__detail">{tile.detail}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="stat-panel__description">{description}</p>
        )}
      </div>

      {goalHighlight !== undefined && goalHighlight > 0 ? (
        <p className="stat-panel__goal">
          <span className="stat-panel__goal-value">{goalHighlight}</span>
          <span className="stat-panel__goal-label">{goalHighlight === 1 ? "Goal" : "Goals"}</span>
        </p>
      ) : null}

      {rate ? (
        <div className="rate">
          <div className="rate__head">
            <span className="rate__label">{rate.label}</span>
            <span className="rate__value">{rate.value}%</span>
          </div>
          <div
            className="meter"
            role="img"
            aria-label={rate.segments.map((segment) => `${segment.label}: ${segment.value}`).join(". ")}
          >
            {rate.segments.map((segment) =>
              segment.value > 0 ? (
                <span
                  key={segment.label}
                  className={`meter__seg meter__seg--${segment.tone}`}
                  style={{ width: `${percent(segment.value, rateTotal)}%` }}
                />
              ) : null,
            )}
          </div>
          <div className="rate__foot">
            <ul className="rate__legend">
              {rate.segments.map((segment) => (
                <li key={segment.label}>
                  <span className={`legend__dot legend__dot--${segment.tone}`} />
                  {segment.label}
                  <strong>{segment.value}</strong>
                </li>
              ))}
            </ul>
            <span className="rate__note">{rate.note}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function GameStatsReport({ stats }: GameStatsReportProps) {
  const { player, backToGoalDuels, backToGoalPlay, oneVoneFinishing, finishing, meta } = stats;

  const passAttempts = backToGoalPlay.completed + backToGoalPlay.incomplete;
  const backToGoalDuelsNote =
    "Successful playing with his back to goal — held the ball up and brought teammates into the attack.";

  const topics: Topic[] = [
    {
      id: "back-to-goal-duels",
      title: "Back-to-Goal Duels",
      phase: "hold-up-play",
      content: (
        <StatPanel
          value={backToGoalDuels.heldOff}
          unit="Successful hold-ups"
          description={backToGoalDuelsNote}
        />
      ),
    },
    {
      id: "back-to-goal-play",
      title: "Back-to-Goal Play + Key/Vertical Pass",
      phase: "hold-up-play",
      content: (
        <>
          <StatPanel
            value={backToGoalPlay.verticalPasses}
            unit="Vertical passes"
            tiles={[
              { label: "Key passes", value: backToGoalPlay.keyPasses, tone: "accent", detail: "Set up a clear chance" },
              { label: "Completed", value: backToGoalPlay.completed, tone: "positive" },
              { label: "Incomplete", value: backToGoalPlay.incomplete, tone: "negative" },
            ]}
            rate={{
              label: "Pass completion",
              value: percent(backToGoalPlay.completed, passAttempts),
              note: `${backToGoalPlay.completed} of ${passAttempts} passes completed`,
              segments: [
                { label: "Completed", value: backToGoalPlay.completed, tone: "positive" },
                { label: "Incomplete", value: backToGoalPlay.incomplete, tone: "negative" },
              ],
            }}
          />
          <ClipLinks scope="backToGoalPlay" />
        </>
      ),
    },
    {
      id: "one-v-one-finishing",
      title: "1v1 + Finishing",
      phase: "finishing",
      content: (
        <>
          <StatPanel
            value={oneVoneFinishing.duelsWon}
            unit="1v1 duels won"
            tiles={[{ label: "Shots", value: oneVoneFinishing.shots, detail: "After a 1v1" }]}
            goalHighlight={oneVoneFinishing.goals}
          />
        </>
      ),
    },
    {
      id: "finishes-in-the-game",
      title: "Finishes in the Game",
      phase: "finishing",
      content: (
        <>
          <StatPanel
            value={finishing.shots}
            unit="Total shots"
            tiles={[
              {
                label: "On target",
                value: finishing.onTarget,
                tone: "positive",
                detail: `${percent(finishing.onTarget, finishing.shots)}% of shots`,
              },
              {
                label: "Off target",
                value: finishing.offTarget,
                tone: "negative",
                detail: `${percent(finishing.offTarget, finishing.shots)}% of shots`,
              },
              {
                label: "Blocked",
                value: finishing.blocked,
                tone: "muted",
                detail: `${percent(finishing.blocked, finishing.shots)}% of shots`,
              },
            ]}
            rate={{
              label: "Shot accuracy",
              value: percent(finishing.onTarget, finishing.shots),
              note: `${finishing.onTarget} of ${finishing.shots} shots on target`,
              segments: [
                { label: "On target", value: finishing.onTarget, tone: "positive" },
                { label: "Off target", value: finishing.offTarget, tone: "negative" },
                { label: "Blocked", value: finishing.blocked, tone: "muted" },
              ],
            }}
          />
          <ClipLinks scope="finishing" />
        </>
      ),
    },
  ];

  return (
    <VideoLinksProvider
      initialBackToGoalPlayVideoLink={backToGoalPlay.videoLink}
      initialFinishingVideoLink={finishing.videoLink}
    >
      <SgaCornerBrand />

      <div className="shell">
        <header className="report-header">
          <SgaBrand />
          <div className="report-header__intro">
            <p className="report-header__eyebrow">{BRAND.legal}</p>
            <h1 className="report-header__title">{meta.title}</h1>
            <p className="report-header__meta">{meta.subtitle}</p>
          </div>
        </header>

        <div className="report-grid">
          <AthleteProfileCard name={player.name} club={player.club} photoSrc={player.photo}>
            <ExportPdfButton stats={stats} />
          </AthleteProfileCard>

          <main className="report-main">
            <TopicsBoard topics={topics} />
          </main>
        </div>

        <footer className="footer">
          <p className="footer__slogan">{BRAND.slogan}</p>
          <p className="footer__rights">All rights reserved.</p>
        </footer>
      </div>
    </VideoLinksProvider>
  );
}
