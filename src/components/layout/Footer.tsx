import Link from "next/link";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "About", href: "/#about" },
  { label: "Gallery", href: "/#gallery" },
];

const accountLinks = [
  { label: "Log in", href: "/login" },
  { label: "Create account", href: "/register" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="container">
          <div className="site-footer-grid">
            {/* Brand */}
            <div className="site-footer-brand">
              <Link
                href="/"
                className="site-footer-logo"
                aria-label="Gishgum Hotel home"
              >
                <span className="site-footer-logo-mark" aria-hidden="true">
                  G
                </span>

                <span className="site-footer-logo-text">
                  <strong>GISHGUM</strong>
                  <small>HOTEL</small>
                </span>
              </Link>

              <p className="site-footer-description">
                More than a stay. A welcoming place where comfort, hospitality,
                and memorable moments come together.
              </p>

              <div className="site-footer-socials">
                <a
                  href="#"
                  className="site-footer-social"
                  aria-label="Facebook"
                >
                  f
                </a>

                <a
                  href="#"
                  className="site-footer-social"
                  aria-label="Instagram"
                >
                  ◎
                </a>

                <a
                  href="#"
                  className="site-footer-social"
                  aria-label="Telegram"
                >
                  ↗
                </a>
              </div>
            </div>

            {/* Explore */}
            <div className="site-footer-column">
              <h2 className="site-footer-heading">Explore</h2>

              <nav className="site-footer-link-list" aria-label="Explore links">
                {exploreLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Account */}
            <div className="site-footer-column">
              <h2 className="site-footer-heading">Account</h2>

              <nav className="site-footer-link-list" aria-label="Account links">
                {accountLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact */}
            <div className="site-footer-column">
              <h2 className="site-footer-heading">Contact Us</h2>

              <div className="site-footer-contact">
                <a href="tel:+251911234567">
                  <span aria-hidden="true">☎</span>
                  <span>+251 911 234 567</span>
                </a>

                <a href="mailto:info@gishgumhotel.com">
                  <span aria-hidden="true">✉</span>
                  <span>info@gishgumhotel.com</span>
                </a>

                <span>
                  <span aria-hidden="true">⌖</span>
                  <span>Address, Ethiopia</span>
                </span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="site-footer-column site-footer-newsletter">
              <h2 className="site-footer-heading">Stay Connected</h2>

              <p>Receive hotel updates and special offers.</p>

              <form className="site-footer-newsletter-form">
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>

                <input
                  id="footer-email"
                  type="email"
                  placeholder="Your email address"
                  aria-label="Your email address"
                />

                <button type="submit" aria-label="Subscribe to newsletter">
                  →
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="site-footer-bottom">
        <div className="container site-footer-bottom-inner">
          <p>© {currentYear} Gishgum Hotel. All rights reserved.</p>

          <div className="site-footer-bottom-links">
            <Link href="/privacy">Privacy Policy</Link>

            <Link href="/terms">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
