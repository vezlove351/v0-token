'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'


interface SearchFieldProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function SearchField({ searchQuery, setSearchQuery }: SearchFieldProps) {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="relative mb-8">
      <Input
        type="text"
        placeholder="Search tokens..."
        value={searchQuery}
        onChange={handleSearch}
        className="pl-10"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}
