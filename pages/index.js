import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import abi from '../utils/Keyboards.json'
import PrimaryButton from '../components/primary-button'
import Keyboard from '../components/keyboard'
import addressesEqual from '../utils/addressesEqual'
import { UserCircleIcon } from '@heroicons/react/solid'

export default function Home() {
  const [ethereum, setEthereum] = useState(undefined)
  const [connectedAccount, setConnectedAccount] = useState(undefined)
  const [keyboards, setKeyboards] = useState([])
  const [newKeyboard, setNewKeyboard] = useState('')
  const [keyboardsLoading, setKeyboardsLoading] = useState(false)

  const contractAddress = '0x921053cE6bb08cA04Ac3ef9e29B2692A986df860'
  const contractABI = abi.abi

  const handleAccounts = (accounts) => {
    if (accounts.length > 0) {
      const account = accounts[0]
      console.log('We have an authorized / connected account: ', account)
      setConnectedAccount(account)
    } else {
      console.log('No authorized / connected accounts yet')
    }
  }

  const getConnectedAccount = async () => {
    if (window.ethereum) {
      setEthereum(window.ethereum)
    }

    if (ethereum) {
      const accounts = await ethereum.request({ method: 'eth_accounts' }) // Check with MetaMask and check for a CONNECTED wallet
      handleAccounts(accounts)
    }
  }
  useEffect(() => getConnectedAccount(), [])

  const connectAccount = async () => {
    if (!ethereum) {
      alert('MetaMask is required to connect an account')
      return
    }

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) // Open MetaMask and ask User for permission to connect their wallet
    handleAccounts(accounts)
  }

  const getKeyboards = async () => {
    if (ethereum && connectedAccount) {
      setKeyboardsLoading(true)

      try {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const keyboardsContract = new ethers.Contract(contractAddress, contractABI, signer)

        const keyboards = await keyboardsContract.getKeyboards()
        console.log('Retrieved keyboards...', keyboards)
        setKeyboards(keyboards)
      } finally {
        setKeyboardsLoading(false)
      }
    }
  }
  useEffect(() => getKeyboards(), [connectedAccount])

  if (!ethereum) {
    return <p>Please install MetaMask to connect to this site</p>
  }

  if (!connectedAccount) {
    return <PrimaryButton onClick={connectAccount}>Connect MetaMask Wallet</PrimaryButton>
  }

  if (keyboards.length > 0) {
    return (
      <div className='flex flex-col gap-4'>
        <PrimaryButton type='link' href='/create'>
          Create a Keyboard!
        </PrimaryButton>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 p-2'>
          {keyboards.map(([kind, isPBT, filter, owner], i) => (
            <div key={i} className='relative'>
              <Keyboard kind={kind} isPBT={isPBT} filter={filter} />
              <span className='absolute top-1 right-6'>
                {addressesEqual(owner, connectedAccount) ? (
                  <UserCircleIcon className='h-5 w-5 text-indigo-100' />
                ) : (
                  <button>Tip!</button>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (keyboardsLoading) {
    return (
      <div className='flex flex-col gap-4'>
        <PrimaryButton type='link' href='/create'>
          Create a Keyboard!
        </PrimaryButton>
        <p>Loading Keyboards...</p>
      </div>
    )
  }

  // No keyboards yet
  return (
    <div className='flex flex-col gap-4'>
      <PrimaryButton type='link' href='/create'>
        Create a Keyboard!
      </PrimaryButton>
      <p>No keyboards yet!</p>
    </div>
  )
}
