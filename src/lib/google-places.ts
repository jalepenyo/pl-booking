import type { PlaceResult, PlaceReview, PlaceHours } from "./types";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const BASE_URL = "https://maps.googleapis.com/maps/api/place";

/** Search for an insurance agency by Place ID and return enriched data */
export async function getPlaceDetails(placeId: string): Promise<PlaceResult> {
  const fields = [
    "place_id",
    "name",
    "formatted_address",
    "formatted_phone_number",
    "website",
    "rating",
    "user_ratings_total",
    "reviews",
    "opening_hours",
    "photos",
    "geometry",
  ].join(",");

  const url = `${BASE_URL}/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Google Places API error: ${res.status}`);
  }

  const json = await res.json();

  if (json.status !== "OK") {
    throw new Error(`Google Places API status: ${json.status}`);
  }

  const place = json.result;

  const reviews: PlaceReview[] = (place.reviews ?? []).map(
    (r: Record<string, unknown>) => ({
      authorName: r.author_name as string,
      rating: r.rating as number,
      text: r.text as string,
      time: r.time as number,
      relativeTime: r.relative_time_description as string,
      hasOwnerReply: !!(r as Record<string, unknown>).author_url && false, // Places API doesn't directly expose owner replies in reviews array — check for reply field
    })
  );

  // Check for owner replies more accurately
  for (let i = 0; i < reviews.length; i++) {
    const raw = place.reviews?.[i];
    if (raw?.author_url && raw?.text) {
      // The Places API doesn't consistently expose the `reply` field.
      // We check if the raw review object has any reply-like property.
      reviews[i].hasOwnerReply = !!raw.reply;
    }
  }

  const hours: PlaceHours | undefined = place.opening_hours
    ? {
        openNow: place.opening_hours.open_now,
        periods: place.opening_hours.periods,
        weekdayText: place.opening_hours.weekday_text,
      }
    : undefined;

  let photoUrl: string | undefined;
  if (place.photos && place.photos.length > 0) {
    const photoRef = place.photos[0].photo_reference;
    photoUrl = `${BASE_URL}/photo?maxwidth=400&photo_reference=${photoRef}&key=${API_KEY}`;
  }

  return {
    placeId: place.place_id,
    name: place.name,
    address: place.formatted_address,
    phone: place.formatted_phone_number,
    website: place.website,
    rating: place.rating,
    reviewCount: place.user_ratings_total,
    reviews,
    hours,
    photoUrl,
    location: place.geometry?.location
      ? { lat: place.geometry.location.lat, lng: place.geometry.location.lng }
      : undefined,
  };
}

/** Text search fallback when autocomplete doesn't find a result */
export async function searchAgency(
  query: string
): Promise<{ placeId: string; name: string; address: string }[]> {
  const url = `${BASE_URL}/textsearch/json?query=${encodeURIComponent(query + " insurance agency")}&type=insurance_agency&key=${API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Google Places text search error: ${res.status}`);
  }

  const json = await res.json();

  return (json.results ?? []).slice(0, 5).map(
    (r: Record<string, unknown>) => ({
      placeId: r.place_id as string,
      name: r.name as string,
      address: r.formatted_address as string,
    })
  );
}
