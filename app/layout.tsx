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
  title: '에테리아 섬 — 시네마틱 리빌',
  description:
    '숨 막힐 듯한 시네마틱 착륙 체험. 수정처럼 푸른 끝없는 바다 위로 아침 안개 속에서 중세 판타지 섬이 모습을 드러냅니다.',
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
    <html lang="ko" className={`${cinzel.variable} bg-background`}>
      <body className="antialiased overflow-hidden">
        {children}
        <footer className="fixed bottom-0 w-full bg-black/50 backdrop-blur-sm text-white/80 py-2 px-4 text-xs flex flex-wrap justify-between items-center z-50 font-sans">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>Team: <strong>AA-OG's</strong></span>
            <span>Code: <strong>GAM-03</strong></span>
            <span className="hidden sm:inline">Title: <strong>인터랙티브 오픈 월드 게임 동반 앱</strong></span>
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
