/**
 * Cloudflare Worker: Route /win and /book to Vercel, everything else to Webflow
 *
 * SETUP:
 * 1. Deploy pl-labs to Vercel (connect the GitHub repo)
 * 2. Copy your Vercel deploy URL (e.g., pl-labs.vercel.app)
 * 3. Replace VERCEL_ORIGIN below with that URL
 * 4. In Cloudflare dashboard:
 *    - Go to Workers & Pages → Create Worker
 *    - Paste this script
 *    - Go to your policylift.ai domain → Workers Routes
 *    - Add route: policylift.ai/win* → this worker
 *    - Add route: policylift.ai/book* → this worker
 */

const VERCEL_ORIGIN = "https://pl-booking.vercel.app";

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Only proxy /win and /book (and their assets)
  if (path === "/win" || path === "/book" || path === "/placard" || path === "/icon.svg" || path.startsWith("/_next/") || path.startsWith("/images/")) {
    const vercelUrl = new URL(path + url.search, VERCEL_ORIGIN);

    const modifiedRequest = new Request(vercelUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    const response = await fetch(modifiedRequest);

    // Return with CORS and cache headers
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

    return modifiedResponse;
  }

  // Everything else passes through to Webflow (default origin)
  return fetch(request);
}
