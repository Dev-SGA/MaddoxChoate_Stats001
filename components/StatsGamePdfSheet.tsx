import { BRAND } from "@/lib/brand";
import type { GameStats } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
};

type Phase = "hold-up-play" | "finishing";

type Tone = "blue" | "green" | "red" | "grey";

const PHASE_LABEL: Record<Phase, string> = {
  "hold-up-play": "Hold-Up Play",
  finishing: "Finishing",
};

function pct(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function linkHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.length > 48 ? `${url.slice(0, 45)}…` : url;
  }
}

function StatTiles({ items }: { items: { label: string; value: number; tone?: Tone; highlight?: boolean }[] }) {
  return (
    <ul className="spdf-stats">
      {items.map((item) => (
        <li key={item.label} className={`spdf-stat${item.highlight ? " spdf-stat--highlight" : ""}`}>
          <span className={`spdf-stat__value${item.tone ? ` spdf-stat__value--${item.tone}` : ""}`}>{item.value}</span>
          <span className="spdf-stat__label">{item.label}</span>
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

function Section({
  phase,
  title,
  value,
  unit,
  aside,
  footer,
}: {
  phase: Phase;
  title: string;
  value: number;
  unit: string;
  aside: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className={`spdf-section spdf-section--${phase}`}>
      <p className="spdf-section__phase">{PHASE_LABEL[phase]}</p>
      <h3 className="spdf-section__title">{title}</h3>
      <div className="spdf-section__body">
        <div className="spdf-section__kpi">
          <span className="spdf-section__value">{value}</span>
          <span className="spdf-section__unit">{unit}</span>
        </div>
        <div className="spdf-section__aside">{aside}</div>
      </div>
      {footer ? <div className="spdf-section__footer">{footer}</div> : null}
    </section>
  );
}

function PdfVideoLinks({
  backToGoalPlayVideoLink,
  finishingVideoLink,
}: {
  backToGoalPlayVideoLink: string;
  finishingVideoLink: string;
}) {
  const rows = [
    { label: "Back-to-goal play + key/vertical pass", url: backToGoalPlayVideoLink.trim() },
    { label: "Finishes in the Game", url: finishingVideoLink.trim() },
  ];

  return (
    <section className="spdf-videos" aria-label="Video clips">
      <h4 className="spdf-videos__title">Video clips</h4>
      <ul className="spdf-videos__list">
        {rows.map((row) => (
          <li key={row.label}>
            {row.url ? (
              <a className="spdf-videos__link" href={row.url} data-pdf-link={row.url}>
                <span className="spdf-videos__play" aria-hidden="true">
                  ▶
                </span>
                <span className="spdf-videos__text">
                  <strong>{row.label}</strong>
                  <span>{linkHost(row.url)}</span>
                </span>
              </a>
            ) : (
              <span className="spdf-videos__empty">{row.label} — pending</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function StatsGamePdfSheet({ stats, photoUrl, logoUrl }: StatsGamePdfSheetProps) {
  const { player, meta, backToGoalDuels, backToGoalPlay, oneVoneFinishing, finishing } = stats;
  const passAttempts = backToGoalPlay.completed + backToGoalPlay.incomplete;

  return (
    <article className="stats-pdf" aria-hidden="true">
      <aside className="spdf-side">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="spdf-side__logo" />
        <div className="spdf-side__photo" data-pdf-bg={photoUrl} style={{ backgroundImage: `url(${photoUrl})` }} />
        <div className="spdf-side__identity">
          <p className="spdf-side__label">Athlete</p>
          <h2 className="spdf-side__name">{player.name}</h2>
          <p className="spdf-side__club">{player.club}</p>
        </div>
        <p className="spdf-side__slogan">{BRAND.slogan}</p>
      </aside>

      <div className="spdf-main">
        <header className="spdf-head">
          <div>
            <p className="spdf-head__eyebrow">{BRAND.legal}</p>
            <h1 className="spdf-head__title">{meta.title}</h1>
          </div>
          <div className="spdf-head__meta">
            <span>{meta.subtitle}</span>
          </div>
        </header>

        <div className="spdf-grid">
          <Section
            phase="hold-up-play"
            title="Back-to-Goal Duels"
            value={backToGoalDuels.heldOff}
            unit="Successful hold-ups"
            aside={
              <p className="spdf-note">
                Successful playing with his back to goal — held the ball up and brought teammates into the attack.
              </p>
            }
          />

          <Section
            phase="hold-up-play"
            title="Back-to-Goal Play + Key/Vertical Pass"
            value={backToGoalPlay.verticalPasses}
            unit="Vertical passes"
            aside={
              <StatTiles
                items={[
                  { label: "Key passes", value: backToGoalPlay.keyPasses, tone: "blue" },
                  { label: "Completed", value: backToGoalPlay.completed, tone: "green" },
                  { label: "Incomplete", value: backToGoalPlay.incomplete, tone: "red" },
                ]}
              />
            }
            footer={
              <RateBar
                label="Pass completion"
                value={pct(backToGoalPlay.completed, passAttempts)}
                note={`${backToGoalPlay.completed} of ${passAttempts} passes completed`}
                segments={[
                  { value: backToGoalPlay.completed, tone: "green" },
                  { value: backToGoalPlay.incomplete, tone: "red" },
                ]}
              />
            }
          />

          <Section
            phase="finishing"
            title="1v1 + Finishing"
            value={oneVoneFinishing.duelsWon}
            unit="1v1 duels won"
            aside={
              <StatTiles
                items={[
                  { label: "Shots", value: oneVoneFinishing.shots },
                  {
                    label: oneVoneFinishing.goals === 1 ? "Goal" : "Goals",
                    value: oneVoneFinishing.goals,
                    tone: "green",
                    highlight: true,
                  },
                ]}
              />
            }
          />

          <Section
            phase="finishing"
            title="Finishes in the Game"
            value={finishing.shots}
            unit="Total shots"
            aside={
              <StatTiles
                items={[
                  { label: "On target", value: finishing.onTarget, tone: "green" },
                  { label: "Off target", value: finishing.offTarget, tone: "red" },
                  { label: "Blocked", value: finishing.blocked },
                ]}
              />
            }
            footer={
              <RateBar
                label="Shot accuracy"
                value={pct(finishing.onTarget, finishing.shots)}
                note={`${finishing.onTarget} of ${finishing.shots} shots on target`}
                segments={[
                  { value: finishing.onTarget, tone: "green" },
                  { value: finishing.offTarget, tone: "red" },
                  { value: finishing.blocked, tone: "grey" },
                ]}
              />
            }
          />
        </div>

        <PdfVideoLinks
          backToGoalPlayVideoLink={backToGoalPlay.videoLink}
          finishingVideoLink={finishing.videoLink}
        />

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
