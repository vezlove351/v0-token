import TokenCreationForm from '@/components/TokenCreationForm'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CreateToken() {
  return (
    <>
    <Header />
    <div className="container min-h-screen mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Create New MemeToken</h1>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <p className="mb-2 text-md"><strong>MemeCoin creation fee:</strong> 0.0001 ETH</p>
          <p className="mb-2 text-md"><strong>Max supply:</strong> 1M tokens. <strong>Initial mint:</strong> 200K tokens.</p>
          <p className="text-sm mt-6">If funding target of 24 ETH is met, a liquidity pool will be created on Uniswap.</p>
        </div>
        <TokenCreationForm />
      </div>
    </div>
    <Footer />
    </>
    
  )
}

