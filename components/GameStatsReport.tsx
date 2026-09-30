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
  const { player, backFootDuels, backFootPassing, oneVoneFinishing, finishing, meta } = stats;

  const passAttempts = backFootPassing.correct + backFootPassing.wrong;
  const passAccuracy = percent(backFootPassing.correct, passAttempts);

  const topics: Topic[] = [
    {
      id: "back-foot-duels",
      title: "Back-Foot Duels",
      phase: "defensive",
      content: (
        <BigStat
          value={String(backFootDuels.successfulPressure)}
          caption="Times successfully withstood back-foot pressure during the match"
          tone="positive"
        />
      ),
    },
    {
      id: "back-foot-passing",
      title: "Back-Foot Play + Key/Vertical Pass",
      phase: "build-up",
      content: (
        <>
          <MetricFlow
            items={[
              <div key="vertical" className="metric-card metric-card--hero">
                <h3 className="metric-card__title">Vertical passes</h3>
                <span className="metric-card__value">{backFootPassing.verticalPasses}</span>
                <p className="metric-card__caption">Vertical passes from back-foot situations</p>
              </div>,
              <div key="key" className="metric-card">
                <h3 className="metric-card__title">Key passes</h3>
                <span className="metric-card__value">{backFootPassing.keyPasses}</span>
                <p className="metric-card__caption">Passes that created a clear scoring opportunity</p>
              </div>,
              <SplitMeter
                key="accuracy"
                title="Pass outcome"
                headline={`${backFootPassing.correct} of ${passAttempts} · ${passAccuracy}%`}
                primary={backFootPassing.correct}
                secondary={backFootPassing.wrong}
                primaryLabel="Correct"
                secondaryLabel="Wrong"
                primaryTone="positive"
                secondaryTone="negative"
              />,
            ]}
          />
          <ClipLinks scope="backFootPassing" />
        </>
      ),
    },
    {
      id: "one-v-one-finishing",
      title: "1v1 + Finishing",
      phase: "build-up",
      content: (
        <>
          <MetricFlow
            items={[
              <div key="shots" className="metric-card metric-card--hero">
                <h3 className="metric-card__title">Shots</h3>
                <span className="metric-card__value">{oneVoneFinishing.shots}</span>
                <p className="metric-card__caption">Shots taken from 1v1 situations</p>
              </div>,
              <div key="duels" className="metric-card">
                <h3 className="metric-card__title">Duels won</h3>
                <span className="metric-card__value">{oneVoneFinishing.duelsWon}</span>
                <p className="metric-card__caption">1v1 duels won in the match</p>
              </div>,
              <div key="goals" className="metric-card">
                <h3 className="metric-card__title">Goals</h3>
                <span className="metric-card__value">{oneVoneFinishing.goals}</span>
                <p className="metric-card__caption">Goals scored from 1v1 situations</p>
              </div>,
            ]}
          />
          <ClipLinks scope="oneVoneFinishing" />
        </>
      ),
    },
    {
      id: "finishing",
      title: "Finishing",
      phase: "build-up",
      content: (
        <MetricFlow
          items={[
            <div key="total" className="metric-card metric-card--hero">
              <h3 className="metric-card__title">Shots</h3>
              <span className="metric-card__value">{finishing.shots}</span>
              <p className="metric-card__caption">Total finishing attempts in the match</p>
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
      initialBackFootPassingVideoLink={backFootPassing.videoLink}
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
