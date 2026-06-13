import { notFound } from "next/navigation";
import { AvailabilitySection } from "../../components/AvailabilitySection";
import { BookingCTA } from "../../components/BookingCTA";
import { Icon } from "../../components/icons";
import { PropertyGallery } from "../../components/PropertyGallery";
import { getHostawayListingBySlug, getMockAvailability, hostawayListings } from "../../data/hostaway";
import { getProperty } from "../../data/properties";

export function generateStaticParams() {
  return hostawayListings.map(({ propertySlug }) => ({ slug: propertySlug }));
}

export default async function PropertyDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = getHostawayListingBySlug(slug);

  if (!listing) notFound();

  const property = getProperty(listing.propertySlug);
  if (!property) notFound();

  const availability = getMockAvailability(listing.id);

  return (
    <>
      <section className="property-detail-head">
        <div className="shell">
          <div>
            <div className="section-kicker">{property.eyebrow}</div>
            <h1>{property.name}</h1>
            <p>
              <Icon name="map" /> {property.location} <span>•</span> <Icon name="star" /> {property.rating} ({property.reviews} reviews)
            </p>
          </div>
          <a className="button button-outline" href="#book">Check availability</a>
        </div>
      </section>

      <div className="shell">
        <PropertyGallery images={property.images} name={property.name} />
      </div>

      <section className="section property-content">
        <div className="shell property-layout">
          <div className="property-main">
            <div className="stay-summary">
              <h2>{property.description}</h2>
              <div className="property-meta big">
                <span><Icon name="users" />{listing.maxGuests} guests</span>
                <span><Icon name="bed" />{listing.bedrooms} bedrooms</span>
                <span><Icon name="bath" />{listing.bathrooms} bathrooms</span>
              </div>
            </div>

            <div className="prose">
              <div className="section-kicker">About this home</div>
              <p>{property.longDescription}</p>
            </div>

            <div className="hostaway-demo">
              <span className="integration-icon"><Icon name="check" /></span>
              <div className="integration-copy">
                <div className="section-kicker">Hostaway-style integration demo</div>
                <h2>Built for a seamless booking flow.</h2>
                <p>
                  Mock listing, pricing, and calendar data are already connected. Real Hostaway credentials can be added securely
                  on the server for live availability and booking.
                </p>
              </div>
              <div className="integration-meta">
                <span><strong>Listing ID</strong>{listing.externalListingId}</span>
                <span><strong>Status</strong>{listing.channelStatus}</span>
                <span><strong>Mock sync</strong>{new Date(listing.syncedAt).toLocaleDateString("en-US")}</span>
              </div>
            </div>

            <AvailabilitySection listing={listing} availability={availability} />

            <div className="amenities">
              <div className="section-kicker">Everything you need</div>
              <h2>Amenities</h2>
              <div>
                {property.amenities.map((amenity) => (
                  <span key={amenity}><Icon name="check" />{amenity}</span>
                ))}
              </div>
            </div>

            <div className="highlights">
              <div className="section-kicker">Why you'll love it</div>
              {property.highlights.map((item, index) => (
                <span key={item}><b>0{index + 1}</b>{item}</span>
              ))}
            </div>
          </div>

          <BookingCTA property={property} bookingUrl={listing.bookingUrl} />
        </div>
      </section>

      <section className="map-section">
        <div className="shell">
          <div>
            <div className="section-kicker">The neighborhood</div>
            <h2>{property.location}</h2>
            <p>Exact location details are shared after booking.</p>
          </div>
          <div className="map-placeholder"><span><Icon name="map" />{property.name}</span></div>
        </div>
      </section>
    </>
  );
}
