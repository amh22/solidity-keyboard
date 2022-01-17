import { useState, useEffect } from 'react'
// import { ethers } from 'ethers'
// import abi from '../utils/Keyboards.json'
import getKeyboardsContract from '../utils/getKeyboardsContract'
import { toast } from 'react-hot-toast'
import PrimaryButton from '../components/primary-button'
import Keyboard from '../components/keyboard'
import addressesEqual from '../utils/addressesEqual'
import { UserCircleIcon } from '@heroicons/react/solid'
import TipButton from '../components/tip-button'

export default function Home() {
  const [ethereum, setEthereum] = useState(undefined)
  const [connectedAccount, setConnectedAccount] = useState(undefined)
  const [keyboards, setKeyboards] = useState([])
  // const [newKeyboard, setNewKeyboard] = useState('')
  const [keyboardsLoading, setKeyboardsLoading] = useState(false)

  const keyboardsContract = getKeyboardsContract(ethereum)

  // const contractAddress = '0x8456836EDb98B9e97478C603CD6f3854D2f549a9'
  // const contractABI = abi.abi

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
    if (keyboardsContract && connectedAccount) {
      setKeyboardsLoading(true)

      try {
        const keyboards = await keyboardsContract.getKeyboards()
        console.log('Retrieved keyboards...', keyboards)

        setKeyboards(keyboards)
      } finally {
        setKeyboardsLoading(false)
      }
    }
  }
  useEffect(() => getKeyboards(), [!!keyboardsContract, connectedAccount])

  const addContractEventHandlers = () => {
    if (keyboardsContract && connectedAccount) {
      keyboardsContract.on('KeyboardCreated', async (keyboard) => {
        if (connectedAccount && !addressesEqual(keyboard.owner, connectedAccount)) {
          toast('Somebody created a new keyboard!', { id: JSON.stringify(keyboard) })
        }
        await getKeyboards()
      })

      keyboardsContract.on('TipSent', (recipient, amount) => {
        if (addressesEqual(recipient, connectedAccount)) {
          toast(`You received a tip of ${ethers.utils.formatEther(amount)} eth!`, { id: recipient + amount })
        }
      })
    }
  }
  useEffect(addContractEventHandlers, [!!keyboardsContract, connectedAccount])

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
                  <TipButton ethereum={ethereum} index={i} />
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
