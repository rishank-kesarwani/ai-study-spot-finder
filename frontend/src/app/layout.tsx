import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { LoginRequiredModal } from '../components/auth/LoginRequiredModal';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://study-spot.rishankkesarwani.com',
  ),
  title: 'StudySphere AI — Intelligent Study Spot & Focus Finder',
  description:
    'Autonomous AI Study Spot Intelligence. Discover quiet reading rooms, high-speed WiFi cafes, and late-night workspaces engineered for deep work and scholarly focus.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'StudySphere AI — Intelligent Study Spot & Focus Finder',
    description:
      'Autonomous AI Study Spot Intelligence. Discover quiet reading rooms, high-speed WiFi cafes, and late-night workspaces.',
    type: 'website',
    images: [{ url: '/logo.svg', width: 512, height: 512, alt: 'StudySphere AI' }],
  },
  keywords: [
    'study spots',
    'cafes with wifi',
    'quiet libraries',
    'coworking spaces',
    'deep work',
    'thesis writing',
    'power outlets',
    'AI concierge',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-slate-100 antialiased min-h-screen flex flex-col font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <Footer />
          <LoginRequiredModal />
        </AuthProvider>
      </body>
    </html>
  );
}
