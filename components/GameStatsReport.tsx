"use client";

import React, { useMemo, useState } from "react";
import { AthleteProfileCard } from "@/components/AthleteProfileCard";
import { ExportPdfButton } from "@/components/ExportPdfButton";
import { ClipAnchor, ClipLegendLabel, ClipMetricTitle } from "@/components/ClipUi";
import { VideoLinksProvider } from "@/components/VideoLinksContext";
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

function OutcomeMeter({
  title,
  headline,
  segments,
  inlineLegend,
}: {
  title: string;
  headline: string;
  segments: Segment[];
  inlineLegend?: boolean;
}) {
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
      <ul className={`legend${inlineLegend ? " legend--inline" : ""}`}>
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

function MiniCard({
  title,
  value,
  note,
  compact,
}: {
  title: string;
  value: number | string;
  note?: string;
  compact?: boolean;
}) {
  return (
    <div className={`metric-card${compact ? " metric-card--mini" : ""}`}>
      <h3 className="metric-card__title">{title}</h3>
      <span className="metric-card__value">{typeof value === "number" ? formatCount(value) : value}</span>
      {note ? <span className="metric-card__pct">{note}</span> : null}
    </div>
  );
}

function BigStat({
  value,
  caption,
  tone,
  tag,
}: {
  value: string;
  caption: string;
  tone: "positive" | "warn" | "accent";
  tag?: string;
}) {
  return (
    <div className={`big-stat big-stat--${tone}`}>
      {tag ? <span className="big-stat__tag">{tag}</span> : null}
      <span className="big-stat__value">{value}</span>
      <p className="big-stat__caption">{caption}</p>
    </div>
  );
}

function StatGrid({ children }: { children: React.ReactNode }) {
  const count = Math.min(3, Math.max(1, React.Children.toArray(children).length));
  return <div className={`stat-grid stat-grid--${count}`}>{children}</div>;
}

function StatRow({ hero, cards }: { hero: React.ReactNode; cards: React.ReactNode[] }) {
  return (
    <StatGrid>
      {hero}
      {cards}
    </StatGrid>
  );
}

function StatCol({ children }: { children: React.ReactNode }) {
  return <div className="stat-col">{children}</div>;
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
        <StatRow
          hero={
            <HeroCard
              title="Vertical passes"
              value={backToGoalPlay.verticalPasses}
              caption="Forward passes that broke a line while playing back to goal"
              href={linkOf(backToGoalPlay)}
            />
          }
          cards={[
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
    const progressed = duels1v1.progressedToGoal ?? 0;
    const wonNoProgression = duels1v1.wonNoProgression ?? 0;
    const positiveBreakdown: React.ReactNode[] = [
      wonNoProgression > 0 ? (
        <BigStat
          key="won-no-prog"
          tag="Positive Play"
          value={formatCount(wonNoProgression)}
          caption="Won the duel, but the play didn't progress"
          tone="accent"
        />
      ) : null,
      progressed > 0 ? (
        <BigStat
          key="progressed"
          tag="Goal"
          value={formatCount(progressed)}
          caption={progressed === 1 ? "Progressed → ended in a goal" : "Progressed → ended in goals"}
          tone="positive"
        />
      ) : null,
      progressed === 0 && duels1v1.goals > 0 ? (
        <BigStat key="goal" tag="Goal" value={formatCount(duels1v1.goals)} caption={goalNote} tone="positive" />
      ) : null,
    ].filter(Boolean);

    topics.push({
      id: "duels-1v1",
      title: "1v1 — Offensive Duels",
      phase: "attacking",
      content: (
        <StatGrid>
          <StatCol>
            <HeroCard
              title="Offensive duels"
              value={duels1v1.total}
              caption="1v1 situations attacking a defender"
              href={linkOf(duels1v1)}
            />
            <OutcomeMeter
              title="Duel outcome"
              headline={`${formatCount(duels1v1.positive)} of ${formatCount(duels1v1.total)} · ${percent(duels1v1.positive, duels1v1.total)}%`}
              segments={[
                { label: "Positive Plays", value: duels1v1.positive, tone: "positive" },
                { label: "Negative Plays", value: duels1v1.negative, tone: "warn" },
              ]}
            />
          </StatCol>
          {positiveBreakdown.length > 0 ? <StatCol>{positiveBreakdown}</StatCol> : null}
        </StatGrid>
      ),
    });
  }

  if (runsInBehind) {
    topics.push({
      id: "runs-in-behind",
      title: "Runs in Behind",
      phase: "attacking",
      content: (
        <StatGrid>
          <HeroCard
            title="Runs in behind"
            value={runsInBehind.runs}
            caption="Off-ball runs in behind the defensive line"
            href={linkOf(runsInBehind)}
          />
          <MiniCard title="Passes received" value={runsInBehind.received} note="Found by a teammate" />
          {runsInBehind.goals > 0 ? (
            <BigStat
              tag="Goal"
              value={formatCount(runsInBehind.goals)}
              caption="Run generated a shot — scored"
              tone="positive"
            />
          ) : (
            <MiniCard title="Shot generated" value={runsInBehind.shots} note="From a run in behind" />
          )}
        </StatGrid>
      ),
    });
  }

  if (passing) {
    topics.push({
      id: "passing",
      title: "Passing",
      phase: "attacking",
      content: (
        <StatGrid>
          <HeroCard
            title="Final-third passes"
            value={passing.finalThird}
            caption="Passes played in the attacking third"
            href={linkOf(passing)}
          />
          <MiniCard title="Passes into the box" value={passing.intoBox} note="Delivered into the penalty area" />
          <MiniCard
            title="Into the box share"
            value={`${percent(passing.intoBox, passing.finalThird)}%`}
            note="of final-third passes into the box"
          />
        </StatGrid>
      ),
    });
  }

  if (oneVoneFinishing) {
    topics.push({
      id: "one-v-one-finishing",
      title: "1v1 + Finishing",
      phase: "finishing",
      content: (
        <StatRow
          hero={
            <HeroCard
              title="1v1 duels won"
              value={oneVoneFinishing.duelsWon}
              caption="Duels won that created a shooting chance"
              href={linkOf(oneVoneFinishing)}
            />
          }
          cards={[
            <MiniCard key="shots" title="Shots after a 1v1" value={oneVoneFinishing.shots} />,
            ...(oneVoneFinishing.goals > 0
              ? [
                  <BigStat
                    key="goal"
                    tag="Goal"
                    value={formatCount(oneVoneFinishing.goals)}
                    caption={oneVoneFinishing.goals === 1 ? "Scored from a 1v1" : "Scored from 1v1s"}
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
      segments.push({ label: "Woodwork", value: finishing.woodwork, tone: "accent" });
    }
    const goals = finishing.goals ?? 0;

    topics.push({
      id: "finishing",
      title: "Finishing",
      phase: "finishing",
      content: (
        <div className="stat-stack">
          <StatGrid>
            <HeroCard
              title="Total shots"
              value={finishing.shots}
              caption="All finishing attempts in the match"
              href={linkOf(finishing)}
            />
            {goals > 0 ? (
              <BigStat
                tag="Goal"
                value={formatCount(goals)}
                caption={`${formatCount(goals)} of ${formatCount(finishing.onTarget)} shots on target scored`}
                tone="positive"
              />
            ) : (
              <MiniCard title="Goals" value={0} note="No goals in this match" />
            )}
          </StatGrid>
          <OutcomeMeter
            title="Shot outcome"
            headline={`${percent(finishing.onTarget, finishing.shots)}% on target`}
            segments={segments}
            inlineLegend
          />
        </div>
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
              <TopicsBoard key={match.id} topics={topics} />
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
