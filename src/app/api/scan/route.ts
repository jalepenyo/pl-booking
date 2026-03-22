import { NextRequest } from "next/server";
import { getPlaceDetails } from "@/lib/google-places";
import {
  scoreTrustCategory,
  scoreAvailabilityFromPlaces,
  buildPlaceholderCategory,
  getLetterGrade,
} from "@/lib/scoring";
import type { ScanResult, CategoryScore, CheckResult } from "@/lib/types";

export const maxDuration = 60; // Vercel Pro: extend to 60s

/** SSE scan endpoint — streams check results as they complete */
export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId");

  if (!placeId) {
    return new Response(
      JSON.stringify({ error: "placeId is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        // Step 1: Fetch place details
        const agency = await getPlaceDetails(placeId);
        send("place_found", agency);

        // Step 2: Score Category B — Trust & Reputation (Google Places)
        const trustCategory = scoreTrustCategory(agency);
        for (const check of trustCategory.checks) {
          send("check_result", check);
        }
        send("category_complete", trustCategory);

        // Step 3: Score partial Category C — Availability (from Places hours)
        const availabilityChecks = scoreAvailabilityFromPlaces(agency);
        for (const check of availabilityChecks) {
          send("check_result", check);
        }

        // Build availability category with Places-only checks for now
        // Phase 3 will add Firecrawl checks (chat widget, contact channels, after-hours)
        const availabilityCategory: CategoryScore = {
          category: "availability",
          label: "Availability & Responsiveness",
          question: "Can they reach you when they need you?",
          score: availabilityChecks.reduce(
            (sum: number, c: CheckResult) => sum + c.points,
            0
          ),
          maxScore: 25,
          checks: availabilityChecks,
        };
        send("category_complete", availabilityCategory);

        // Placeholder categories for Phase 2+3
        const visibilityCategory = buildPlaceholderCategory(
          "visibility",
          "Visibility & SEO",
          "Can people find you?"
        );
        send("category_complete", visibilityCategory);

        const conversionCategory = buildPlaceholderCategory(
          "conversion",
          "Lead Capture & Conversion",
          "Can they take action?"
        );
        send("category_complete", conversionCategory);

        // Step 4: Calculate totals
        const categories = [
          visibilityCategory,
          trustCategory,
          availabilityCategory,
          conversionCategory,
        ];

        const totalScore = categories.reduce((sum, c) => sum + c.score, 0);
        const maxPossible = categories.reduce(
          (sum, c) => sum + c.maxScore,
          0
        );
        const unverifiedCount = categories
          .flatMap((c) => c.checks)
          .filter((ch) => ch.status === "unverified").length;

        const result: ScanResult = {
          placeId,
          agency,
          categories,
          totalScore,
          maxPossibleScore: maxPossible,
          letterGrade: getLetterGrade(totalScore),
          unverifiedCount,
          scannedAt: new Date().toISOString(),
        };

        send("scan_complete", result);
      } catch (err) {
        send("scan_error", {
          message:
            err instanceof Error ? err.message : "An unexpected error occurred",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
