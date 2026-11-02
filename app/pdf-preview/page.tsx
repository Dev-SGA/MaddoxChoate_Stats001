import { StatsGamePdfSheet } from "@/components/StatsGamePdfSheet";
import { BRAND } from "@/lib/brand";
import { getStatsReport, toGameStats } from "@/lib/stats";

type PdfPreviewPageProps = {
  searchParams: Promise<{ match?: string }>;
};

/** Dev-only route that renders the PDF sheet visible for screenshots/review. */
export default async function PdfPreviewPage({ searchParams }: PdfPreviewPageProps) {
  const { match: matchId } = await searchParams;
  const report = getStatsReport();
  const match = report.matches.find((item) => item.id === matchId) ?? report.matches[0];
  const stats = toGameStats(report, match);

  return (
    <StatsGamePdfSheet
      stats={stats}
      photoUrl={stats.player.photo}
      logoUrl={BRAND.logoTrimmed}
      playIconUrl="/brand/play-icon.png"
      clubLogoUrl={stats.player.clubLogo}
      opponentLogoUrl={stats.opponentLogo}
    />
  );
}
