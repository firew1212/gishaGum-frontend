'use client';

import Link from 'next/link';

import { useAuth } from '@/src/components/auth/AuthProvider';

const hotelFeatures = [
  {
    icon: '⌂',
    title: 'Comfortable rooms',
    description:
      'Relax in thoughtfully prepared rooms designed for a pleasant stay.',
  },
  {
    icon: '✦',
    title: 'Warm hospitality',
    description:
      'Enjoy a welcoming experience with service focused on your comfort.',
  },
  {
    icon: '◉',
    title: 'Simple booking',
    description:
      'Check availability and reserve your room through a simple process.',
  },
];

const galleryImages = [
  {
    src: '/images/gishgum-hotel-exterior.jpg',
    alt: 'Gishgum Hotel exterior',
    title: 'Our Hotel',
  },
  {
    src: '/images/gishgum-hotel-room.jpg',
    alt: 'Comfortable room at Gishgum Hotel',
    title: 'Comfortable Rooms',
  },
  {
    src: '/images/gishgum-hotel-lobby.jpg',
    alt: 'Gishgum Hotel lobby',
    title: 'Welcoming Spaces',
  },
  {
    src: '/images/gishgum-hotel-restaurant.jpg',
    alt: 'Gishgum Hotel restaurant',
    title: 'Dining Experience',
  },
];

export default function HomePage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="home-page">
      {/* HERO */}
      <section className="home-hero">
        <div
          className="home-hero-background"
          aria-hidden="true"
        >
          <div className="home-hero-image" />
          <div className="home-hero-overlay" />
          <div className="home-hero-glow home-hero-glow-one" />
          <div className="home-hero-glow home-hero-glow-two" />
        </div>

        <div className="container">
          <div className="home-hero-content fade-up">
            <div className="home-hero-copy">
              <span className="home-hero-badge">
                Welcome to Gishgum Hotel
              </span>

              <h1 className="home-hero-title">
                Comfort for
                <br />
                <span>every stay.</span>
              </h1>

              <p className="home-hero-description">
                Discover comfortable accommodation and warm
                hospitality at Gishgum Hotel. Your next stay
                starts here.
              </p>

              <div className="home-hero-actions">
                <Link
                  href="/rooms"
                  className="btn btn-primary btn-lg home-hero-primary"
                >
                  Book Your Stay
                  <span aria-hidden="true">→</span>
                </Link>

                {!isLoading && !user && (
                  <Link
                    href="/register"
                    className="btn btn-secondary btn-lg home-hero-secondary"
                  >
                    Create an account
                  </Link>
                )}

                {!isLoading && user && (
                  <Link
                    href="/account"
                    className="btn btn-secondary btn-lg home-hero-secondary"
                  >
                    My account
                  </Link>
                )}
              </div>

              <div className="home-hero-trust">
                <div className="home-hero-trust-item">
                  <span>✓</span>
                  <p>Comfortable rooms</p>
                </div>

                <div className="home-hero-trust-item">
                  <span>✓</span>
                  <p>Easy reservations</p>
                </div>

                <div className="home-hero-trust-item">
                  <span>✓</span>
                  <p>Welcoming service</p>
                </div>
              </div>
            </div>

            <div
              className="home-hero-floating-card"
              aria-hidden="true"
            >
              <span className="home-floating-label">
                Gishgum Hotel
              </span>

              <strong>
                Your comfort
                <br />
                comes first.
              </strong>

              <span className="home-floating-line" />
            </div>
          </div>
        </div>

        <div
          className="home-hero-scroll"
          aria-hidden="true"
        >
          <span />
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="home-about section"
      >
        <div className="container">
          <div className="home-about-grid">
            <div className="home-about-visual">
              <div className="home-about-image">
                <img
                  src="/images/gishgum-about.jpg"
                  alt="Gishgum Hotel"
                  loading="lazy"
                />
              </div>

              <div className="home-about-badge">
                <strong>Gishgum</strong>
                <span>Hotel & Hospitality</span>
              </div>
            </div>

            <div className="home-about-copy fade-up">
              <span className="badge badge-primary">
                About Gishgum Hotel
              </span>

              <p className="home-section-kicker">
                A place to feel at home
              </p>

              <h2 className="heading-lg">
                A welcoming stay,
                <br />
                thoughtfully prepared.
              </h2>

              <p className="text-lead">
                Gishgum Hotel offers a comfortable place to
                relax, rest, and enjoy your time away from home.
              </p>

              <p className="home-about-description">
                Whether you are travelling for business,
                visiting family, or enjoying a personal trip,
                our goal is to make your stay convenient,
                comfortable, and memorable.
              </p>

              <Link
                href="/rooms"
                className="home-text-link"
              >
                Explore our rooms
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-features section">
        <div className="container">
          <div className="home-section-heading">
            <div>
              <p className="text-primary">
                The Gishgum experience
              </p>

              <h2 className="heading-lg">
                Everything you need
                <br />
                for a pleasant stay.
              </h2>
            </div>

            <p className="text-muted">
              A simple hotel experience, from choosing your
              room to completing your reservation.
            </p>
          </div>

          <div className="home-feature-grid">
            {hotelFeatures.map((feature, index) => (
              <article
                key={feature.title}
                className="home-feature-card fade-up"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="home-feature-icon">
                  <span aria-hidden="true">
                    {feature.icon}
                  </span>
                </div>

                <span className="home-feature-number">
                  0{index + 1}
                </span>

                <h3>{feature.title}</h3>

                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section
        id="gallery"
        className="home-gallery section"
      >
        <div className="container">
          <div className="home-section-heading">
            <div>
              <p className="text-primary">
                Discover Gishgum Hotel
              </p>

              <h2 className="heading-lg">
                A glimpse of
                <br />
                your next stay.
              </h2>
            </div>

            <p className="text-muted">
              Explore our spaces and discover the atmosphere
              waiting for you.
            </p>
          </div>

          <div className="home-gallery-grid">
            {galleryImages.map((image, index) => (
              <Link
                key={image.src}
                href="/rooms"
                className={`home-gallery-item home-gallery-item-${index + 1}`}
                aria-label={`${image.title}. Explore rooms.`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                />

                <div className="home-gallery-overlay">
                  <span>{image.title}</span>
                  <strong aria-hidden="true">↗</strong>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ROOM CTA */}
      <section className="home-room-cta section">
        <div className="container">
          <div className="home-room-cta-card">
            <div className="home-room-cta-content">
              <span className="badge badge-primary">
                Find your room
              </span>

              <h2 className="heading-lg">
                Find a room that
                <br />
                feels right for you.
              </h2>

              <p className="text-muted">
                Explore available rooms, compare your options,
                and choose the accommodation that fits your stay.
              </p>

              <Link
                href="/rooms"
                className="btn btn-primary btn-lg"
              >
                Explore Rooms
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div
              className="home-room-cta-decoration"
              aria-hidden="true"
            >
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="home-final-cta">
        <div className="container">
          <div className="home-final-cta-content fade-up">
            <span className="home-final-cta-mark">
              G
            </span>

            <p className="home-section-kicker">
              Gishgum Hotel
            </p>

            <h2>
              Your next stay
              <br />
              starts here.
            </h2>

            <p>
              Choose your room and make your reservation today.
            </p>

            <Link
              href="/rooms"
              className="btn btn-primary btn-lg"
            >
              Book Your Stay
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}