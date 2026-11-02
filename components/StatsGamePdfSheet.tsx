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

type Tone = "blue" | "green" | "red" | "grey" | "amber";

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
  playIconUrl,
}: {
  items: { label: string; value: number; tone?: Tone; href?: string }[];
  playIconUrl: string;
}) {
  return (
    <ul className="spdf-stats">
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
            {formatCount(item.value)}
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

type SectionLayout = "featured" | "strip" | "mini";

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

  if (backToGoalDuels) {
    sections.push(
      <Section
        key="back-to-goal-duels"
        phase="hold-up-play"
        title="Back-to-Goal Duels"
        value={backToGoalDuels.heldOff}
        unit="Successful hold-ups"
        playIconUrl={playIconUrl}
      />,
    );
  }

  if (backToGoalPlay) {
    const attempts = backToGoalPlay.completed + backToGoalPlay.incomplete;
    sections.push(
      <Section
        key="back-to-goal-play"
        phase="hold-up-play"
        title="Back-to-Goal Play"
        value={backToGoalPlay.verticalPasses}
        unit="Vertical passes"
        playHref={linkOf(backToGoalPlay)}
        playIconUrl={playIconUrl}
        aside={
          <StatTiles
            playIconUrl={playIconUrl}
            items={[
              { label: "Key passes", value: backToGoalPlay.keyPasses, tone: "blue" },
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

  if (duels1v1) {
    const duelTiles = [
      { label: "Positive Plays", value: duels1v1.positive, tone: "green" as Tone },
      { label: "Negative Plays", value: duels1v1.negative, tone: "amber" as Tone },
    ];
    if (duels1v1.progressedToGoal && duels1v1.progressedToGoal > 0) {
      duelTiles.push({ label: "Progressed → goal", value: duels1v1.progressedToGoal, tone: "blue" });
    }
    if (duels1v1.wonNoProgression && duels1v1.wonNoProgression > 0) {
      duelTiles.push({ label: "Won · no progression", value: duels1v1.wonNoProgression, tone: "grey" });
    }
    if (duels1v1.goals > 0 && !(duels1v1.progressedToGoal && duels1v1.progressedToGoal > 0)) {
      duelTiles.push({ label: "Ended in a goal", value: duels1v1.goals, tone: "blue" });
    }
    sections.push(
      <Section
        key="duels-1v1"
        phase="attacking"
        title="1v1 — Offensive Duels"
        value={duels1v1.total}
        unit="Offensive duels"
        playHref={linkOf(duels1v1)}
        playIconUrl={playIconUrl}
        aside={<StatTiles playIconUrl={playIconUrl} items={duelTiles} />}
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
  }

  if (runsInBehind) {
    const runTiles = [
      { label: "Passes received", value: runsInBehind.received, tone: "blue" as Tone },
      { label: "Shot generated", value: runsInBehind.shots, tone: "grey" as Tone },
    ];
    if (runsInBehind.goals > 0) runTiles.push({ label: "Goal", value: runsInBehind.goals, tone: "green" });
    sections.push(
      <Section
        key="runs-in-behind"
        phase="attacking"
        title="Runs in Behind"
        value={runsInBehind.runs}
        unit="Runs in behind"
        playHref={linkOf(runsInBehind)}
        playIconUrl={playIconUrl}
        aside={<StatTiles playIconUrl={playIconUrl} items={runTiles} />}
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
  }

  if (passing) {
    sections.push(
      <Section
        key="passing"
        phase="attacking"
        title="Passing"
        value={passing.finalThird}
        unit="Final-third passes"
        playHref={linkOf(passing)}
        playIconUrl={playIconUrl}
        aside={
          <StatTiles
            playIconUrl={playIconUrl}
            items={[{ label: `Into the box · ${pct(passing.intoBox, passing.finalThird)}%`, value: passing.intoBox, tone: "blue" }]}
          />
        }
        footer={
          <RateBar
            label="Into the box"
            value={pct(passing.intoBox, passing.finalThird)}
            note={`${formatCount(passing.intoBox)} of ${formatCount(passing.finalThird)} final-third passes went into the box`}
            segments={[
              { value: passing.intoBox, tone: "blue" },
              { value: passing.finalThird - passing.intoBox, tone: "grey" },
            ]}
          />
        }
      />,
    );
  }

  if (oneVoneFinishing) {
    const duelTiles = [{ label: "Shots after a 1v1", value: oneVoneFinishing.shots, tone: "grey" as Tone }];
    if (oneVoneFinishing.goals > 0) duelTiles.push({ label: "Goal", value: oneVoneFinishing.goals, tone: "green" });
    sections.push(
      <Section
        key="one-v-one-finishing"
        phase="finishing"
        title="1v1 + Finishing"
        value={oneVoneFinishing.duelsWon}
        unit="1v1 duels won"
        playHref={linkOf(oneVoneFinishing)}
        playIconUrl={playIconUrl}
        aside={<StatTiles playIconUrl={playIconUrl} items={duelTiles} />}
      />,
    );
  }

  if (finishing) {
    const finishTiles = [
      { label: "On target", value: finishing.onTarget, tone: "green" as Tone },
      { label: "Off target", value: finishing.offTarget, tone: "amber" as Tone },
      { label: "Blocked", value: finishing.blocked, tone: "grey" as Tone },
    ];
    if (finishing.woodwork && finishing.woodwork > 0) {
      finishTiles.push({ label: "Woodwork", value: finishing.woodwork, tone: "grey" });
    }
    const goals = finishing.goals ?? 0;
    if (goals > 0) finishTiles.push({ label: "Goal", value: goals, tone: "blue" });
    sections.push(
      <Section
        key="finishing"
        phase="finishing"
        title="Finishing"
        value={finishing.shots}
        unit="Total shots"
        playHref={linkOf(finishing)}
        playIconUrl={playIconUrl}
        aside={<StatTiles playIconUrl={playIconUrl} items={finishTiles} />}
        footer={
          <RateBar
            label="Shot accuracy"
            value={pct(finishing.onTarget, finishing.shots)}
            note={`${formatCount(finishing.onTarget)} of ${formatCount(finishing.shots)} shots on target`}
            segments={[
              { value: finishing.onTarget, tone: "green" },
              { value: finishing.shots - finishing.onTarget, tone: "amber" },
            ]}
          />
        }
      />,
    );
  }

  const gridClass =
    sections.length <= 3 ? " spdf-grid--three" : sections.length === 4 ? " spdf-grid--four" : " spdf-grid--five";

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
