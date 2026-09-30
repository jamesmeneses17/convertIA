import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Toaster } from '@/components/ui/sonner';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'ConvertIA';

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} | Sistema Experto de Prompts Maestros`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    'Sistema experto que compila Prompts Maestros para generar landing pages de alta conversion en Claude, ChatGPT, Gemini o DeepSeek. Sin APIs de pago.',
  applicationName: APP_NAME,
  keywords: ['prompt engineering', 'landing page', 'CRO', 'conversion', 'Claude', 'Next.js'],
  authors: [{ name: APP_NAME }],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f6f3' },
    { media: '(prefers-color-scheme: dark)', color: '#131211' },
  ],
};

/** Evita el parpadeo de tema antes de la hidratacion. */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('convertia-theme');
    var dark = stored ? stored === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh flex flex-col">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 convertia-grid" />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster />
      </body>
    </html>
  );
}
