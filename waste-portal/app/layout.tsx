import type { Metadata } from 'next';
import './globals.css';
import './crystal.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageLoader from '@/components/layout/PageLoader';
import ScrollProgress from '@/components/layout/ScrollProgress';
import BackToTop from '@/components/layout/BackToTop';

export const metadata: Metadata = {
  title: 'Waste Management Excellence Portal | Re-Think Before You Acquire',
  description:
    "Leading waste management education portal covering the 5 R's, recycling processes, sustainable facilities, SDGs and environmental best practices.",
  keywords: [
    'waste management',
    '5 Rs',
    'recycling',
    'sustainability',
    'environmental',
    'SDGs',
    'zero waste',
    'circular economy',
    'eco-friendly',
  ],
  openGraph: {
    title: 'Waste Management Excellence Portal',
    description:
      'Re-Think Before You Acquire — Building a sustainable future through smart waste management.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Accessibility: skip to main content */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <ThemeProvider>
          {/* Full-screen page loader (fades after 1.5 s) */}
          <PageLoader />

          {/* Fixed top gradient progress bar */}
          <ScrollProgress />

          {/* Sticky crystal glass navigation */}
          <Navbar />

          {/* Page content */}
          <main id="main-content">
            {children}
          </main>

          {/* Site-wide footer */}
          <Footer />

          {/* Floating back-to-top button */}
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
