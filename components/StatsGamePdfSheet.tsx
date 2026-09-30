import { BRAND } from "@/lib/brand";
import type { GameStats } from "@/lib/stats";

type StatsGamePdfSheetProps = {
  stats: GameStats;
  photoUrl: string;
  logoUrl: string;
};

type Phase = "build-up" | "defensive";

const PHASE_LABEL: Record<Phase, string> = {
  "build-up": "Build-Up",
  defensive: "Defensive Phase",
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

function Bar({
  label,
  value,
  total,
  tone,
  detail,
}: {
  label: string;
  value: number;
  total: number;
  tone: "blue" | "green" | "red";
  detail?: string;
}) {
  const share = pct(value, total);
  return (
    <div className="spdf-bar">
      <div className="spdf-bar__head">
        <span className="spdf-bar__label">{label}</span>
        <span className="spdf-bar__figure">
          {detail ?? value}
          <span className="spdf-bar__pct">{share}%</span>
        </span>
      </div>
      <div className="spdf-bar__track">
        <div className={`spdf-bar__fill spdf-bar__fill--${tone}`} style={{ width: `${share}%` }} />
      </div>
    </div>
  );
}

function Section({
  phase,
  title,
  value,
  unit,
  children,
}: {
  phase: Phase;
  title: string;
  value: string;
  unit: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={`spdf-section spdf-section--${phase}`}>
      <p className="spdf-section__phase">{PHASE_LABEL[phase]}</p>
      <h3 className="spdf-section__title">{title}</h3>
      <div className="spdf-section__kpi">
        <span className="spdf-section__value">{value}</span>
        <span className="spdf-section__unit">{unit}</span>
      </div>
      {children ? <div className="spdf-section__detail">{children}</div> : null}
    </section>
  );
}

function PdfVideoLinks({
  backFootPassingVideoLink,
  oneVoneFinishingVideoLink,
}: {
  backFootPassingVideoLink: string;
  oneVoneFinishingVideoLink: string;
}) {
  const rows = [
    { label: "Back-foot play + key/vertical pass", url: backFootPassingVideoLink.trim() },
    { label: "1v1 + finishing", url: oneVoneFinishingVideoLink.trim() },
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
  const { player, meta, backFootDuels, backFootPassing, oneVoneFinishing, finishing } = stats;
  const passAttempts = backFootPassing.correct + backFootPassing.wrong;
  const issued = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

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
            <span>{issued}</span>
          </div>
        </header>

        <div className="spdf-grid">
          <Section
            phase="defensive"
            title="Back-Foot Duels"
            value={String(backFootDuels.successfulPressure)}
            unit="successful holds"
          >
            <p className="spdf-note">Times successfully withstood back-foot pressure during the match.</p>
          </Section>

          <Section
            phase="build-up"
            title="Back-Foot Play + Key/Vertical Pass"
            value={String(backFootPassing.verticalPasses)}
            unit="vertical passes"
          >
            <Bar label="Key passes" value={backFootPassing.keyPasses} total={backFootPassing.verticalPasses} tone="blue" />
            <Bar
              label="Correct"
              value={backFootPassing.correct}
              total={passAttempts}
              detail={`${backFootPassing.correct}/${passAttempts}`}
              tone="green"
            />
            <Bar
              label="Wrong"
              value={backFootPassing.wrong}
              total={passAttempts}
              detail={`${backFootPassing.wrong}/${passAttempts}`}
              tone="red"
            />
          </Section>

          <Section phase="build-up" title="1v1 + Finishing" value={String(oneVoneFinishing.shots)} unit="shots">
            <p className="spdf-note">
              {oneVoneFinishing.duelsWon} duels won · {oneVoneFinishing.goals} goal
              {oneVoneFinishing.goals === 1 ? "" : "s"}
            </p>
            <Bar label="Goals" value={oneVoneFinishing.goals} total={oneVoneFinishing.shots} tone="blue" />
          </Section>

          <Section phase="build-up" title="Finishing" value={String(finishing.shots)} unit="shots">
            <Bar label="On target" value={finishing.onTarget} total={finishing.shots} tone="green" />
            <Bar label="Off target" value={finishing.offTarget} total={finishing.shots} tone="red" />
            <Bar label="Blocked" value={finishing.blocked} total={finishing.shots} tone="blue" />
          </Section>
        </div>

        <PdfVideoLinks
          backFootPassingVideoLink={backFootPassing.videoLink}
          oneVoneFinishingVideoLink={oneVoneFinishing.videoLink}
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
