import TokenCard from './TokenCard'

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

const tokens: Token[] = [
  {
    id: 1,
    name: 'Community Token A',
    symbol: 'CTA',
    description: 'A token for community A',
    address: '0x1234...5678',
    fundingRaised: 1000000,
    tags: ['Governance', 'DeFi'],
    image: '/placeholder.svg?height=100&width=100',
  },
  {
    id: 2,
    name: 'Community Token B',
    symbol: 'CTB',
    description: 'A token for community B',
    address: '0x5678...9012',
    fundingRaised: 500000,
    tags: ['Social', 'NFT'],
    image: '/placeholder.svg?height=100&width=100',
  },
  // Add more token objects as needed
]

interface TokenGridProps {
  searchQuery: string
}

export default function TokenGrid({ searchQuery }: TokenGridProps) {
  const filteredTokens = tokens.filter((token) =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </div>
  )
}
