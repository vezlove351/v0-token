'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ethers } from 'ethers'
import Image from 'next/image'
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import TokenCard from '@/components/TokenCard'
import { factoryAbi } from '@/utils/abis/factoryAbi'
import { useToast } from "@/hooks/use-toast"
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCallback } from 'react'

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

interface TokenDetails {
  name: string
  symbol: string
  description: string
  creatorAddress: string
  tokenAddress: string
  fundingRaised: string
  tokenImageUrl: string
  bondingCurveProgress: number
  bondingCurveMax: number
  tokensAvailable: number
  totalTokens: number
}

interface Owner {
  owner_address: string
  percentage_relative_to_total_supply: string
}

interface Transfer {
  from_address: string
  to_address: string
  value_decimal: string
  transaction_hash: string
}

export default function TokenDetails() {
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null)
  const [owners, setOwners] = useState<Owner[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [cost, setCost] = useState('')
  const [isCostLoading, setIsCostLoading] = useState(false)
  const params = useParams()
  const address = params?.address as string
  const { toast } = useToast()

  useEffect(() => {
    const fetchTokenDetails = async () => {
      setIsLoading(true)
      setError(null)
      console.log('TokenDetails component rendered. Address:', address)

      if (!address) {
        setError('Invalid token address')
        setIsLoading(false)
        return
      }

      try {
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_REACT_APP_RPC_URL)
        const contractAddress = process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT

        if (!contractAddress) {
          throw new Error('Contract address is not defined')
        }

        const contract = new ethers.Contract(contractAddress, factoryAbi, provider)
        
        const tokenData = await contract.addressToMemeTokenMapping(address)
        
        if (!tokenData || !tokenData.name) {
          throw new Error('Token not found')
        }

        const details: TokenDetails = {
          name: tokenData.name,
          symbol: tokenData.symbol,
          description: tokenData.description,
          tokenImageUrl: isValidUrl(tokenData.tokenImageUrl) ? tokenData.tokenImageUrl : '',
          fundingRaised: ethers.formatEther(tokenData.fundingRaised),
          tokenAddress: tokenData.tokenAddress,
          creatorAddress: tokenData.creatorAddress,
          bondingCurveProgress: 0.00375,
          bondingCurveMax: 24,
          tokensAvailable: 799789,
          totalTokens: 800000
        }

        setTokenDetails(details)

        // Fetch owners data
        const ownersResponse = await fetch(
          `https://deep-index.moralis.io/api/v2.2/erc20/${address}/owners?chain=sepolia&order=DESC`,
          {
            headers: {
              accept: 'application/json',
              'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API_KEY || '',
            },
          }
        );
        const ownersData = await ownersResponse.json();
        setOwners(ownersData.result || []);

        // Fetch transfers data
        const transfersResponse = await fetch(
          `https://deep-index.moralis.io/api/v2.2/erc20/${address}/transfers?chain=sepolia&order=DESC`,
          {
            headers: {
              accept: 'application/json',
              'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API_KEY || '',
            },
          }
        );
        const transfersData = await transfersResponse.json();
        setTransfers(transfersData.result || []);


      } catch (error) {
        console.error('Error fetching token details:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch token details. Please try again.')
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch token details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (address) {
      fetchTokenDetails()
    }
  }, [address, toast])

  

  const getCost = useCallback(async () => {
    if (!purchaseAmount || !tokenDetails) return;

    setIsCostLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_REACT_APP_RPC_URL);
      const contractAddress = process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT;
      if (!contractAddress) throw new Error('Contract address is not defined');

      const contract = new ethers.Contract(contractAddress, factoryAbi, provider);
      const costInWei = await contract.calculateCost(tokenDetails.totalTokens, purchaseAmount);
      setCost(ethers.formatUnits(costInWei, 'ether'));
    } catch (error) {
      console.error('Error calculating cost:', error);
      toast({
        title: "Error",
        description: "Failed to calculate cost. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCostLoading(false);
    }
  }, [purchaseAmount, tokenDetails, toast]);

  useEffect(() => {
    if (purchaseAmount) {
      getCost();
    } else {
      setCost('');
    }
  }, [purchaseAmount, getCost]);

  const handlePurchase = async () => {
    if (!purchaseAmount || !cost) return;

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractAddress = process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT;
      if (!contractAddress) throw new Error('Contract address is not defined');

      const contract = new ethers.Contract(contractAddress, factoryAbi, signer);

      const transaction = await contract.buyMemeToken(address, purchaseAmount, {
        value: ethers.parseUnits(cost, 'ether'),
      });
      const receipt = await transaction.wait();

      toast({
        title: "Purchase Successful",
        description: `Transaction hash: ${receipt.hash}`,
      });
      
      // Reset purchase amount and cost after successful purchase
      setPurchaseAmount('');
      setCost('');
    } catch (error) {
      console.error('Error during purchase:', error);
      toast({
        title: "Error",
        description: "Failed to complete purchase. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <p className="text-center mt-24">Loading token details...</p>
  }

  if (error || !tokenDetails) {
    return <p className="text-center text-red-500">{error || 'Failed to load token details'}</p>
  }

  return (
    <>
      <Header />
      <div className="container mx-auto min-h-screen px-4 py-8 max-w-6xl">
        {/* <h1 className="text-3xl font-bold mb-8 text-center">{tokenDetails.name} Details</h1> */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
          <Card>
              <Image
                src={tokenDetails.tokenImageUrl}
                alt={tokenDetails.name}
                width={500}
                height={500}
                className="p-8 rounded-md w-full h-full object-cover"
              />
            </Card>
            <Card>
  <CardHeader>
    <CardTitle>Tokens Available for Sale</CardTitle>
  </CardHeader>
  <CardContent>
    <Progress value={(tokenDetails.tokensAvailable / tokenDetails.totalTokens) * 100} className="mb-2" />
    <p className="text-sm">
      {tokenDetails.fundingRaised.toLocaleString()} / {tokenDetails.totalTokens.toLocaleString()}
    </p>
   
  </CardContent>
</Card>
           

            
          </div>
          <div className="space-y-8">
          <TokenCard token={tokenDetails} />


            <Card>
              <CardHeader>
                <CardTitle>Bonding Curve Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={(tokenDetails.bondingCurveProgress / tokenDetails.bondingCurveMax) * 100} className="mb-2" />
                <p className="text-sm mb-4">
                  {tokenDetails.fundingRaised} / {tokenDetails.bondingCurveMax} ETH
                </p>
                <p className="text-sm text-muted-foreground">
                  When the market cap reaches {tokenDetails.bondingCurveMax} ETH, all the liquidity from the bonding curve will be deposited into Uniswap, and the LP tokens will be burned. Progression increases as the price goes up.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Buy Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Enter amount of tokens to buy"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                  />
                  {isCostLoading ? (
                    <p>Calculating cost...</p>
                  ) : cost ? (
                    <p>Cost: {cost} ETH</p>
                  ) : null}
                  <Button 
                    onClick={handlePurchase} 
                    className="w-full p-6"
                    disabled={!purchaseAmount || !cost}
                  >
                    Purchase
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Owners</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Owner Address</TableHead>
                    <TableHead>Percentage of Total Supply</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {owners.map((owner, index) => (
                    <TableRow key={index}>
                      <TableCell>{owner.owner_address}</TableCell>
                      <TableCell>{owner.percentage_relative_to_total_supply}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From Address</TableHead>
                    <TableHead>To Address</TableHead>
                    <TableHead>Value {tokenDetails.symbol}</TableHead>
                    <TableHead>Transaction Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer, index) => (
                    <TableRow key={index}>
                      <TableCell>{`${transfer.from_address.slice(0, 6)}...${transfer.from_address.slice(-4)}`}</TableCell>
                      <TableCell>{`${transfer.to_address.slice(0, 6)}...${transfer.to_address.slice(-4)}`}</TableCell>
                      <TableCell>{transfer.value_decimal}</TableCell>
                      <TableCell>
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${transfer.transaction_hash}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {transfer.transaction_hash}
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  )
}


