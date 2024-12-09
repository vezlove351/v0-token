import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers'
import './globals.css'
import { ThirdwebProvider } from "thirdweb/react";


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TokenExplorer',
  description: 'Explore and create community tokens',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThirdwebProvider>
<html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
    </ThirdwebProvider>
     
  )
}

