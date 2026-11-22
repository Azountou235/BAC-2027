import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { NotificationPermissionModal } from '@/components/NotificationPermissionModal';

export const metadata: Metadata = {
  title: 'BAC TCHAD 2027 — Ensemble vers le BAC 2027',
  description: 'Plateforme communautaire et messagerie PWA officielle pour les candidats au Baccalauréat Tchadien 2027.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/logo.png',
    apple: '/icons/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BAC TCHAD',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0d9488',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-teal-500 selection:text-white">
        <AppProvider>
          {children}
          <NotificationPermissionModal />
        </AppProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('BAC TCHAD PWA ServiceWorker enregistré avec succès:', registration.scope);
                    },
                    function(err) {
                      console.log('Échec enregistrement ServiceWorker:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
