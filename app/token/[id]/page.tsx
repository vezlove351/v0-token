import Image from 'next/image'
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BuyTokenForm from '@/components/BuyTokenForm'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// This would typically come from an API or database
const tokenDetails = {
  id: 1,
  name: 'Community Token A',
  symbol: 'CTA',
  description: 'A token for community A with advanced features and strong community support.',
  creatorAddress: '0x1234...5678',
  tokenAddress: '0xabcd...efgh',
  fundingRaised: 1000000,
  image: '/placeholder.svg?height=300&width=300',
  bondingCurveProgress: 0.00375,
  bondingCurveMax: 24,
  tokensAvailable: 799789,
  totalTokens: 800000
}

export default function TokenDetails({ params }: { params: { id: string } }) {
  return (
    <>
    <Header />
    
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">{tokenDetails.name} Details</h1>
      <div className="grid md:grid-cols-2 gap-8">

        <div>
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-center mb-6">
                <Image 
                  src={tokenDetails.image}
                  alt={tokenDetails.name} 
                  width={300} 
                  height={300} 
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Creator Address:</h3>
                  <p className="text-sm">{tokenDetails.creatorAddress}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Token Address:</h3>
                  <p className="text-sm">{tokenDetails.tokenAddress}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Funding Raised:</h3>
                  <p className="text-sm">${tokenDetails.fundingRaised.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Token Symbol:</h3>
                  <p className="text-sm">{tokenDetails.symbol}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Description:</h3>
                  <p className="text-sm">{tokenDetails.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Bonding Curve Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(tokenDetails.bondingCurveProgress / tokenDetails.bondingCurveMax) * 100} className="mb-2" />
              <p className="text-sm mb-4">
                {tokenDetails.bondingCurveProgress} / {tokenDetails.bondingCurveMax} ETH
              </p>
              <p className="text-sm text-muted-foreground">
                When the market cap reaches {tokenDetails.bondingCurveMax} ETH, all the liquidity from the bonding curve will be deposited into Uniswap, and the LP tokens will be burned. Progression increases as the price goes up.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tokens Available for Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(tokenDetails.tokensAvailable / tokenDetails.totalTokens) * 100} className="mb-2" />
              <p className="text-sm">
                {tokenDetails.tokensAvailable.toLocaleString()} / {tokenDetails.totalTokens.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buy Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <BuyTokenForm />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
    <Footer />
    </>
  )
}

