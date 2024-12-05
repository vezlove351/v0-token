import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Token {
  id: number
  name: string
  symbol: string
  description: string
  address: string
  fundingRaised: number
  tags: string[]
  image: string
}

export default function TokenCard({ token }: { token: Token }) {
  return (
    <Link href={`/token/${token.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Image src={token.image} alt={token.name} width={50} height={50} className="rounded-full" />
            <div>
              <h3 className="text-lg font-semibold">{token.name}</h3>
              <p className="text-sm text-muted-foreground">{token.symbol}</p>
            </div>
          </div>
          <p className="text-sm mb-4">{token.description}</p>
          <p className="text-sm mb-2">
            <span className="font-semibold">Address:</span> {token.address}
          </p>
          <p className="text-sm mb-4">
            <span className="font-semibold">Funding Raised:</span> ${token.fundingRaised.toLocaleString()}
          </p>
          <div className="flex flex-wrap gap-2">
            {token.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

