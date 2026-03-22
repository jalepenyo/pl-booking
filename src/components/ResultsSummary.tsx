"use client";

import type { ScanResult } from "@/lib/types";
import FunnelWalkthrough from "./FunnelWalkthrough";

interface ResultsSummaryProps {
  result: ScanResult;
}

function getGradeColor(grade: string) {
  if (grade === "A" || grade === "B") return "#12B76A";
  if (grade === "C" || grade === "D") return "#FFB345";
  return "#EF4444";
}

function getGradeLabel(grade: string) {
  switch (grade) {
    case "A": return "Strong digital presence";
    case "B": return "Good foundation — notable gaps";
    case "C": return "Average — significant opportunities";
    case "D": return "Below average — major gaps";
    case "F": return "Critical — needs immediate attention";
    default: return "";
  }
}


export default function ResultsSummary({ result }: ResultsSummaryProps) {
  const gradeColor = getGradeColor(result.letterGrade);
  const circumference = 2 * Math.PI * 54;
  const filled = (result.totalScore / 100) * circumference;

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Hero score card */}
      <div className="shadow-card rounded-donut mb-8 bg-white p-8">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          {/* Donut chart */}
          <div className="relative flex-shrink-0">
            <svg width="140" height="140" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="54"
                fill="none" stroke="#e5e7eb" strokeWidth="10"
              />
              <circle
                cx="60" cy="60" r="54"
                fill="none" stroke={gradeColor} strokeWidth="10"
                strokeDasharray={`${filled} ${circumference}`}
                strokeDashoffset={circumference / 4}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-display text-3xl font-bold"
                style={{ color: gradeColor }}
              >
                {result.totalScore}
              </span>
              <span className="text-xs text-gray-400">/100</span>
            </div>
          </div>

          {/* Score details */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-2 flex items-center justify-center gap-3 md:justify-start">
              <span
                className="font-display text-5xl font-bold"
                style={{ color: gradeColor }}
              >
                {result.letterGrade}
              </span>
              <span className="text-lg text-gray-500">
                {getGradeLabel(result.letterGrade)}
              </span>
            </div>
            <h1 className="font-display text-xl font-bold text-header">
              Digital Presence Audit — {result.agency.name}
            </h1>
            {result.unverifiedCount > 0 && (
              <p className="mt-2 text-sm text-gray-400">
                *{result.unverifiedCount} checks could not be verified and are
                not counted against you.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Funnel walkthrough — scores + checks + CTA all in one */}
      <FunnelWalkthrough result={result} />
    </div>
  );
}
