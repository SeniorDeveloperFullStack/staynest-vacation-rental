"use client";

import { useCallback, useEffect, useState } from "react";
import type { HostawayAvailabilityNight, HostawayListing } from "../data/hostaway";
import type { Property } from "../data/properties";
import { AvailabilitySection } from "./AvailabilitySection";
import { BookingCTA } from "./BookingCTA";
import { Icon } from "./icons";

type ListingsResponse = {
  source: string;
  count: number;
  listings: HostawayListing[];
};

type AvailabilityResponse = {
  source: string;
  listing: HostawayListing;
  availability: HostawayAvailabilityNight[];
};

type IntegrationData = {
  listing: HostawayListing;
  availability: HostawayAvailabilityNight[];
};

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message ?? "The mock Hostaway API request failed.";
    throw new Error(message);
  }
  return data as T;
}

export function HostawayPropertyIntegration({
  property,
  variant,
}: {
  property: Property;
  variant: "content" | "booking";
}) {
  const [data, setData] = useState<IntegrationData | null>(null);
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  const loadIntegration = useCallback(async () => {
    setError("");
    setData(null);

    try {
      const listingsResponse = await fetch("/api/hostaway/listings");
      const listingsData = await readJson<ListingsResponse>(listingsResponse);
      const listing = listingsData.listings.find((item) => item.propertySlug === property.slug);

      if (!listing) {
        throw new Error(`No mock Hostaway listing is connected to ${property.name}.`);
      }

      const availabilityResponse = await fetch(
        `/api/hostaway/availability?propertyId=${encodeURIComponent(property.slug)}`,
      );
      const availabilityData = await readJson<AvailabilityResponse>(availabilityResponse);

      setData({ listing, availability: availabilityData.availability });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load booking data.");
    }
  }, [property.name, property.slug]);

  useEffect(() => {
    void loadIntegration();
  }, [loadIntegration, requestKey]);

  if (error) {
    return (
      <div className={`api-state api-error ${variant === "booking" ? "api-state-booking" : ""}`} role="alert">
        <span><Icon name="close" /></span>
        <div>
          <strong>Booking data is unavailable</strong>
          <p>{error}</p>
          <button onClick={() => setRequestKey((key) => key + 1)}>Try again</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`api-state api-loading ${variant === "booking" ? "api-state-booking" : ""}`} aria-live="polite">
        <span className="loading-spinner" />
        <div><strong>Loading booking data</strong><p>Connecting to the mock Hostaway API...</p></div>
      </div>
    );
  }

  if (variant === "booking") {
    return <BookingCTA property={property} bookingUrl={data.listing.bookingUrl} />;
  }

  return (
    <>
      <div className="hostaway-demo">
        <span className="integration-icon"><Icon name="check" /></span>
        <div className="integration-copy">
          <div className="section-kicker">Hostaway-style integration demo</div>
          <h2>Built for a seamless booking flow.</h2>
          <p>
            Listing and calendar data below were fetched from the project&apos;s mock Hostaway API routes. Real credentials can
            later be connected securely on the server.
          </p>
        </div>
        <div className="integration-meta">
          <span><strong>Listing ID</strong>{data.listing.externalListingId}</span>
          <span><strong>Status</strong>{data.listing.channelStatus}</span>
          <span><strong>Mock sync</strong>{new Date(data.listing.syncedAt).toLocaleDateString("en-US")}</span>
        </div>
      </div>
      <AvailabilitySection listing={data.listing} availability={data.availability} />
    </>
  );
}
