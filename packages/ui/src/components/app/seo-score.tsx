"use client"

import { DonutChart, MetricCard } from "@/components/app/metric-card"
import { cn } from "@/lib/utils"

function seoScoreTone(score: number) {
  if (score >= 70) return { text: "text-success", bg: "bg-success/10" }
  if (score >= 40) return { text: "text-warning", bg: "bg-warning/10" }
  return { text: "text-destructive", bg: "bg-destructive/10" }
}

function seoScoreColor(score: number) {
  if (score >= 70) return "var(--success)"
  if (score >= 40) return "var(--warning)"
  return "var(--destructive)"
}

export function SeoAverageCard({ scores, unit, unitPlural }: { scores: (number | null)[]; unit: string; unitPlural: string }) {
  const measured = scores.filter((score): score is number => score !== null)
  const average = measured.length ? Math.round(measured.reduce((sum, score) => sum + score, 0) / measured.length) : 0

  return (
    <MetricCard
      label="Média de SEO"
      value={average}
      sublabel={`de 100 · ${measured.length} ${measured.length === 1 ? unit : unitPlural}`}
      chart={<DonutChart segments={[{ key: "score", label: "SEO", value: average, color: seoScoreColor(average) }, { key: "rest", label: "Restante", value: Math.max(100 - average, 0), color: "var(--muted)" }]} />}
    />
  )
}

export function SeoScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"><span className="text-[10px] tracking-wide uppercase opacity-70">SEO</span><span className="tabular-nums">—</span></span>
  }

  const tone = seoScoreTone(score)
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", tone.bg, tone.text)}><span className="text-[10px] tracking-wide uppercase opacity-70">SEO</span><span className="tabular-nums">{score}</span></span>
}
