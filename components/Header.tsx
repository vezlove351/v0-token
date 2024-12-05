'use client'

declare global {
  interface Window {
    ethereum: any;
  }
}

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

export default function Header() {
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        setIsConnected(true)
      } catch (error) {
        console.error('Failed to connect:', error)
      }
    } else {
      alert('Please install MetaMask!')
    }
  }

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Wallet className="h-8 w-8" />
          <Link href="/">
          <span className="text-2xl font-bold">TokenFactory</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/create-token">
            <Button variant="ghost">Create Token</Button>
          </Link>
          <ThemeToggle />
          <Button onClick={handleConnect} variant={isConnected ? "outline" : "default"}>
            {isConnected ? 'Connected' : 'Connect Wallet'}
          </Button>
        </div>
      </div>
    </header>
  )
}

