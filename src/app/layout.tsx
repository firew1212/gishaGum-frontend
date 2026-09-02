import type { Metadata } from 'next';

import { AuthProvider } from '@/src/context/AuthContext';

import './globals.css';

export const metadata: Metadata = {
  title: 'Hotel Booking',
  description: 'Hotel Booking System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}