"use client";

import { useState, useCallback } from "react";
import PlacesAutocomplete from "@/components/PlacesAutocomplete";
import ScanProgress from "@/components/ScanProgress";
import ResultsSummary from "@/components/ResultsSummary";
import type {
  PlaceResult,
  CheckResult,
  CategoryScore,
  ScanResult,
} from "@/lib/types";

type AppState = "idle" | "scanning" | "results" | "error";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [agency, setAgency] = useState<PlaceResult | null>(null);
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [categories, setCategories] = useState<CategoryScore[]>([]);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const startScan = useCallback(async (placeId: string, _name: string) => {
    setState("scanning");
    setAgency(null);
    setChecks([]);
    setCategories([]);
    setResult(null);
    setProgress(5);
    setStatusMessage("Looking up your agency...");
    setErrorMessage("");

    try {
      const res = await fetch(
        `/api/scan?placeId=${encodeURIComponent(placeId)}`
      );

      if (!res.ok || !res.body) {
        throw new Error("Failed to start scan");
      }

      // Collect all SSE events first, then reveal them on a timer
      const events: { event: string; data: unknown }[] = [];
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7);
          } else if (line.startsWith("data: ") && currentEvent) {
            try {
              const data = JSON.parse(line.slice(6));
              events.push({ event: currentEvent, data });
            } catch {
              // skip malformed JSON
            }
            currentEvent = "";
          }
        }
      }

      // Now reveal events on a choreographed timeline
      for (const { event, data } of events) {
        switch (event) {
          case "place_found":
            setAgency(data as PlaceResult);
            setProgress(15);
            setStatusMessage("Found your agency! Checking visibility...");
            await delay(1500);
            break;

          case "check_result":
            setChecks((prev) => [...prev, data as CheckResult]);
            setProgress((prev) => Math.min(prev + 10, 85));
            await delay(800);
            break;

          case "category_complete":
            setCategories((prev) => [...prev, data as CategoryScore]);
            setProgress((prev) => Math.min(prev + 5, 90));
            setStatusMessage("Analyzing next category...");
            await delay(600);
            break;

          case "scan_complete":
            setStatusMessage("Calculating your score...");
            setProgress(95);
            await delay(1200);
            setResult(data as ScanResult);
            setProgress(100);
            setStatusMessage("Done!");
            await delay(800);
            setState("results");
            break;

          case "scan_error":
            setState("error");
            setErrorMessage(
              (data as { message: string }).message ??
                "Something went wrong during the scan."
            );
            break;
        }
      }
    } catch (err) {
      setState("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Scan failed — please try again."
      );
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-header px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-display text-xl font-bold text-white">
            PolicyLift
          </span>
          <span className="text-sm text-gray-300">Agency Grader</span>
        </div>
      </header>

      <main className="px-4 py-12 sm:px-6">
        {/* Landing / idle state */}
        {state === "idle" && (
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display mb-4 text-4xl font-bold text-header sm:text-5xl">
              How does your agency stack up online?
            </h1>
            <p className="mb-10 text-lg text-gray-500">
              Get a free digital presence audit in 30 seconds. No signup
              required.
            </p>

            <div className="mx-auto max-w-xl">
              <PlacesAutocomplete onSelect={startScan} />
            </div>

            <p className="mt-6 text-sm text-gray-400">
              We&apos;ll check your Google reviews, website performance, SEO,
              and more.
            </p>
          </div>
        )}

        {/* Scanning state */}
        {state === "scanning" && (
          <div className="mx-auto max-w-2xl pt-4">
            <ScanProgress
              agency={agency}
              checks={checks}
              categories={categories}
              progress={progress}
              statusMessage={statusMessage}
            />
          </div>
        )}

        {/* Results state */}
        {state === "results" && result && (
          <div className="pt-4">
            <ResultsSummary result={result} />
          </div>
        )}

        {/* Error state */}
        {state === "error" && (
          <div className="mx-auto max-w-lg pt-12 text-center">
            <div className="shadow-card rounded-card mb-6 bg-white p-8">
              <p className="mb-4 text-lg text-gray-700">
                {errorMessage || "Something went wrong."}
              </p>
              <button
                onClick={() => {
                  setState("idle");
                  setErrorMessage("");
                }}
                className="rounded-cta bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
