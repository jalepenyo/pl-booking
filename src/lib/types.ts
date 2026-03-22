/** Core types for the Agency Grader */

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  reviews?: PlaceReview[];
  hours?: PlaceHours;
  photoUrl?: string;
  location?: { lat: number; lng: number };
}

export interface PlaceReview {
  authorName: string;
  rating: number;
  text: string;
  time: number; // unix timestamp
  relativeTime: string;
  hasOwnerReply: boolean;
}

export interface PlaceHours {
  openNow?: boolean;
  periods?: {
    open: { day: number; time: string };
    close?: { day: number; time: string };
  }[];
  weekdayText?: string[];
}

export type CheckStatus = "pass" | "fail" | "unverified";

export interface CheckResult {
  id: string;
  name: string;
  category: ScoringCategory;
  status: CheckStatus;
  points: number;
  maxPoints: number;
  confidence: "high" | "medium" | "medium-low" | "low";
  evidence?: string;
  whyItMatters?: string;
  policyLiftFix?: string;
}

export type ScoringCategory =
  | "visibility"
  | "trust"
  | "availability"
  | "conversion";

export interface CategoryScore {
  category: ScoringCategory;
  label: string;
  question: string;
  score: number;
  maxScore: number;
  checks: CheckResult[];
}

export interface ScanResult {
  placeId: string;
  agency: PlaceResult;
  categories: CategoryScore[];
  totalScore: number;
  maxPossibleScore: number;
  letterGrade: string;
  unverifiedCount: number;
  verdict?: string;
  scannedAt: string;
}

export type LetterGrade = "A" | "B" | "C" | "D" | "F";

/** SSE event types streamed during a scan */
export type ScanEventType =
  | "place_found"
  | "check_result"
  | "category_complete"
  | "scan_complete"
  | "scan_error";

export interface ScanEvent {
  type: ScanEventType;
  data: PlaceResult | CheckResult | CategoryScore | ScanResult | { message: string };
}
