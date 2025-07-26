// app/layout.tsx
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ReactNode } from 'react'

export const metadata = {
  title: 'AI-Powered Scam Email Detection and Engagement',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className="dark" lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
