import { useState, useEffect } from 'react'
import PrimaryButton from '../components/primary-button'

export default function Home() {
  const [ethereum, setEthereum] = useState(undefined)
  const [connectedAccount, setConnectedAccount] = useState(undefined)

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

  if (!ethereum) {
    return <p>Please install MetaMask to connect to this site</p>
  }

  if (!connectedAccount) {
    return <PrimaryButton onClick={connectAccount}>Connect MetaMask Wallet</PrimaryButton>
  }

  return <p>Connected Account: {connectedAccount}</p>
}
