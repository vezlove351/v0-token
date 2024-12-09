import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MemeToken {
 name: string
 symbol: string
 description: string
 tokenImageUrl: string
 fundingRaised: string
 tokenAddress: string
 creatorAddress: string
}

export default function TokenCard({ token }: { token: MemeToken }) {
 return (
   <Link href={`/token/${token.tokenAddress}`} passHref>
     <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
       <CardContent className="p-6">
         <div className="flex items-center space-x-4 mb-4">
           <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">

          
             {token.tokenImageUrl && (
               <img src={token.tokenImageUrl} alt={token.name} className="w-full h-full object-cover" />
             )}
           </div>
           <div>
             <h3 className="text-lg font-semibold">{token.name}</h3>
             <p className="text-sm text-muted-foreground">{token.symbol}</p>
           </div>
         </div>
         <p className="text-sm mb-4 break-words line-clamp-2 hover:line-clamp-none">
  {token.description}
</p>
         <p className="text-sm mb-2">
         <span className="font-semibold">Token Address:</span> {`${token.tokenAddress.slice(0, 6)}...${token.tokenAddress.slice(-4)}`}
         </p>
         <p className="text-sm mb-4">
           <span className="font-semibold">Funding Raised:</span> {token.fundingRaised} ETH
         </p>
         <Badge variant="secondary">
           Creator: {token.creatorAddress.slice(0, 6)}...{token.creatorAddress.slice(-4)}
         </Badge>
       </CardContent>
     </Card>
   </Link>
 )
}

