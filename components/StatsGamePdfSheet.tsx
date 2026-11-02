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
      <img src={playIconUrl} alt="" className="spdf-play__icon" width={14} height={14} />
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

function StatTiles({
  items,
  tier,
  playIconUrl,
}: {
  items: { label: string; value: number | string; tone?: Tone; href?: string }[];
  tier?: "top" | "rest";
  playIconUrl: string;
}) {
  return (
    <ul
      className={`spdf-stats${tier ? ` spdf-stats--${tier}` : ""}`}
      style={tier === "rest" ? { gridTemplateColumns: `repeat(${Math.min(Math.max(items.length, 1), 3)}, minmax(0, 1fr))` } : undefined}
    >
      {items.map((item) => (
        <li key={item.label} className={`spdf-stat${item.tone ? ` spdf-stat--${item.tone}` : ""}`}>
          {item.href ? (
            <a
              className="spdf-stat__hit"
              href={item.href}
              data-pdf-link={item.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open video: ${item.label}`}
            />
          ) : null}
          <span className={`spdf-stat__value${item.tone ? ` spdf-stat__value--${item.tone}` : ""}`}>
            {typeof item.value === "number" ? formatCount(item.value) : item.value}
          </span>
          <span className="spdf-stat__label">
            {item.label}
            {item.href ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={playIconUrl} alt="" className="spdf-stat__play" width={9} height={9} />
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}

function RateBar({
  label,
  value,
  note,
  segments,
}: {
  label: string;
  value: number;
  note: string;
  segments: { value: number; tone: Tone }[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div className="spdf-rate">
      <div className="spdf-rate__head">
        <span className="spdf-rate__label">{label}</span>
        <span className="spdf-rate__value">{value}%</span>
      </div>
      <div className="spdf-rate__track">
        {segments.map((segment, index) =>
          segment.value > 0 ? (
            <span
              key={index}
              className={`spdf-rate__seg spdf-rate__seg--${segment.tone}`}
              style={{ width: `${pct(segment.value, total)}%` }}
            />
          ) : null,
        )}
      </div>
      <p className="spdf-rate__note">{note}</p>
    </div>
  );
}

type SectionLayout = "featured" | "strip";

function Section({
  phase,
  title,
  value,
  unit,
  aside,
  footer,
  playHref,
  playIconUrl,
  layout,
}: {
  phase: Phase;
  title: string;
  value: number;
  unit: string;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  playHref?: string;
  playIconUrl: string;
  layout?: SectionLayout;
}) {
  return (
    <section className={`spdf-section spdf-section--${phase}${layout ? ` spdf-section--${layout}` : ""}`}>
      <div className="spdf-section__head">
        <h3 className="spdf-section__title">
          {title}
          <PdfPlay href={playHref} playIconUrl={playIconUrl} />
        </h3>
        <p className="spdf-section__phase">{PHASE_LABEL[phase]}</p>
      </div>
      <div className="spdf-section__body">
        <div className="spdf-section__kpi">
          <span className="spdf-section__value">
            <PdfPlayTarget href={playHref}>{formatCount(value)}</PdfPlayTarget>
            <PdfPlay href={playHref} playIconUrl={playIconUrl} />
          </span>
          <span className="spdf-section__unit">{unit}</span>
        </div>
        {aside ? <div className="spdf-section__aside">{aside}</div> : null}
      </div>
      {footer ? <div className="spdf-section__footer">{footer}</div> : null}
    </section>
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

  const sections: React.ReactNode[] = [];

  /* Slot 1 — top-left standard section. */

  if (duels1v1) {
    const progressed = duels1v1.progressedToGoal ?? 0;
    const wonNoProgression = duels1v1.wonNoProgression ?? 0;
    const tiles =
      progressed > 0 || wonNoProgression > 0
        ? [
            { label: "Progressed → Goal", value: progressed, tone: "green" as Tone },
            { label: "Won · No Progression", value: wonNoProgression, tone: "blue" as Tone },
          ]
        : [
            { label: "Positive", value: duels1v1.positive, tone: "green" as Tone },
            { label: "Negative", value: duels1v1.negative, tone: "amber" as Tone },
          ];
    sections.push(
      <Section
        key="duels-1v1"
        phase="attacking"
        title="1v1 — Offensive Duels"
        value={duels1v1.total}
        unit="Offensive duels"
        playHref={linkOf(duels1v1)}
        playIconUrl={playIconUrl}
        aside={<StatTiles items={tiles} playIconUrl={playIconUrl} />}
        footer={
          <RateBar
            label="Positive plays"
            value={pct(duels1v1.positive, duels1v1.total)}
            note={`${formatCount(duels1v1.positive)} of ${formatCount(duels1v1.total)} duels were positive plays`}
            segments={[
              { value: duels1v1.positive, tone: "green" },
              { value: duels1v1.negative, tone: "amber" },
            ]}
          />
        }
      />,
    );
  } else if (backToGoalDuels) {
    sections.push(
      <Section
        key="back-to-goal-duels"
        phase="hold-up-play"
        title="Back-to-Goal Duels"
        value={backToGoalDuels.heldOff}
        unit="Successful hold-ups"
        playIconUrl={playIconUrl}
        aside={
          <p className="spdf-note">
            Successful playing with his back to goal — held the ball up and brought teammates into the attack.
          </p>
        }
      />,
    );
  }

  /* Slot 2 — featured tall section: Finishing. */

  if (finishing) {
    const goals = finishing.goals ?? 0;
    const woodwork = finishing.woodwork ?? 0;
    const restTiles = [
      { label: "Blocked", value: finishing.blocked, tone: "grey" as Tone },
      ...(woodwork > 0 ? [{ label: "Woodwork", value: woodwork, tone: "blue" as Tone }] : []),
      { label: "Goal", value: goals, tone: goals > 0 ? ("green" as Tone) : ("grey" as Tone) },
    ];
    sections.push(
      <Section
        key="finishing"
        phase="finishing"
        title="Finishing"
        value={finishing.shots}
        unit="Total shots"
        playHref={linkOf(finishing)}
        playIconUrl={playIconUrl}
        layout="featured"
        aside={
          <div className="spdf-tiers">
            <StatTiles
              tier="top"
              playIconUrl={playIconUrl}
              items={[
                { label: "On Target", value: finishing.onTarget, tone: "green" },
                { label: "Off Target", value: finishing.offTarget, tone: "amber" },
              ]}
            />
            <StatTiles tier="rest" items={restTiles} playIconUrl={playIconUrl} />
          </div>
        }
        footer={
          <RateBar
            label="Shot accuracy"
            value={pct(finishing.onTarget, finishing.shots)}
            note={`${formatCount(finishing.onTarget)} of ${formatCount(finishing.shots)} shots on target`}
            segments={[
              { value: finishing.onTarget, tone: "green" },
              { value: Math.max(finishing.shots - finishing.onTarget, 0), tone: "grey" },
            ]}
          />
        }
      />,
    );
  }

  /* Slot 3 — bottom-left standard section. */

  if (runsInBehind) {
    sections.push(
      <Section
        key="runs-in-behind"
        phase="attacking"
        title="Runs in Behind"
        value={runsInBehind.runs}
        unit="Runs in behind"
        playHref={linkOf(runsInBehind)}
        playIconUrl={playIconUrl}
        aside={
          <StatTiles
            playIconUrl={playIconUrl}
            items={[
              { label: "Passes Received", value: runsInBehind.received, tone: "blue" },
              { label: "Shot Generated", value: runsInBehind.shots, tone: "grey" },
              { label: "Goal", value: runsInBehind.goals, tone: runsInBehind.goals > 0 ? "green" : "grey" },
            ]}
          />
        }
        footer={
          <RateBar
            label="Found by a teammate"
            value={pct(runsInBehind.received, runsInBehind.runs)}
            note={`${formatCount(runsInBehind.received)} of ${formatCount(runsInBehind.runs)} runs were found`}
            segments={[
              { value: runsInBehind.received, tone: "blue" },
              { value: runsInBehind.runs - runsInBehind.received, tone: "grey" },
            ]}
          />
        }
      />,
    );
  } else if (backToGoalPlay) {
    const attempts = backToGoalPlay.completed + backToGoalPlay.incomplete;
    sections.push(
      <Section
        key="back-to-goal-play"
        phase="hold-up-play"
        title="Back-to-Goal Play + Key/Vertical Pass"
        value={backToGoalPlay.verticalPasses}
        unit="Vertical passes"
        playHref={linkOf(backToGoalPlay)}
        playIconUrl={playIconUrl}
        aside={
          <StatTiles
            playIconUrl={playIconUrl}
            items={[
              { label: "Key Passes", value: backToGoalPlay.keyPasses, tone: "blue" },
              { label: "Completed", value: backToGoalPlay.completed, tone: "green" },
              { label: "Incomplete", value: backToGoalPlay.incomplete, tone: "amber" },
            ]}
          />
        }
        footer={
          <RateBar
            label="Pass completion"
            value={pct(backToGoalPlay.completed, attempts)}
            note={`${formatCount(backToGoalPlay.completed)} of ${formatCount(attempts)} passes completed`}
            segments={[
              { value: backToGoalPlay.completed, tone: "green" },
              { value: backToGoalPlay.incomplete, tone: "amber" },
            ]}
          />
        }
      />,
    );
  }

  /* Slot 4 — full-width strip at the bottom. */

  if (passing) {
    const share = pct(passing.intoBox, passing.finalThird);
    sections.push(
      <Section
        key="passing"
        phase="attacking"
        title="Passing"
        value={passing.finalThird}
        unit="Final-third passes"
        playHref={linkOf(passing)}
        playIconUrl={playIconUrl}
        layout="strip"
        aside={
          <StatTiles
            playIconUrl={playIconUrl}
            items={[
              { label: "Into the Box", value: passing.intoBox, tone: "blue" },
              { label: "Into-Box Share", value: `${share}%`, tone: "grey" },
            ]}
          />
        }
        footer={
          <RateBar
            label="Into the box"
            value={share}
            note={`${formatCount(passing.intoBox)} of ${formatCount(passing.finalThird)} final-third passes`}
            segments={[
              { value: passing.intoBox, tone: "blue" },
              { value: passing.finalThird - passing.intoBox, tone: "grey" },
            ]}
          />
        }
      />,
    );
  } else if (oneVoneFinishing) {
    sections.push(
      <Section
        key="one-v-one"
        phase="finishing"
        title="1v1 + Finishing"
        value={oneVoneFinishing.duelsWon}
        unit="1v1 duels won"
        playHref={linkOf(oneVoneFinishing)}
        playIconUrl={playIconUrl}
        layout="strip"
        aside={
          <StatTiles
            playIconUrl={playIconUrl}
            items={[
              { label: "Shots after a 1v1", value: oneVoneFinishing.shots, tone: "grey" },
              { label: "Goal", value: oneVoneFinishing.goals, tone: oneVoneFinishing.goals > 0 ? "green" : "grey" },
            ]}
          />
        }
        footer={
          <RateBar
            label="Conversion"
            value={pct(oneVoneFinishing.goals, oneVoneFinishing.shots)}
            note={`${formatCount(oneVoneFinishing.goals)} of ${formatCount(oneVoneFinishing.shots)} shots scored`}
            segments={[
              { value: oneVoneFinishing.goals, tone: "green" },
              { value: Math.max(oneVoneFinishing.shots - oneVoneFinishing.goals, 0), tone: "grey" },
            ]}
          />
        }
      />,
    );
  }

  const gridClass = sections.length === 3 ? " spdf-grid--three" : sections.length === 4 ? " spdf-grid--four" : "";

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

        <div className={`spdf-grid${gridClass}`}>{sections}</div>

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
