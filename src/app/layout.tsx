
import type { Metadata } from 'next';

import AppShell from '@/src/components/layout/AppShell';
import AuthProvider from '@/src/components/auth/AuthProvider';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Hotel Booking',
    template: '%s | Hotel Booking',
  },
  description:
    'Discover comfortable rooms and book your hotel stay quickly and securely.',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}

