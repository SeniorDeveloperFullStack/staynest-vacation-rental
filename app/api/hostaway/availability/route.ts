import { NextRequest, NextResponse } from "next/server";
import {
  getHostawayListingById,
  getHostawayListingByPropertyId,
  getMockAvailability,
} from "../../../data/hostaway";

export async function GET(request: NextRequest) {
  const listingIdParam = request.nextUrl.searchParams.get("listingId");
  const propertyIdParam = request.nextUrl.searchParams.get("propertyId");

  if (!listingIdParam && !propertyIdParam) {
    return NextResponse.json(
      {
        error: {
          code: "MISSING_PROPERTY_ID",
          message: "Provide either a propertyId or listingId query parameter.",
        },
      },
      { status: 400 },
    );
  }

  if (listingIdParam && propertyIdParam) {
    return NextResponse.json(
      {
        error: {
          code: "MULTIPLE_PROPERTY_IDS",
          message: "Provide only one query parameter: propertyId or listingId.",
        },
      },
      { status: 400 },
    );
  }

  const numericListingId = listingIdParam ? Number(listingIdParam) : undefined;
  const listing = listingIdParam
    ? Number.isInteger(numericListingId) && numericListingId
      ? getHostawayListingById(numericListingId)
      : undefined
    : getHostawayListingByPropertyId(propertyIdParam!);

  if (!listing) {
    return NextResponse.json(
      {
        error: {
          code: "PROPERTY_NOT_FOUND",
          message: `No mock Hostaway property was found for ${listingIdParam ? "listingId" : "propertyId"} "${listingIdParam ?? propertyIdParam}".`,
        },
      },
      { status: 404 },
    );
  }

  // Production note: connect this server route to Hostaway availability/rates.
  // Keep HOSTAWAY_ACCOUNT_ID, HOSTAWAY_API_KEY, and live endpoint URLs in env vars
  // so no API keys or secrets are ever exposed in frontend JavaScript.
  return NextResponse.json({
    source: "mock-hostaway",
    listing,
    availability: getMockAvailability(listing.id),
  });
}
