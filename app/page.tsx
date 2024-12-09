'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SearchField from '@/components/SearchField'
import TokenGrid from '@/components/TokenGrid'
import { factoryAbi } from '@/utils/abis/factoryAbi'
import { useToast } from "@/hooks/use-toast"


interface RawMemeToken {
  name: string;
  symbol: string;
  description: string;
  tokenImageUrl: string;
  fundingRaised: bigint;
  tokenAddress: string;
  creatorAddress: string;
}

interface MemeToken {
  name: string
  symbol: string
  description: string
  tokenImageUrl: string
  fundingRaised: string
  tokenAddress: string
  creatorAddress: string
}

export default function Home() {
  const [tokens, setTokens] = useState<MemeToken[]>([])
  const [filteredTokens, setFilteredTokens] = useState<MemeToken[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMemeTokens = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_REACT_APP_RPC_URL)
        const contractAddress = process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT

        if (!contractAddress) {
          throw new Error('Contract address is not defined')
        }

        console.log('Connecting to contract at:', contractAddress)
        const contract = new ethers.Contract(contractAddress, factoryAbi, provider)
        
        console.log('Calling getAllMemeTokens...')
        const memeTokens = await contract.getAllMemeTokens()
        console.log('Received meme tokens:', memeTokens)

        const formattedTokens = memeTokens.map((token: RawMemeToken) => ({
          name: token.name,
          symbol: token.symbol,
          description: token.description,
          tokenImageUrl: token.tokenImageUrl,
          fundingRaised: ethers.formatEther(token.fundingRaised),
          tokenAddress: token.tokenAddress,
          creatorAddress: token.creatorAddress
        }))

        setTokens(formattedTokens)
        setFilteredTokens(formattedTokens)
      } catch (error: unknown) {
        console.error('Error fetching meme tokens:', error)
        let errorMessage = 'Failed to fetch meme tokens. Please try again.'
        if (error instanceof Error) {
          errorMessage += ` Error: ${error.message}`
        }
        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMemeTokens()
  }, [toast])

  useEffect(() => {
    const filtered = tokens.filter((token) => 
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredTokens(filtered)
  }, [searchTerm, tokens])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-8">Explore Community Tokens</h1>
        <SearchField onSearch={handleSearch} />
        {isLoading ? (
          <p className="text-center">Loading tokens...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <TokenGrid tokens={filteredTokens} />
        )}
      </main>
      <Footer />
    </div>
  )
}