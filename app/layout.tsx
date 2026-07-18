import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cinzel } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Aetheria Isle — A Cinematic Reveal',
  description:
    'A breathtaking cinematic landing experience. Watch a medieval fantasy island emerge from the morning mist, surrounded by an endless crystal-blue ocean.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f2e8d5',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} bg-background`}>
      <body className="antialiased overflow-hidden">
        {children}
        <footer className="fixed bottom-0 w-full bg-black/50 backdrop-blur-sm text-white/80 py-2 px-4 text-xs flex flex-wrap justify-between items-center z-50 font-sans">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>Team: <strong>AA-OG's</strong></span>
            <span>Code: <strong>GAM-03</strong></span>
            <span className="hidden sm:inline">Title: <strong>Interactive Open-World Game Companion App</strong></span>
          </div>
          <div className="mt-1 sm:mt-0">
            <span>Members: <strong>Govind Jindal, Aaradhya Khanna</strong></span>
          </div>
        </footer>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
