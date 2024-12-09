'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { factoryAbi } from '@/utils/abis/factoryAbi'
import { useToast } from "@/hooks/use-toast"

interface BuyTokenFormProps {
  tokenAddress: string
  totalSupply: string
}

export default function BuyTokenForm({ tokenAddress, totalSupply }: BuyTokenFormProps) {
  const [amount, setAmount] = useState('')
  const [cost, setCost] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const getCost = async () => {
    if (!amount) return

    setIsLoading(true)
    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_REACT_APP_RPC_URL)
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT!, factoryAbi, provider)
      const costInWei = await contract.calculateCost(totalSupply, amount)
      setCost(ethers.formatUnits(costInWei, 'ether'))
    } catch (error) {
      console.error('Error calculating cost:', error)
      toast({
        title: "Error",
        description: "Failed to calculate cost. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (amount) {
      getCost()
    } else {
      setCost('')
    }
  }, [amount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !cost) return

    setIsLoading(true)
    try {
      if (!window.ethereum) throw new Error("No crypto wallet found");
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT!, factoryAbi, signer)

      const transaction = await contract.buyMemeToken(tokenAddress, amount, {
        value: ethers.parseUnits(cost, 'ether'),
      })
      const receipt = await transaction.wait()

      toast({
        title: "Purchase Successful",
        description: `Transaction Hash: ${receipt.hash}`,
      })
      setAmount('')
      setCost('')
        // Redirect to home page
        router.push('/')
    } catch (error) {
      console.error('Error during purchase:', error)
      toast({
        title: "Error",
        description: "Failed to complete purchase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="number"
          placeholder="Enter amount of tokens"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      {cost && (
        <div className="text-sm">
          Cost: {cost} ETH
        </div>
      )}
      <Button type="submit" className="w-full" disabled={!amount || !cost || isLoading}>
        {isLoading ? 'Processing...' : 'Buy Tokens'}
      </Button>
    </form>
  )
}

