import { ethers } from 'ethers'
import { factoryAbi } from './abis/factoryAbi'

function isEthereumProvider(ethereum: unknown): ethereum is ethers.Eip1193Provider {
  return (
    typeof ethereum === 'object' &&
    ethereum !== null &&
    'request' in ethereum &&
    typeof (ethereum as { request: unknown }).request === 'function'
  )
}

export async function getContract() {
  if (typeof window !== 'undefined' && window.ethereum && isEthereumProvider(window.ethereum)) {
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contractAddress = process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT

    console.log('Contract Address in getContract:', contractAddress)

    if (!contractAddress) {
      throw new Error('Contract address is not defined')
    }
    const contract = new ethers.Contract(contractAddress, factoryAbi, signer)
    return contract
  }
  throw new Error('Please install MetaMask!')
}

export async function createMemeToken(name: string, symbol: string, description: string, imageUrl: string) {
  const contract = await getContract()
  const tx = await contract.createMemeToken(name, symbol, imageUrl, description, {
    value: ethers.parseEther('0.0001') // This is the creation fee
  })
  await tx.wait()
  return tx.hash
}

export async function getAllMemetokens() {
  const contract = await getContract()
  const tokens = await contract.getAllMemeTokens()
  return tokens
}

