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

type LoadState = "loading" | "success" | "error";

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message ?? "The mock Hostaway API request failed.";
    throw new Error(message);
  }
  return data as T;
}

async function fetchJson<T>(url: string, signal: AbortSignal) {
  return readJson<T>(await fetch(url, { signal, cache: "no-store" }));
}

export function HostawayPropertyIntegration({
  property,
  variant,
}: {
  property: Property;
  variant: "content" | "booking";
}) {
  const [data, setData] = useState<IntegrationData | null>(null);
  const [status, setStatus] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  const loadIntegration = useCallback(async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    setStatus("loading");
    setError("");
    setData(null);

    try {
      const [listingsData, availabilityData] = await Promise.all([
        fetchJson<ListingsResponse>("/api/hostaway/listings", controller.signal),
        fetchJson<AvailabilityResponse>(
          `/api/hostaway/availability?propertyId=${encodeURIComponent(property.slug)}`,
          controller.signal,
        ),
      ]);
      const listing = listingsData.listings.find((item) => item.propertySlug === property.slug);

      if (!listing || listingsData.count !== 4) {
        throw new Error(`Expected 4 mock listings and a listing for ${property.name}.`);
      }

      setData({ listing, availability: availabilityData.availability });
      setStatus("success");
    } catch (requestError) {
      const isAbort = requestError instanceof DOMException && requestError.name === "AbortError";
      setError(isAbort ? "The mock Hostaway API took too long to respond." : requestError instanceof Error ? requestError.message : "Unable to load booking data.");
      setStatus("error");
    } finally {
      window.clearTimeout(timeout);
    }
  }, [property.name, property.slug]);

  useEffect(() => {
    void loadIntegration();
  }, [loadIntegration, requestKey]);

  if (variant === "booking") {
    if (status === "success" && data) {
      return <BookingCTA property={property} bookingUrl={data.listing.bookingUrl} />;
    }

    return (
      <ApiState
        status={status}
        booking
        error={error}
        onRetry={() => setRequestKey((key) => key + 1)}
      />
    );
  }

  return (
    <>
      <div className="hostaway-demo" id="hostaway-demo">
        <span className="integration-icon"><Icon name={status === "error" ? "close" : "check"} /></span>
        <div className="integration-copy">
          <div className="section-kicker">Hostaway-style booking integration demo</div>
          <h2>{status === "success" ? "Mock Hostaway data connected." : "Built for a seamless booking flow."}</h2>
          <p>
            This section loads listings and availability from the project&apos;s mock API routes. Real Hostaway credentials
            can later be connected securely on the server without exposing secrets in frontend code.
          </p>
        </div>
        {status === "loading" && <ApiState status="loading" />}
        {status === "error" && <ApiState status="error" error={error} onRetry={() => setRequestKey((key) => key + 1)} />}
        {status === "success" && data && (
          <>
            <div className="api-success" role="status"><Icon name="check" /> Booking data loaded from the mock Hostaway API.</div>
            <div className="integration-meta">
              <span><strong>Listing ID</strong>{data.listing.externalListingId}</span>
              <span><strong>Status</strong>{data.listing.channelStatus}</span>
              <span><strong>Mock sync</strong>{new Date(data.listing.syncedAt).toLocaleDateString("en-US")}</span>
            </div>
          </>
        )}
      </div>
      {status === "success" && data && <AvailabilitySection listing={data.listing} availability={data.availability} />}
    </>
  );
}

function ApiState({
  status,
  error,
  booking = false,
  onRetry,
}: {
  status: LoadState;
  error?: string;
  booking?: boolean;
  onRetry?: () => void;
}) {
  if (status === "error") {
    return (
      <div className={`api-state api-error ${booking ? "api-state-booking" : ""}`} role="alert">
        <span><Icon name="close" /></span>
        <div>
          <strong>Booking data could not load</strong>
          <p>{error}</p>
          {onRetry && <button onClick={onRetry}>Try again</button>}
        </div>
      </div>
    );
  }

  return (
    <div className={`api-state api-loading ${booking ? "api-state-booking" : ""}`} aria-live="polite">
      <span className="loading-spinner" />
      <div><strong>Loading booking data</strong><p>Connecting to the mock Hostaway API...</p></div>
    </div>
  );
}
