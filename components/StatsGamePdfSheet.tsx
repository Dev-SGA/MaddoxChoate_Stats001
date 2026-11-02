import { BRAND } from "@/lib/brand";
import { formatCount, type GameStats } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
  playIconUrl: string;
  clubLogoUrl?: string;
  opponentLogoUrl?: string;
};

type Phase = "hold-up-play" | "attacking" | "finishing";

type Tone = "blue" | "green" | "amber" | "grey";

const PHASE_LABEL: Record<Phase, string> = {
  "hold-up-play": "Hold-Up Play",
  attacking: "Attacking Phase",
  finishing: "Finishing",
};

function pct(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function PdfPlay({ href, playIconUrl }: { href?: string; playIconUrl: string }) {
  if (!href) return null;
  return (
    <a className="spdf-play" href={href} data-pdf-link={href} target="_blank" rel="noreferrer" aria-label="Open video">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={playIconUrl} alt="" className="spdf-play__icon" width={13} height={13} />
    </a>
  );
}

function PdfPlayTarget({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <a className="spdf-play-target" href={href} data-pdf-link={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

function linkOf(group: { videoLink?: string } | null | undefined): string | undefined {
  const trimmed = group?.videoLink?.trim() ?? "";
  return trimmed || undefined;
}

function Topic({
  phase,
  title,
  cols,
  playHref,
  playIconUrl,
  children,
  footer,
}: {
  phase: Phase;
  title: string;
  cols: number;
  playHref?: string;
  playIconUrl: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className={`spdf-topic spdf-topic--${phase}`}>
      <div className="spdf-topic__head">
        <h3 className="spdf-topic__title">
          {title}
          <PdfPlay href={playHref} playIconUrl={playIconUrl} />
        </h3>
        <p className="spdf-topic__phase">{PHASE_LABEL[phase]}</p>
      </div>
      <div className={`spdf-cards spdf-cards--${cols}`}>{children}</div>
      {footer}
    </section>
  );
}

function HeroCard({
  title,
  value,
  caption,
  href,
  playIconUrl,
}: {
  title: string;
  value: number;
  caption: string;
  href?: string;
  playIconUrl: string;
}) {
  return (
    <div className="spdf-card spdf-card--hero">
      <h4 className="spdf-card__title">
        {title}
        <PdfPlay href={href} playIconUrl={playIconUrl} />
      </h4>
      <span className="spdf-card__value">
        <PdfPlayTarget href={href}>{formatCount(value)}</PdfPlayTarget>
      </span>
      <span className="spdf-card__caption">{caption}</span>
    </div>
  );
}

function StatCard({
  title,
  value,
  note,
  tone,
  span,
}: {
  title: string;
  value: number | string;
  note?: string;
  tone?: Tone;
  span?: number;
}) {
  return (
    <div className={`spdf-card${tone ? ` spdf-card--${tone}` : ""}${span ? ` spdf-card--span${span}` : ""}`}>
      <h4 className="spdf-card__title">{title}</h4>
      <span className={`spdf-card__value${tone ? ` spdf-card__value--${tone}` : ""}`}>
        {typeof value === "number" ? formatCount(value) : value}
      </span>
      {note ? <span className="spdf-card__caption">{note}</span> : null}
    </div>
  );
}

function BadgeCard({
  tag,
  value,
  caption,
  tone,
}: {
  tag: string;
  value: number;
  caption: string;
  tone: "green" | "blue";
}) {
  return (
    <div className={`spdf-card spdf-card--badge spdf-card--${tone}`}>
      <span className="spdf-card__tag">{tag}</span>
      <span className="spdf-card__value">{formatCount(value)}</span>
      <span className="spdf-card__caption">{caption}</span>
    </div>
  );
}

function TextCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="spdf-card">
      <h4 className="spdf-card__title">{title}</h4>
      <p className="spdf-card__text">{text}</p>
    </div>
  );
}

function MeterCard({
  title,
  headline,
  segments,
  span,
}: {
  title: string;
  headline: string;
  segments: { label: string; value: number; tone: Tone }[];
  span?: number;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div className={`spdf-card spdf-card--meter${span ? ` spdf-card--span${span}` : ""}`}>
      <div className="spdf-meter__head">
        <h4 className="spdf-card__title">{title}</h4>
        <strong className="spdf-meter__headline">{headline}</strong>
      </div>
      <div className="spdf-meter__track">
        {segments.map((segment) =>
          segment.value > 0 ? (
            <span
              key={segment.label}
              className={`spdf-meter__seg spdf-meter__seg--${segment.tone}`}
              style={{ width: `${pct(segment.value, total)}%` }}
            />
          ) : null,
        )}
      </div>
      <ul className="spdf-meter__legend">
        {segments.map((segment) => (
          <li key={segment.label}>
            <span className={`spdf-meter__dot spdf-meter__dot--${segment.tone}`} />
            {segment.label}
            <strong>
              {formatCount(segment.value)} · {pct(segment.value, total)}%
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StatsGamePdfSheet({
  stats,
  photoUrl,
  logoUrl,
  playIconUrl,
  clubLogoUrl,
  opponentLogoUrl,
}: StatsGamePdfSheetProps) {
  const { player, meta, backToGoalDuels, backToGoalPlay, oneVoneFinishing, duels1v1, runsInBehind, passing, finishing } =
    stats;

  const topics: React.ReactNode[] = [];

  if (backToGoalDuels) {
    topics.push(
      <Topic key="back-to-goal-duels" phase="hold-up-play" title="Back-to-Goal Duels" cols={2} playIconUrl={playIconUrl}>
        <HeroCard
          title="Successful hold-ups"
          value={backToGoalDuels.heldOff}
          caption="Back to goal"
          playIconUrl={playIconUrl}
        />
        <TextCard
          title="Impact"
          text="Successful playing with his back to goal — held the ball up and brought teammates into the attack."
        />
      </Topic>,
    );
  }

  if (backToGoalPlay) {
    const attempts = backToGoalPlay.completed + backToGoalPlay.incomplete;
    topics.push(
      <Topic
        key="back-to-goal-play"
        phase="hold-up-play"
        title="Back-to-Goal Play + Key/Vertical Pass"
        cols={3}
        playHref={linkOf(backToGoalPlay)}
        playIconUrl={playIconUrl}
      >
        <HeroCard
          title="Vertical passes"
          value={backToGoalPlay.verticalPasses}
          caption="Broke a line"
          href={linkOf(backToGoalPlay)}
          playIconUrl={playIconUrl}
        />
        <StatCard title="Key passes" value={backToGoalPlay.keyPasses} note="Set up a clear chance" tone="blue" />
        <MeterCard
          title="Pass completion"
          headline={`${pct(backToGoalPlay.completed, attempts)}%`}
          segments={[
            { label: "Completed", value: backToGoalPlay.completed, tone: "green" },
            { label: "Incomplete", value: backToGoalPlay.incomplete, tone: "amber" },
          ]}
        />
      </Topic>,
    );
  }

  if (duels1v1) {
    const progressed = duels1v1.progressedToGoal ?? 0;
    const wonNoProgression = duels1v1.wonNoProgression ?? 0;
    const cards: React.ReactNode[] = [
      <HeroCard
        key="duels"
        title="Offensive duels"
        value={duels1v1.total}
        caption="1v1 attacking a defender"
        href={linkOf(duels1v1)}
        playIconUrl={playIconUrl}
      />,
      <MeterCard
        key="outcome"
        title="Duel outcome"
        headline={`${duels1v1.positive} of ${duels1v1.total} · ${pct(duels1v1.positive, duels1v1.total)}%`}
        segments={[
          { label: "Positive", value: duels1v1.positive, tone: "green" },
          { label: "Negative", value: duels1v1.negative, tone: "amber" },
        ]}
      />,
    ];
    if (wonNoProgression > 0) {
      cards.push(
        <BadgeCard
          key="won-no-prog"
          tag="Positive Play"
          value={wonNoProgression}
          caption="Won, no progression"
          tone="blue"
        />,
      );
    }
    if (progressed > 0) {
      cards.push(
        <BadgeCard
          key="progressed"
          tag="Goal"
          value={progressed}
          caption="Progressed → ended in a goal"
          tone="green"
        />,
      );
    } else if (duels1v1.goals > 0) {
      cards.push(
        <BadgeCard
          key="goal"
          tag="Goal"
          value={duels1v1.goals}
          caption={duels1v1.goals === 1 ? "1v1 ended in a goal" : "1v1s ended in a goal"}
          tone="green"
        />,
      );
    }
    topics.push(
      <Topic
        key="duels-1v1"
        phase="attacking"
        title="1v1 — Offensive Duels"
        cols={Math.min(4, cards.length)}
        playIconUrl={playIconUrl}
      >
        {cards}
      </Topic>,
    );
  }

  if (runsInBehind) {
    topics.push(
      <Topic key="runs-in-behind" phase="attacking" title="Runs in Behind" cols={3} playIconUrl={playIconUrl}>
        <HeroCard
          title="Runs in behind"
          value={runsInBehind.runs}
          caption="Off-ball runs"
          href={linkOf(runsInBehind)}
          playIconUrl={playIconUrl}
        />
        <StatCard title="Passes received" value={runsInBehind.received} note="Found by a teammate" tone="blue" />
        {runsInBehind.goals > 0 ? (
          <BadgeCard tag="Goal" value={runsInBehind.goals} caption="Run generated a shot — scored" tone="green" />
        ) : (
          <StatCard title="Shot generated" value={runsInBehind.shots} note="From a run in behind" tone="grey" />
        )}
      </Topic>,
    );
  }

  if (passing) {
    topics.push(
      <Topic key="passing" phase="attacking" title="Passing" cols={3} playIconUrl={playIconUrl}>
        <HeroCard
          title="Final-third passes"
          value={passing.finalThird}
          caption="Attacking third"
          href={linkOf(passing)}
          playIconUrl={playIconUrl}
        />
        <StatCard title="Passes into the box" value={passing.intoBox} note="Into the penalty area" tone="blue" />
        <StatCard
          title="Into the box share"
          value={`${pct(passing.intoBox, passing.finalThird)}%`}
          note="of final-third passes"
          tone="grey"
        />
      </Topic>,
    );
  }

  if (oneVoneFinishing) {
    topics.push(
      <Topic key="one-v-one" phase="finishing" title="1v1 + Finishing" cols={3} playIconUrl={playIconUrl}>
        <HeroCard
          title="1v1 duels won"
          value={oneVoneFinishing.duelsWon}
          caption="Created a chance"
          href={linkOf(oneVoneFinishing)}
          playIconUrl={playIconUrl}
        />
        <StatCard title="Shots after a 1v1" value={oneVoneFinishing.shots} tone="grey" />
        {oneVoneFinishing.goals > 0 ? (
          <BadgeCard
            tag="Goal"
            value={oneVoneFinishing.goals}
            caption={oneVoneFinishing.goals === 1 ? "Scored from a 1v1" : "Scored from 1v1s"}
            tone="green"
          />
        ) : (
          <StatCard title="Goals" value={0} note="No goals from 1v1s" tone="grey" />
        )}
      </Topic>,
    );
  }

  if (finishing) {
    const segments = [
      { label: "On target", value: finishing.onTarget, tone: "green" as Tone },
      { label: "Off target", value: finishing.offTarget, tone: "amber" as Tone },
      { label: "Blocked", value: finishing.blocked, tone: "grey" as Tone },
    ];
    if (finishing.woodwork && finishing.woodwork > 0) {
      segments.push({ label: "Woodwork", value: finishing.woodwork, tone: "blue" });
    }
    const goals = finishing.goals ?? 0;
    topics.push(
      <Topic key="finishing" phase="finishing" title="Finishing" cols={4} playIconUrl={playIconUrl}>
        <HeroCard
          title="Total shots"
          value={finishing.shots}
          caption="Finishing attempts"
          href={linkOf(finishing)}
          playIconUrl={playIconUrl}
        />
        {goals > 0 ? (
          <BadgeCard
            tag="Goal"
            value={goals}
            caption={`${formatCount(goals)} of ${formatCount(finishing.onTarget)} on target scored`}
            tone="green"
          />
        ) : (
          <StatCard title="Goals" value={0} note="No goals in this match" tone="grey" />
        )}
        <MeterCard
          title="Shot outcome"
          headline={`${pct(finishing.onTarget, finishing.shots)}% on target`}
          segments={segments}
          span={2}
        />
      </Topic>,
    );
  }

  return (
    <article className="stats-pdf" aria-hidden="true">
      <aside className="spdf-side">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="spdf-side__logo" />
        <div className="spdf-side__photo" data-pdf-bg={photoUrl} style={{ backgroundImage: `url(${photoUrl})` }} />
        <div className="spdf-side__identity">
          <p className="spdf-side__label">Athlete</p>
          <h2 className="spdf-side__name">{player.name}</h2>
          <p className="spdf-side__club">
            {clubLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={clubLogoUrl} alt="" className="spdf-side__club-logo" />
            ) : null}
            {player.club}
          </p>
        </div>
        <p className="spdf-side__slogan">{BRAND.slogan}</p>
      </aside>

      <div className="spdf-main">
        <header className="spdf-head">
          <div>
            <p className="spdf-head__eyebrow">
              <span className="spdf-head__mark" />
              {BRAND.legal}
            </p>
            <h1 className="spdf-head__title">{meta.title}</h1>
          </div>
          <div className="spdf-head__meta">
            <span className="spdf-head__match">
              {opponentLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={opponentLogoUrl} alt="" className="spdf-head__logo" />
              ) : null}
              {meta.subtitle}
            </span>
          </div>
        </header>

        <div className="spdf-topics">{topics}</div>

        <footer className="spdf-foot">
          <span>{BRAND.name}</span>
          <span>
            {player.name} · {meta.title}
          </span>
        </footer>
      </div>
    </article>
  );
}
