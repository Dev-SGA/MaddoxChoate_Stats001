"use client";

import { AthleteProfileCard } from "@/components/AthleteProfileCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { ClipLinks } from "@/components/ClipLinks";
import { VideoLinksProvider } from "@/components/VideoLinksContext";
import { MetricFlow } from "@/components/MetricFlow";
import { SgaBrand } from "@/components/SgaBrand";
import { SgaCornerBrand } from "@/components/SgaCornerBrand";
import { TopicsBoard, type Topic } from "@/components/TopicsBoard";
import { BRAND } from "@/lib/brand";
import type { GameStats } from "@/lib/stats";

type GameStatsReportProps = {
  stats: GameStats;
};

type BarTone = "accent" | "positive" | "negative" | "muted";

function percent(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function SplitMeter({
  title,
  primary,
  secondary,
  primaryLabel,
  secondaryLabel,
  primaryTone,
  secondaryTone,
  headline,
}: {
  title: string;
  primary: number;
  secondary: number;
  primaryLabel: string;
  secondaryLabel: string;
  primaryTone: BarTone;
  secondaryTone: BarTone;
  headline: string;
}) {
  const total = primary + secondary;
  const primaryPct = percent(primary, total);

  return (
    <div className="metric-card">
      <h3 className="metric-card__title">{title}</h3>
      <p className="metric-card__headline">{headline}</p>
      <div className="meter" role="img" aria-label={`${primaryLabel}: ${primary}. ${secondaryLabel}: ${secondary}.`}>
        <span className={`meter__seg meter__seg--${primaryTone}`} style={{ width: `${primaryPct}%` }} />
        <span className={`meter__seg meter__seg--${secondaryTone}`} style={{ width: `${100 - primaryPct}%` }} />
      </div>
      <ul className="legend">
        <li>
          <span className={`legend__dot legend__dot--${primaryTone}`} />
          <span className="legend__label">{primaryLabel}</span>
          <strong>{primary}</strong>
        </li>
        <li>
          <span className={`legend__dot legend__dot--${secondaryTone}`} />
          <span className="legend__label">{secondaryLabel}</span>
          <strong>{secondary}</strong>
        </li>
      </ul>
    </div>
  );
}

function BigStat({ value, caption, tone }: { value: string; caption: string; tone: "positive" | "warn" }) {
  return (
    <div className={`big-stat big-stat--${tone}`}>
      <span className="big-stat__value">{value}</span>
      <p className="big-stat__caption">{caption}</p>
    </div>
  );
}

export function GameStatsReport({ stats }: GameStatsReportProps) {
  const { player, backToGoalDuels, backToGoalPlay, oneVoneFinishing, finishing, meta } = stats;

  const passAttempts = backToGoalPlay.completed + backToGoalPlay.incomplete;
  const passCompletion = percent(backToGoalPlay.completed, passAttempts);
  const conversionRate = percent(oneVoneFinishing.goals, oneVoneFinishing.shots);
  const shotAccuracy = percent(finishing.onTarget, finishing.shots);

  const topics: Topic[] = [
    {
      id: "back-to-goal-duels",
      title: "Back-to-Goal Duels",
      phase: "hold-up-play",
      content: (
        <BigStat
          value={String(backToGoalDuels.heldOff)}
          caption="Times he received with his back to goal, shielded the ball and held off the defender"
          tone="positive"
        />
      ),
    },
    {
      id: "back-to-goal-play",
      title: "Back-to-Goal Play + Key/Vertical Pass",
      phase: "hold-up-play",
      content: (
        <>
          <MetricFlow
            items={[
              <div key="vertical" className="metric-card metric-card--hero">
                <h3 className="metric-card__title">Vertical passes</h3>
                <span className="metric-card__value">{backToGoalPlay.verticalPasses}</span>
                <p className="metric-card__caption">Played forward after holding the ball up with his back to goal</p>
              </div>,
              <div key="key" className="metric-card">
                <h3 className="metric-card__title">Key passes</h3>
                <span className="metric-card__value">{backToGoalPlay.keyPasses}</span>
                <p className="metric-card__caption">Lay-offs that set up a clear scoring chance</p>
              </div>,
              <SplitMeter
                key="completion"
                title="Pass completion"
                headline={`${backToGoalPlay.completed} of ${passAttempts} · ${passCompletion}%`}
                primary={backToGoalPlay.completed}
                secondary={backToGoalPlay.incomplete}
                primaryLabel="Completed"
                secondaryLabel="Incomplete"
                primaryTone="positive"
                secondaryTone="negative"
              />,
            ]}
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
          <MetricFlow
            items={[
              <div key="duels" className="metric-card metric-card--hero">
                <h3 className="metric-card__title">1v1 duels won</h3>
                <span className="metric-card__value">{oneVoneFinishing.duelsWon}</span>
                <p className="metric-card__caption">Beat his direct opponent in 1v1 situations</p>
              </div>,
              <div key="shots" className="metric-card">
                <h3 className="metric-card__title">Shots</h3>
                <span className="metric-card__value">{oneVoneFinishing.shots}</span>
                <p className="metric-card__caption">Shots taken after a 1v1</p>
              </div>,
              <div key="goals" className="metric-card">
                <h3 className="metric-card__title">Goals</h3>
                <span className="metric-card__value">{oneVoneFinishing.goals}</span>
                <span className="metric-card__pct">{conversionRate}% conversion rate</span>
              </div>,
            ]}
          />
          <ClipLinks scope="oneVoneFinishing" />
        </>
      ),
    },
    {
      id: "finishes-in-the-game",
      title: "Finishes in the Game",
      phase: "finishing",
      content: (
        <MetricFlow
          items={[
            <div key="total" className="metric-card metric-card--hero">
              <h3 className="metric-card__title">Total shots</h3>
              <span className="metric-card__value">{finishing.shots}</span>
              <p className="metric-card__caption">{shotAccuracy}% shot accuracy</p>
            </div>,
            <div key="on-target" className="metric-card">
              <h3 className="metric-card__title">On target</h3>
              <span className="metric-card__value">{finishing.onTarget}</span>
              <span className="metric-card__pct">{percent(finishing.onTarget, finishing.shots)}% of shots</span>
            </div>,
            <div key="off-target" className="metric-card">
              <h3 className="metric-card__title">Off target</h3>
              <span className="metric-card__value">{finishing.offTarget}</span>
              <span className="metric-card__pct">{percent(finishing.offTarget, finishing.shots)}% of shots</span>
            </div>,
            <div key="blocked" className="metric-card">
              <h3 className="metric-card__title">Blocked</h3>
              <span className="metric-card__value">{finishing.blocked}</span>
              <span className="metric-card__pct">{percent(finishing.blocked, finishing.shots)}% of shots</span>
            </div>,
          ]}
        />
      ),
    },
  ];

  return (
    <VideoLinksProvider
      initialBackToGoalPlayVideoLink={backToGoalPlay.videoLink}
      initialOneVoneFinishingVideoLink={oneVoneFinishing.videoLink}
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
