"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/src/components/auth/AuthProvider";
import {
  getRooms,
  type Room,
} from "@/src/lib/rooms-api";
import { formatPrice, getRoomImage } from "@/src/lib/room-utils";

const experiences = [
  {
    number: "01",
    icon: "▱",
    title: "Comfortable Stay",
    description: "Rest in welcoming spaces prepared for your comfort.",
  },
  {
    number: "02",
    icon: "♨",
    title: "Delicious Dining",
    description: "Enjoy fresh meals and a warm dining atmosphere.",
  },
  {
    number: "03",
    icon: "⌖",
    title: "Great Location",
    description: "Stay connected to the places that matter.",
  },
  {
    number: "04",
    icon: "♡",
    title: "Friendly Service",
    description: "Experience hospitality that feels personal.",
  },
];

const galleryImages = [
  {
    image: "/images/gishgum-hotel-exterior.jpg",
    title: "The Hotel",
  },
  {
    image: "/images/gishgum-hotel-lobby.jpg",
    title: "Welcoming Spaces",
  },
  {
    image: "/images/gishgum-hotel-room.jpg",
    title: "Comfortable Rooms",
  },
  {
    image: "/images/gishgum-hotel-restaurant.jpg",
    title: "Dining Experience",
  },
];

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadRooms() {
      try {
        const data = await getRooms();

        if (mounted) {
          setRooms(data.slice(0, 4));
        }
      } catch (error) {
        if (mounted) {
          setRoomsError(
            error instanceof Error
              ? error.message
              : 'Unable to load rooms.',
          );
        }
      } finally {
        if (mounted) {
          setRoomsLoading(false);
        }
      }
    }

    loadRooms();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="home-page">
      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-background" aria-hidden="true">
          <div className="home-hero-image" />
          <div className="home-hero-overlay" />
        </div>

        <div className="container">
          <div className="home-hero-content">
            <div className="home-hero-copy">
              <span className="home-hero-badge">WELCOME TO GISHGUM HOTEL</span>

              <h1 className="home-hero-title">
                ግሻጉም
                <br />
                <span>HOTEL</span>
              </h1>

              <p className="home-hero-description">
                WE provide  modern comfort, and unforgettable
                moments in the heart of Ethiopia injibara.
              </p>

              <div className="home-hero-actions">
                <Link
                  href="#rooms"
                  className="btn btn-primary btn-lg home-hero-primary"
                >
                  Explore Our Rooms
                  <span aria-hidden="true">→</span>
                </Link>

                {!isLoading && !user && (
                  <Link href="/register" className="home-hero-text-link">
                    Create an account
                    <span aria-hidden="true">↗</span>
                  </Link>
                )}

                {!isLoading && user && (
                  <Link href="/account" className="home-hero-text-link">
                    My account
                    <span aria-hidden="true">↗</span>
                  </Link>
                )}
              </div>

              <div className="home-hero-trust">
                <span>Comfortable rooms</span>
                <span>Warm hospitality</span>
                <span>Easy reservations</span>
              </div>
            </div>

            <div className="home-hero-story" aria-hidden="true">
              <span className="home-hero-story-active">01</span>
              <span>Arrival</span>

              <span>02</span>
              <span>Rooms</span>

              <span>03</span>
              <span>Dining</span>

              <span>04</span>
              <span>Experience</span>
            </div>
          </div>
        </div>

        <div className="home-hero-scroll" aria-hidden="true">
          <span />
          Scroll to explore
        </div>
      </section>

      {/* SIGNATURE MOMENTS */}
      <section className="home-signature-section">
        <div className="container">
          <div className="home-signature-intro">
            <span className="home-section-kicker">THE GISHGUM EXPERIENCE</span>
            <h2 className="home-editorial-heading">
              A stay shaped around your rhythm.
            </h2>
            <p>
              Slow mornings, considered spaces, and warm Ethiopian hospitality come together in every detail.
            </p>
          </div>

          <div className="home-signature-grid">
            <Link href="#rooms" className="home-signature-card home-signature-card-tall">
              <img src="/images/gishgum-hotel-room.jpg" alt="A calm Gishgum Hotel room" loading="lazy" />
              <span>01 / Stay</span>
              <strong>Rooms made for deep rest</strong>
            </Link>
            <Link href="#gallery" className="home-signature-card">
              <img src="/images/gishgum-hotel-restaurant.jpg" alt="Gishgum Hotel dining" loading="lazy" />
              <span>02 / Taste</span>
              <strong>Gather around the table</strong>
            </Link>
            <Link href="#about" className="home-signature-card">
              <img src="/images/gishgum-hotel-lobby.jpg" alt="Gishgum Hotel lobby" loading="lazy" />
              <span>03 / Belong</span>
              <strong>Feel instantly at home</strong>
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="home-about section">
        <div className="container">
          <div className="home-about-grid">
            <div className="home-about-copy">
              <span className="home-section-kicker">ABOUT GISHGUM HOTEL</span>

              <h2 className="home-editorial-heading">
                
                 We care about your comfort !
              </h2>

              <p className="home-about-lead">
                Gishgum Hotel is more than a place to stay. It is a place where
                comfort meets warm, thoughtful hospitality.
              </p>

              <p className="home-about-description">
                Whether you are travelling for business, visiting family, or
                enjoying a personal trip, we are dedicated to making your stay
                convenient, comfortable, and memorable.
              </p>

              <Link href="#rooms" className="home-text-link">
                Discover our rooms
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="home-about-visual">
              <img
                src="/images/gishgum-hotel-lobby.jpg"
                alt="Gishgum Hotel welcoming lobby"
                loading="lazy"
              />

              <div className="home-about-image-label">
                <span>GISHGUM</span>
                <strong>Hotel & Restorant</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROOMS */}
      <section id="rooms" className="home-rooms section">
        <div className="container">
          <div className="home-section-heading">
            <div>
              <span className="home-section-kicker">OUR ROOMS</span>

              <h2 className="home-editorial-heading">
                Our rooms 
              </h2>
            </div>

            <Link href="/rooms" className="home-text-link">
              View all rooms
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {roomsLoading && (
            <div className="home-rooms-state" aria-live="polite">
              <span className="spinner" aria-hidden="true" />
              <p>Discovering available rooms...</p>
            </div>
          )}

          {!roomsLoading && roomsError && (
            <div className="home-rooms-state" role="alert">
              <p>{roomsError}</p>
              <Link href="/rooms" className="home-text-link">
                View all rooms <span aria-hidden="true">→</span>
              </Link>
            </div>
          )}

          {!roomsLoading && !roomsError && rooms.length === 0 && (
            <div className="home-rooms-state">
              <p>No rooms are currently available.</p>
            </div>
          )}

          {!roomsLoading && !roomsError && rooms.length > 0 && (
            <div className="home-room-grid">
              {rooms.map((room, index) => {
                const image = getRoomImage(room.roomType.images);

                return (
                  <Link key={room.id} href={`/rooms/${room.id}`} className="home-room-card">
                    <div className="home-room-image">
                      {image ? (
                        <img src={image} alt={`${room.roomType.name} room`} loading="lazy" />
                      ) : (
                        <div className="home-room-placeholder">No image available</div>
                      )}

                      <span className="home-room-number">0{index + 1}</span>
                    </div>

                    <div className="home-room-content">
                      <h3>{room.roomType.name}</h3>
                      <p>{room.roomType.description ?? `Room ${room.roomNumber} on floor ${room.floor}.`}</p>

                      <div className="home-room-bottom">
                        <span>
                          From <strong>{formatPrice(room.roomType.price)}</strong> / night
                        </span>

                        <span aria-hidden="true">↗</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* EXPERIENCE STRIP */}
      <section className="home-experience">
        <div className="container">
          <div className="home-experience-grid">
            {experiences.map((experience) => (
              <div key={experience.number} className="home-experience-item">
                <span className="home-experience-icon">{experience.icon}</span>

                <span className="home-experience-number">
                  {experience.number}
                </span>

                <h3>{experience.title}</h3>
                <p>{experience.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="home-gallery section">
        <div className="container">
          <div className="home-section-heading">
            <div>
              <span className="home-section-kicker">GALLERY</span>

              <h2 className="home-editorial-heading">
                Moments at
                <br />
                Gishgum Hotel.
              </h2>
            </div>

            <Link href="/rooms" className="home-text-link">
              View full gallery
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="home-gallery-grid">
            {galleryImages.map((image, index) => (
              <Link
                key={image.image}
                href="/rooms"
                className={`home-gallery-item home-gallery-item-${index + 1}`}
              >
                <img src={image.image} alt={image.title} loading="lazy" />

                <div className="home-gallery-overlay">
                  <span>{image.title}</span>
                  <strong aria-hidden="true">↗</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="home-final-cta">
        <div className="home-final-cta-background" />

        <div className="container">
          <div className="home-final-cta-content">
            <span className="home-section-kicker">YOUR NEXT STAY</span>

            <h2>
              ማረፍ ዪፈልጋሉ ?
            </h2>

            <p>እንግዲያዉስ ክፍልወን ዪምረቱ </p>

            <Link href="/rooms" className="btn btn-primary btn-lg">
              Book Your Stay
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
