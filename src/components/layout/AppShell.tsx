import type { ReactNode } from 'react';

import Header from './Header';
import Footer from './Footer';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps) {
  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">
        {children}
      </main>

      <Footer />
    </div>
  );
}