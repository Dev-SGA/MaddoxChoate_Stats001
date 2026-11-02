"use client";

import { useMemo, useState } from "react";
import { AthleteProfileCard } from "@/components/AthleteProfileCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { ClipAnchor, ClipLegendLabel, ClipMetricTitle } from "@/components/ClipUi";
import { VideoLinksProvider } from "@/components/VideoLinksContext";
import { MetricFlow } from "@/components/MetricFlow";
import { SgaBrand } from "@/components/SgaBrand";
import { SgaCornerBrand } from "@/components/SgaCornerBrand";
import { TopicsBoard, type Topic } from "@/components/TopicsBoard";
import { BRAND } from "@/lib/brand";
import { formatCount, toGameStats, type MatchStats, type StatsReport } from "@/lib/stats";

type GameStatsReportProps = {
  report: StatsReport;
};

type BarTone = "accent" | "positive" | "negative" | "muted" | "warn";

function percent(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

type Segment = {
  label: string;
  value: number;
  tone: BarTone;
  href?: string;
};

function OutcomeMeter({ title, headline, segments }: { title: string; headline: string; segments: Segment[] }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div className="metric-card">
      <h3 className="metric-card__title">{title}</h3>
      <p className="metric-card__headline">{headline}</p>
      <div
        className="meter"
        role="img"
        aria-label={segments.map((segment) => `${segment.label}: ${segment.value}`).join(". ")}
      >
        {segments.map((segment) =>
          segment.value > 0 ? (
            <span
              key={segment.label}
              className={`meter__seg meter__seg--${segment.tone}`}
              style={{ width: `${percent(segment.value, total)}%` }}
            />
          ) : null,
        )}
      </div>
      <ul className="legend">
        {segments.map((segment) => (
          <li key={segment.label}>
            <span className={`legend__dot legend__dot--${segment.tone}`} />
            <ClipLegendLabel label={segment.label} href={segment.href} />
            {segment.href ? (
              <ClipAnchor href={segment.href} className="legend__clip-stat" ariaLabel={`Open video: ${segment.label}`}>
                {formatCount(segment.value)} · {percent(segment.value, total)}%
              </ClipAnchor>
            ) : (
              <strong>
                {formatCount(segment.value)} · {percent(segment.value, total)}%
              </strong>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeroCard({
  title,
  value,
  caption,
  href,
}: {
  title: string;
  value: number;
  caption: string;
  href?: string;
}) {
  return (
    <div className="metric-card metric-card--hero">
      <ClipMetricTitle label={title} href={href} />
      {href ? (
        <ClipAnchor href={href} className="metric-card__value clip-link--value" ariaLabel={`Open video: ${title}`}>
          {formatCount(value)}
        </ClipAnchor>
      ) : (
        <span className="metric-card__value">{formatCount(value)}</span>
      )}
      <p className="metric-card__caption">{caption}</p>
    </div>
  );
}

function MiniCard({ title, value, note }: { title: string; value: number; note?: string }) {
  return (
    <div className="metric-card metric-card--mini">
      <h3 className="metric-card__title">{title}</h3>
      <span className="metric-card__value">{formatCount(value)}</span>
      {note ? <span className="metric-card__pct">{note}</span> : null}
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

function MatchSwitcher({
  matches,
  activeId,
  onChange,
}: {
  matches: MatchStats[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  const index = matches.findIndex((match) => match.id === activeId);

  return (
    <div className="match-nav">
      <div className="match-nav__session" role="group" aria-label="Matches">
        <button
          type="button"
          className="match-nav__arrow"
          onClick={() => onChange(matches[index - 1].id)}
          disabled={index <= 0}
          aria-label="Previous match"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <div className="match-nav__pills">
          {matches.map((match) => (
            <button
              key={match.id}
              type="button"
              className={`match-nav__pill${match.id === activeId ? " is-active" : ""}`}
              aria-pressed={match.id === activeId}
              onClick={() => onChange(match.id)}
            >
              {match.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={match.logo} alt="" className="club-logo club-logo--pill" />
              ) : null}
              {match.shortLabel}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="match-nav__arrow"
          onClick={() => onChange(matches[index + 1].id)}
          disabled={index < 0 || index === matches.length - 1}
          aria-label="Next match"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  );
}

function linkOf(group: { videoLink?: string } | null | undefined): string | undefined {
  const trimmed = group?.videoLink?.trim() ?? "";
  return trimmed || undefined;
}

function buildTopics(match: MatchStats): Topic[] {
  const { backToGoalDuels, backToGoalPlay, oneVoneFinishing, duels1v1, runsInBehind, passing, finishing } = match;
  const topics: Topic[] = [];

  if (backToGoalDuels) {
    topics.push({
      id: "back-to-goal-duels",
      title: "Back-to-Goal Duels",
      phase: "hold-up-play",
      content: (
        <BigStat
          value={formatCount(backToGoalDuels.heldOff)}
          caption="Successful hold-ups playing with his back to goal — held the ball up and brought teammates into the attack."
          tone="positive"
        />
      ),
    });
  }

  if (backToGoalPlay) {
    const attempts = backToGoalPlay.completed + backToGoalPlay.incomplete;
    topics.push({
      id: "back-to-goal-play",
      title: "Back-to-Goal Play + Key/Vertical Pass",
      phase: "hold-up-play",
      content: (
        <MetricFlow
          items={[
            <HeroCard
              key="vertical"
              title="Vertical passes"
              value={backToGoalPlay.verticalPasses}
              caption="Forward passes that broke a line while playing back to goal"
              href={linkOf(backToGoalPlay)}
            />,
            <MiniCard key="key" title="Key passes" value={backToGoalPlay.keyPasses} note="Set up a clear chance" />,
            <OutcomeMeter
              key="completion"
              title="Pass completion"
              headline={`${formatCount(backToGoalPlay.completed)} of ${formatCount(attempts)} · ${percent(backToGoalPlay.completed, attempts)}%`}
              segments={[
                { label: "Completed", value: backToGoalPlay.completed, tone: "positive" },
                { label: "Incomplete", value: backToGoalPlay.incomplete, tone: "warn" },
              ]}
            />,
          ]}
        />
      ),
    });
  }

  if (duels1v1) {
    const goalNote = duels1v1.goals === 1 ? "1v1 ended in a goal" : "1v1s ended in a goal";
    topics.push({
      id: "duels-1v1",
      title: "1v1 — Offensive Duels",
      phase: "attacking",
      content: (
        <MetricFlow
          items={[
            <HeroCard
              key="duels"
              title="Offensive duels"
              value={duels1v1.total}
              caption="1v1 situations attacking a defender"
              href={linkOf(duels1v1)}
            />,
            <OutcomeMeter
              key="outcome"
              title="Duel outcome"
              headline={`${formatCount(duels1v1.positive)} of ${formatCount(duels1v1.total)} · ${percent(duels1v1.positive, duels1v1.total)}%`}
              segments={[
                { label: "Positive Plays", value: duels1v1.positive, tone: "positive" },
                { label: "Negative Plays", value: duels1v1.negative, tone: "warn" },
              ]}
            />,
            ...(duels1v1.goals > 0
              ? [<BigStat key="goal" value={formatCount(duels1v1.goals)} caption={goalNote} tone="positive" />]
              : []),
          ]}
        />
      ),
    });
  }

  if (runsInBehind) {
    topics.push({
      id: "runs-in-behind",
      title: "Runs in Behind",
      phase: "attacking",
      content: (
        <MetricFlow
          items={[
            <HeroCard
              key="runs"
              title="Runs in behind"
              value={runsInBehind.runs}
              caption="Off-ball runs in behind the defensive line"
              href={linkOf(runsInBehind)}
            />,
            <MiniCard key="received" title="Passes received" value={runsInBehind.received} note="Found by a teammate" />,
            <MiniCard key="shot" title="Shot generated" value={runsInBehind.shots} note="From a run in behind" />,
            ...(runsInBehind.goals > 0
              ? [
                  <BigStat
                    key="goal"
                    value={formatCount(runsInBehind.goals)}
                    caption={runsInBehind.goals === 1 ? "Goal scored" : "Goals scored"}
                    tone="positive"
                  />,
                ]
              : []),
          ]}
        />
      ),
    });
  }

  if (passing) {
    topics.push({
      id: "passing",
      title: "Passing",
      phase: "attacking",
      content: (
        <MetricFlow
          items={[
            <HeroCard
              key="final-third"
              title="Final-third passes"
              value={passing.finalThird}
              caption="Passes played in the attacking third"
              href={linkOf(passing)}
            />,
            <MiniCard
              key="into-box"
              title="Passes into the box"
              value={passing.intoBox}
              note={`${percent(passing.intoBox, passing.finalThird)}% of final-third passes`}
            />,
          ]}
        />
      ),
    });
  }

  if (oneVoneFinishing) {
    topics.push({
      id: "one-v-one-finishing",
      title: "1v1 + Finishing",
      phase: "finishing",
      content: (
        <MetricFlow
          items={[
            <HeroCard
              key="duels-won"
              title="1v1 duels won"
              value={oneVoneFinishing.duelsWon}
              caption="Duels won that created a shooting chance"
              href={linkOf(oneVoneFinishing)}
            />,
            <MiniCard key="shots" title="Shots after a 1v1" value={oneVoneFinishing.shots} />,
            ...(oneVoneFinishing.goals > 0
              ? [
                  <BigStat
                    key="goal"
                    value={formatCount(oneVoneFinishing.goals)}
                    caption={oneVoneFinishing.goals === 1 ? "Goal" : "Goals"}
                    tone="positive"
                  />,
                ]
              : []),
          ]}
        />
      ),
    });
  }

  if (finishing) {
    const segments: Segment[] = [
      { label: "On target", value: finishing.onTarget, tone: "positive" },
      { label: "Off target", value: finishing.offTarget, tone: "warn" },
      { label: "Blocked", value: finishing.blocked, tone: "muted" },
    ];
    if (finishing.woodwork && finishing.woodwork > 0) {
      segments.push({ label: "Woodwork", value: finishing.woodwork, tone: "muted" });
    }
    const goals = finishing.goals ?? 0;

    topics.push({
      id: "finishing",
      title: "Finishing",
      phase: "finishing",
      content: (
        <MetricFlow
          items={[
            <HeroCard
              key="shots"
              title="Total shots"
              value={finishing.shots}
              caption="All finishing attempts in the match"
              href={linkOf(finishing)}
            />,
            <OutcomeMeter
              key="accuracy"
              title="Shot outcome"
              headline={`${formatCount(finishing.onTarget)} of ${formatCount(finishing.shots)} on target · ${percent(finishing.onTarget, finishing.shots)}%`}
              segments={segments}
            />,
            ...(goals > 0
              ? [<BigStat key="goal" value={formatCount(goals)} caption={goals === 1 ? "Goal" : "Goals"} tone="positive" />]
              : []),
          ]}
        />
      ),
    });
  }

  return topics;
}

export function GameStatsReport({ report }: GameStatsReportProps) {
  const { player, meta, matches } = report;
  const [matchId, setMatchId] = useState(matches[matches.length - 1]?.id ?? "");
  const match = matches.find((item) => item.id === matchId) ?? matches[0];
  const exportStats = useMemo(() => toGameStats(report, match), [report, match]);
  const topics = useMemo(() => buildTopics(match), [match]);

  const videoLinks: Record<string, string> = {};
  for (const [key, group] of Object.entries({
    backToGoalPlay: match.backToGoalPlay,
    oneVoneFinishing: match.oneVoneFinishing,
    duels1v1: match.duels1v1,
    runsInBehind: match.runsInBehind,
    passing: match.passing,
    finishing: match.finishing,
  })) {
    if (group?.videoLink) videoLinks[key] = group.videoLink;
  }

  return (
    <VideoLinksProvider key={match.id} initialVideoLinks={videoLinks}>
      <SgaCornerBrand />

      <div className="shell">
        <header className="report-header">
          <SgaBrand />
          <div className="report-header__intro">
            <p className="report-header__eyebrow">{BRAND.legal}</p>
            <h1 className="report-header__title">{meta.title}</h1>
            <p className="report-header__meta">
              {match.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={match.logo} alt="" className="club-logo club-logo--meta" />
              ) : null}
              {match.label}
            </p>
          </div>
        </header>

        <div className="report-grid">
          <AthleteProfileCard
            name={player.name}
            club={player.club}
            clubLogo={player.clubLogo}
            photoSrc={player.photo}
          >
            <ExportPdfButton stats={exportStats} />
          </AthleteProfileCard>

          <main className="report-main">
            <div className="view-panel">
              <MatchSwitcher matches={matches} activeId={match.id} onChange={setMatchId} />
              <TopicsBoard topics={topics} />
            </div>
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
