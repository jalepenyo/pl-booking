import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;

/** Proxy Google Places Autocomplete to keep API key server-side */
export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input");
  if (!input || input.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json"
  );
  url.searchParams.set("input", input);
  url.searchParams.set("types", "establishment");
  url.searchParams.set("components", "country:us");
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString());
  const json = await res.json();

  const predictions = (json.predictions ?? []).map(
    (p: Record<string, unknown>) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: (p.structured_formatting as Record<string, unknown>)
        ?.main_text,
      secondaryText: (p.structured_formatting as Record<string, unknown>)
        ?.secondary_text,
    })
  );

  return NextResponse.json({ predictions });
}
