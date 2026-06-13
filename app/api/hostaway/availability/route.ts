import { NextRequest, NextResponse } from "next/server";
import { getHostawayListingById, getMockAvailability } from "../../../data/hostaway";

export async function GET(request: NextRequest) {
  const listingIdParam = request.nextUrl.searchParams.get("listingId");
  const listingId = listingIdParam ? Number(listingIdParam) : undefined;

  if (listingIdParam && (!listingId || !getHostawayListingById(listingId))) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  // Production note: connect this server route to Hostaway availability/rates.
  // Keep HOSTAWAY_ACCOUNT_ID, HOSTAWAY_API_KEY, and live endpoint URLs in env vars
  // so no API keys or secrets are ever exposed in frontend JavaScript.
  return NextResponse.json({
    source: "mock-hostaway",
    listingId: listingId ?? "all",
    availability: getMockAvailability(listingId),
  });
}
