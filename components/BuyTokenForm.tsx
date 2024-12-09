'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers, formatUnits, parseEther } from 'ethers'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { factoryAbi } from '@/utils/abis/factoryAbi'
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

interface BuyTokenFormProps {
  tokenAddress: string
  totalSupply: string
}

type ErrorWithCode = Error & { code?: number };

const PREDEFINED_AMOUNTS = [
  { value: '0.003', label: '0.003 ETH' },
  { value: '0.03', label: '0.03 ETH' },
  { value: '0.3', label: '0.3 ETH' },
];

const INITIAL_TOKEN_AMOUNT = '200';

export default function BuyTokenForm({ tokenAddress, totalSupply }: BuyTokenFormProps) {
  const [amount, setAmount] = useState(INITIAL_TOKEN_AMOUNT)
  const [cost, setCost] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const getCost = useCallback(async (tokenAmount: string) => {
    if (!tokenAmount) return

    setIsLoading(true)
    setError(null)
    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_REACT_APP_RPC_URL)
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT!, factoryAbi, provider)
      const costInWei = await contract.calculateCost(totalSupply, tokenAmount)
      setCost(formatUnits(costInWei, 'ether'))
    } catch (error) {
      console.error('Error calculating cost:', error)
      setError("Failed to calculate cost. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [totalSupply])

  useEffect(() => {
    getCost(amount)
  }, [amount, getCost])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
  }

  const handleEthAmountSelect = (ethValue: string) => {
    setIsLoading(true)
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_REACT_APP_RPC_URL)
    const contract = new ethers.Contract(process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT!, factoryAbi, provider)
    
    contract.calculateTokenAmount(totalSupply, parseEther(ethValue))
      .then((tokenAmount: bigint) => {
        setAmount(tokenAmount.toString())
        setIsLoading(false)
      })
      .catch((error: Error) => {
        console.error('Error calculating token amount:', error)
        setError("Failed to calculate token amount. Please try again.")
        setIsLoading(false)
      })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !cost) return

    setIsLoading(true)
    setError(null)
    try {
      if (!window.ethereum) throw new Error("No crypto wallet found. Please install MetaMask.")
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT!, factoryAbi, signer)

      const transaction = await contract.buyMemeToken(tokenAddress, amount, {
        value: parseEther(cost),
      })
      const receipt = await transaction.wait()

      toast({
        title: "Purchase Successful",
        description: `Transaction Hash: ${receipt.hash}`,
      })
      setAmount(INITIAL_TOKEN_AMOUNT)
      setCost('')
      router.push('/')
    } catch (error: unknown) {
      console.error('Error during purchase:', error)
      let errorMessage = "Failed to complete purchase. Please try again."

      if (error instanceof Error) {
        const ethersError = error as ErrorWithCode;
        if (ethersError.code === 4001) {
          errorMessage = "Transaction rejected. Please try again if you want to complete the purchase."
        } else if (ethersError.code === -32603) {
          errorMessage = "Internal JSON-RPC error. Please check your wallet connection and try again."
        } else if (ethersError.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds in your wallet. Please add more ETH to complete this transaction."
        }
      }

      setError(errorMessage)
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
          onChange={handleAmountChange}
          required
        />
      </div>
      <div className="flex gap-2 mt-2">
        {PREDEFINED_AMOUNTS.map((predefAmount) => (
          <Badge
            key={predefAmount.value}
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
            onClick={() => handleEthAmountSelect(predefAmount.value)}
          >
            {predefAmount.label}
          </Badge>
        ))}
      </div>
      {cost && (
        <div className="text-sm text-muted-foreground">
          Cost: {parseFloat(cost).toFixed(18)} ETH
        </div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="w-full" disabled={!amount || !cost || isLoading}>
        {isLoading ? 'Processing...' : 'Buy Tokens'}
      </Button>
    </form>
  )
}

