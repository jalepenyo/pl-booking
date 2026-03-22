"use client";

import type { PlaceResult, CheckResult, CategoryScore } from "@/lib/types";

interface ScanProgressProps {
  agency: PlaceResult | null;
  checks: CheckResult[];
  categories: CategoryScore[];
  progress: number;
  statusMessage: string;
}

export default function ScanProgress({
  agency,
  checks,
  progress,
  statusMessage,
}: ScanProgressProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            {statusMessage}
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {progress}%
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Agency card */}
      {agency && (
        <div className="shadow-card rounded-card mb-6 overflow-hidden bg-white">
          <div className="flex items-start gap-4 p-5">
            {agency.photoUrl && (
              <img
                src={agency.photoUrl}
                alt={agency.name}
                className="h-20 w-20 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-bold text-header">
                {agency.name}
              </h3>
              <p className="truncate text-sm text-gray-500">
                {agency.address}
              </p>
              {agency.phone && (
                <p className="mt-1 text-sm text-gray-500">{agency.phone}</p>
              )}
              {agency.website && (
                <p className="mt-1 truncate text-sm text-primary">
                  {agency.website}
                </p>
              )}
            </div>
            {agency.rating !== undefined && (
              <div className="flex-shrink-0 text-right">
                <div className="text-2xl font-bold text-score-orange">
                  {agency.rating}★
                </div>
                <div className="text-xs text-gray-400">
                  {agency.reviewCount} reviews
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Running checklist */}
      {checks.length > 0 && (
        <div className="space-y-2">
          {checks.map((check, i) => (
            <div
              key={check.id}
              className="shadow-card flex items-center gap-3 rounded-lg bg-white px-4 py-3"
              style={{
                animation: `fadeSlideIn 0.3s ease-out ${i * 0.05}s both`,
              }}
            >
              {check.status === "pass" && (
                <span className="text-lg text-score-green">✓</span>
              )}
              {check.status === "fail" && (
                <span className="text-lg text-score-red">✗</span>
              )}
              {check.status === "unverified" && (
                <span className="text-lg text-unverified">●</span>
              )}
              <span className="flex-1 text-sm text-gray-700">
                {check.name}
              </span>
              <span className="text-xs font-medium text-gray-400">
                {check.points}/{check.maxPoints} pts
              </span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
