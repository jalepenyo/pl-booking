import type {
  PlaceResult,
  CheckResult,
  CategoryScore,
  ScoringCategory,
  LetterGrade,
} from "./types";

/** Score Category B: Trust & Reputation using Google Places data */
export function scoreTrustCategory(agency: PlaceResult): CategoryScore {
  const checks: CheckResult[] = [];

  // B1: Google rating >= 4.5 (8 pts)
  checks.push({
    id: "trust-rating",
    name: "Google rating ≥ 4.5",
    category: "trust",
    status:
      agency.rating === undefined
        ? "unverified"
        : agency.rating >= 4.5
          ? "pass"
          : "fail",
    points:
      agency.rating === undefined ? 0 : agency.rating >= 4.5 ? 8 : 0,
    maxPoints: 8,
    confidence: "high",
    evidence: agency.rating
      ? `Your Google rating is ${agency.rating} stars`
      : "No Google rating found",
    whyItMatters:
      "Agencies with 4.5+ stars get 2x more clicks from Google search results.",
    policyLiftFix: "Google Review Automation — automated review requests after every policy interaction.",
  });

  // B2: 50+ Google reviews (7 pts)
  checks.push({
    id: "trust-review-count",
    name: "50+ Google reviews",
    category: "trust",
    status:
      agency.reviewCount === undefined
        ? "unverified"
        : agency.reviewCount >= 50
          ? "pass"
          : "fail",
    points:
      agency.reviewCount === undefined
        ? 0
        : agency.reviewCount >= 50
          ? 7
          : 0,
    maxPoints: 7,
    confidence: "high",
    evidence: agency.reviewCount
      ? `You have ${agency.reviewCount} Google reviews`
      : "No review count found",
    whyItMatters:
      "Review volume signals trustworthiness. 50+ reviews makes you competitive in local search.",
    policyLiftFix: "Reputation Management — build review volume automatically with post-service follow-ups.",
  });

  // B3: Review within last 30 days (5 pts)
  const thirtyDaysAgo = Date.now() / 1000 - 30 * 24 * 60 * 60;
  const hasRecentReview = agency.reviews?.some(
    (r) => r.time > thirtyDaysAgo
  );
  checks.push({
    id: "trust-recent-review",
    name: "Review within last 30 days",
    category: "trust",
    status:
      !agency.reviews || agency.reviews.length === 0
        ? "unverified"
        : hasRecentReview
          ? "pass"
          : "fail",
    points: hasRecentReview ? 5 : 0,
    maxPoints: 5,
    confidence: "low",
    evidence: hasRecentReview
      ? "Found a review from the last 30 days"
      : "No recent reviews found in the sample Google provides",
    whyItMatters:
      "Fresh reviews signal an active, engaged business. Stale reviews suggest neglect.",
    policyLiftFix: "Google Review Automation — keeps fresh reviews flowing in consistently.",
  });

  // B4: Owner responds to reviews (5 pts)
  const hasOwnerReply = agency.reviews?.some((r) => r.hasOwnerReply);
  checks.push({
    id: "trust-owner-replies",
    name: "Owner responds to reviews",
    category: "trust",
    status:
      !agency.reviews || agency.reviews.length === 0
        ? "unverified"
        : hasOwnerReply
          ? "pass"
          : "fail",
    points: hasOwnerReply ? 5 : 0,
    maxPoints: 5,
    confidence: "low",
    evidence: hasOwnerReply
      ? "Found owner replies on reviews"
      : "No owner replies found in the sample Google provides",
    whyItMatters:
      "Responding to reviews shows you care about customer feedback and builds trust.",
    policyLiftFix: "Reputation Management — AI-assisted review responses save time while showing you care.",
  });

  const score = checks.reduce((sum, c) => sum + c.points, 0);

  return {
    category: "trust",
    label: "Trust & Reputation",
    question: "Do they trust you at first glance?",
    score,
    maxScore: 25,
    checks,
  };
}

/** Score partial Category C: Availability checks from Google Places data */
export function scoreAvailabilityFromPlaces(
  agency: PlaceResult
): CheckResult[] {
  const checks: CheckResult[] = [];

  // C1: Extended hours beyond 9-5 M-F (8 pts)
  let hasExtendedHours = false;
  if (agency.hours?.periods) {
    for (const period of agency.hours.periods) {
      // Check for weekend hours (day 0 = Sunday, 6 = Saturday)
      if (period.open.day === 0 || period.open.day === 6) {
        hasExtendedHours = true;
        break;
      }
      // Check for hours before 9am or after 5pm
      const openTime = parseInt(period.open.time, 10);
      const closeTime = period.close
        ? parseInt(period.close.time, 10)
        : 0;
      if (openTime < 900 || closeTime > 1700) {
        hasExtendedHours = true;
        break;
      }
    }
  }

  checks.push({
    id: "availability-hours",
    name: "Extended hours beyond 9-5 M-F",
    category: "availability",
    status: !agency.hours?.periods
      ? "unverified"
      : hasExtendedHours
        ? "pass"
        : "fail",
    points: hasExtendedHours ? 8 : 0,
    maxPoints: 8,
    confidence: "high",
    evidence: agency.hours?.weekdayText
      ? `Hours: ${agency.hours.weekdayText.slice(0, 2).join(", ")}...`
      : "No hours information found",
    whyItMatters:
      "Insurance needs don't follow business hours. Accidents happen at 10pm on Saturday.",
    policyLiftFix:
      "Voice AI (Kelly) — answers calls 24/7 so you never miss a lead, even after hours.",
  });

  return checks;
}

/** Calculate letter grade from total score */
export function getLetterGrade(score: number): LetterGrade {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

/** Get grade color class */
export function getGradeColor(grade: LetterGrade): string {
  switch (grade) {
    case "A":
    case "B":
      return "text-score-green";
    case "C":
    case "D":
      return "text-score-orange";
    case "F":
      return "text-score-red";
  }
}

/** Build placeholder scores for categories not yet implemented (Phase 2+) */
export function buildPlaceholderCategory(
  category: ScoringCategory,
  label: string,
  question: string
): CategoryScore {
  return {
    category,
    label,
    question,
    score: 0,
    maxScore: 25,
    checks: [],
  };
}
