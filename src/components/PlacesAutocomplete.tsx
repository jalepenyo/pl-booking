"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Prediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface PlacesAutocompleteProps {
  onSelect: (placeId: string, name: string) => void;
  disabled?: boolean;
}

export default function PlacesAutocomplete({
  onSelect,
  disabled,
}: PlacesAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchPredictions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/places?input=${encodeURIComponent(input)}`
      );
      const json = await res.json();
      setPredictions(json.predictions ?? []);
      setIsOpen((json.predictions ?? []).length > 0);
    } catch {
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setHighlightedIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(value), 300);
  };

  const handleSelect = (prediction: Prediction) => {
    setQuery(prediction.mainText);
    setIsOpen(false);
    setPredictions([]);
    onSelect(prediction.placeId, prediction.mainText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) =>
        i < predictions.length - 1 ? i + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) =>
        i > 0 ? i - 1 : predictions.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(predictions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => predictions.length > 0 && setIsOpen(true)}
          placeholder="Enter your agency name..."
          disabled={disabled}
          className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-lg shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-60"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="places-listbox"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-primary)]" />
          </div>
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <ul
          id="places-listbox"
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg"
        >
          {predictions.map((p, i) => (
            <li
              key={p.placeId}
              role="option"
              aria-selected={i === highlightedIndex}
              onClick={() => handleSelect(p)}
              onMouseEnter={() => setHighlightedIndex(i)}
              className={`cursor-pointer px-5 py-3 transition-colors ${
                i === highlightedIndex ? "bg-gray-50" : ""
              }`}
            >
              <div className="font-medium text-gray-900">{p.mainText}</div>
              <div className="text-sm text-gray-500">{p.secondaryText}</div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && predictions.length === 0 && query.length >= 2 && !isLoading && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-lg">
          <p className="text-gray-500">
            No agencies found — try entering the full name with city and state.
          </p>
        </div>
      )}
    </div>
  );
}
