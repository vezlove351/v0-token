'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'
import SearchField from '../components/SearchField'
import TokenGrid from '../components/TokenGrid'
import { useState } from 'react'



export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('') // Указываем тип string

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-8">Explore Community Tokens</h1>
        <SearchField searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <TokenGrid searchQuery={searchQuery} />
      </main>
      <Footer />
    </div>
  )
}

