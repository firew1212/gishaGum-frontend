import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link
            href="/"
            className="site-footer-logo"
          >
            Hotel Booking
          </Link>

          <p className="site-footer-description">
            Comfortable stays, simple booking,
            and a better hotel experience.
          </p>
        </div>

        <div className="site-footer-links">
          <div>
            <h2 className="site-footer-heading">
              Explore
            </h2>

            <Link href="/">
              Home
            </Link>

            <Link href="/rooms">
              Rooms
            </Link>
          </div>

          <div>
            <h2 className="site-footer-heading">
              Account
            </h2>

            <Link href="/login">
              Log in
            </Link>

            <Link href="/register">
              Create account
            </Link>
          </div>
        </div>
      </div>

      <div className="site-footer-bottom">
        <div className="site-footer-bottom-inner">
          <p>
            © {new Date().getFullYear()} Hotel Booking.
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}