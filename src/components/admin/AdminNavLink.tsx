'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface AdminNavLinkProps {
  href: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
  onNavigate?: () => void;
}

export default function AdminNavLink({
  href,
  label,
  icon,
  exact = false,
  onNavigate,
}: AdminNavLinkProps) {
  const pathname = usePathname();

  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`admin-nav-link ${isActive ? 'admin-nav-link-active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
      onClick={onNavigate}
    >
      <span className="admin-nav-link-icon" aria-hidden="true">
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}