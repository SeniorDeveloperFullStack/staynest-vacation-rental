import type { HostawayAvailabilityNight, HostawayListing } from "../data/hostaway";
import { Icon } from "./icons";

export function AvailabilitySection({
  listing,
  availability,
}: {
  listing: HostawayListing;
  availability: HostawayAvailabilityNight[];
}) {
  const availableCount = availability.filter((night) => night.isAvailable).length;

  return (
    <section className="availability-section">
      <div className="section-kicker">Live-ready calendar</div>
      <div className="availability-head">
        <div>
          <h2>Availability preview</h2>
          <p>
            Mock rates and calendar status for Hostaway listing <strong>{listing.externalListingId}</strong>.
          </p>
        </div>
        <span className="availability-pill">
          <Icon name="calendar" />
          {availableCount} of {availability.length} sample nights open
        </span>
      </div>
      <div className="availability-grid">
        {availability.map((night) => (
          <article className={night.isAvailable ? "night-card available" : "night-card blocked"} key={night.date}>
            <span>{new Date(`${night.date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            <strong>{night.isAvailable ? "Available" : "Booked"}</strong>
            <p>${night.nightlyRate} · {night.minimumStay} night min</p>
          </article>
        ))}
      </div>
    </section>
  );
}
