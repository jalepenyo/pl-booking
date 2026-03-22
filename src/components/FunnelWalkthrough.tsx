"use client";

import { useState } from "react";
import type { ScanResult, CheckResult } from "@/lib/types";

interface FunnelWalkthroughProps {
  result: ScanResult;
}

function CheckRow({ check }: { check: CheckResult }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <span className="mt-0.5 flex-shrink-0 text-sm">
        {check.status === "pass" && "✅"}
        {check.status === "fail" && "❌"}
        {check.status === "unverified" && "⚪"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-gray-800">{check.name}</span>
          <span className="flex-shrink-0 text-xs font-semibold text-gray-400">
            {check.points}/{check.maxPoints}
          </span>
        </div>
        {check.evidence && (
          <p className="mt-0.5 text-xs text-gray-500">{check.evidence}</p>
        )}
        {check.status === "fail" && check.policyLiftFix && (
          <p className="mt-1 text-xs font-medium text-primary">
            ✦ {check.policyLiftFix}
          </p>
        )}
      </div>
    </div>
  );
}

function ScorePill({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  let bg = "bg-score-red/10 text-score-red";
  if (pct >= 80) bg = "bg-score-green/10 text-score-green";
  else if (pct >= 50) bg = "bg-score-orange/10 text-score-orange";
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-bold ${bg}`}>
      {score}/{max}
    </span>
  );
}

/** PolicyLift icon — small green square-in-square */
function PLIcon({ muted }: { muted?: boolean }) {
  const c = muted ? "#9ca3af" : "#0E8A52";
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
      <rect x="2" y="2" width="16" height="16" rx="3" stroke={c} strokeWidth="2" />
      <rect x="7" y="7" width="6" height="6" rx="1" fill={c} />
    </svg>
  );
}

export default function FunnelWalkthrough({ result }: FunnelWalkthroughProps) {
  const [expandedStage, setExpandedStage] = useState<number | null>(0);

  const categoryMap = new Map(
    result.categories.map((c) => [c.category, c])
  );

  const visibility = categoryMap.get("visibility");
  const trust = categoryMap.get("trust");
  const availability = categoryMap.get("availability");
  const conversion = categoryMap.get("conversion");

  const scoredStages = [
    {
      name: "Discovery & Intent",
      subtitle: "Can people find you? Do they trust you?",
      score: (visibility?.score ?? 0) + (trust?.score ?? 0),
      max: (visibility?.maxScore ?? 25) + (trust?.maxScore ?? 25),
      checks: [
        ...(visibility?.checks ?? []),
        ...(trust?.checks ?? []),
      ],
      products: "SEO Website, Review Automation, Digital Ads",
    },
    {
      name: "Lead Capture & Qualification",
      subtitle: "Can they reach you? Can they take action?",
      score: (availability?.score ?? 0) + (conversion?.score ?? 0),
      max: (availability?.maxScore ?? 25) + (conversion?.maxScore ?? 25),
      checks: [
        ...(availability?.checks ?? []),
        ...(conversion?.checks ?? []),
      ],
      products: "Voice AI, Chat AI, Smart Forms, Booking Tools",
    },
  ];

  const teaserStages = [
    { name: "Intake & Underwriting", products: "Digital Intake, Dec Page Pull, Data Enrichment" },
    { name: "Quote & Bind", products: "Rater, Carrier Submissions, Customer Portal" },
    { name: "Service, Renew, Grow", products: "Policy Servicing, Renewal Automation, Cross-sell" },
  ];

  // Funnel widths — each stage narrows
  const widths = ["100%", "88%", "76%", "66%", "58%"];

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="font-display text-2xl font-bold text-header">
          Your prospect&apos;s journey — scored
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          We graded the top of your funnel. The rest is what PolicyLift
          automates.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-0">
        {/* === SCORED STAGES === */}
        {scoredStages.map((stage, i) => {
          const isExpanded = expandedStage === i;
          const hasChecks = stage.checks.length > 0;
          return (
            <div
              key={stage.name}
              className="mx-auto"
              style={{ width: widths[i] }}
            >
              <button
                onClick={() =>
                  hasChecks &&
                  setExpandedStage(isExpanded ? null : i)
                }
                className={`shadow-card w-full bg-white text-left transition-all ${
                  i === 0 ? "rounded-t-2xl" : ""
                } ${isExpanded ? "shadow-elevated" : ""} ${
                  hasChecks ? "cursor-pointer hover:shadow-elevated" : ""
                }`}
              >
                <div className="flex items-center gap-3 px-5 py-4">
                  <PLIcon />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold text-primary">
                        {stage.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{stage.subtitle}</p>
                  </div>
                  <ScorePill score={stage.score} max={stage.max} />
                  {hasChecks && (
                    <svg
                      className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Expanded checks */}
              {isExpanded && hasChecks && (
                <div
                  className="shadow-card border-t border-gray-100 bg-white px-5 pb-4"
                  style={{ width: "100%" }}
                >
                  <div className="divide-y divide-gray-50">
                    {stage.checks.map((check) => (
                      <CheckRow key={check.id} check={check} />
                    ))}
                  </div>
                  <p className="mt-3 border-t border-gray-50 pt-3 text-xs text-gray-400">
                    PolicyLift products: {stage.products}
                  </p>
                </div>
              )}

              {/* Dashed connector between scored stages */}
              {i < scoredStages.length - 1 && (
                <div className="mx-auto h-0 w-4/5 border-t border-dashed border-gray-300" />
              )}
            </div>
          );
        })}

        {/* === DIVIDER: "We grade above / PolicyLift below" === */}
        <div
          className="mx-auto flex items-center gap-3 py-3"
          style={{ width: widths[1] }}
        >
          <div className="h-px flex-1 bg-primary/30" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Graded above · Automated below
          </span>
          <div className="h-px flex-1 bg-primary/30" />
        </div>

        {/* === TEASER STAGES === */}
        {teaserStages.map((stage, i) => {
          const stageIndex = i + 2; // offset past scored stages
          const isLast = i === teaserStages.length - 1;

          return (
            <div
              key={stage.name}
              className="mx-auto"
              style={{ width: widths[stageIndex] }}
            >
              {/* Sale/Binding line before last stage */}
              {isLast && (
                <div className="flex items-center gap-2 py-2">
                  <div className="h-px flex-1 bg-primary" />
                  <span className="text-[10px] font-bold italic text-header">
                    SALE / BINDING
                  </span>
                  <div className="h-px flex-1 bg-primary" />
                </div>
              )}

              <div
                className={`border border-dashed border-gray-200 bg-gray-50/80 px-5 py-3 ${
                  isLast ? "rounded-b-2xl" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <PLIcon muted />
                  <div className="flex-1">
                    <span className="font-display text-sm font-bold text-gray-400">
                      {stage.name}
                    </span>
                    <p className="text-xs text-gray-400">{stage.products}</p>
                  </div>
                </div>
              </div>

              {/* Dashed connector between teaser stages */}
              {!isLast && i < 1 && (
                <div className="mx-auto h-0 w-4/5 border-t border-dashed border-gray-200" />
              )}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-6 text-center">
        <p className="mb-3 text-sm text-gray-500">
          Curious how to automate everything below the line?
        </p>
        <button className="rounded-cta bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
          Book a Demo → See the Full Platform
        </button>
      </div>
    </div>
  );
}
