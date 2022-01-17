import { ethers } from 'ethers'

import abi from '../utils/Keyboards.json'

const contractAddress = '0x8456836EDb98B9e97478C603CD6f3854D2f549a9'
const contractABI = abi.abi

export default function getKeyboardsContract(ethereum) {
  if (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    return new ethers.Contract(contractAddress, contractABI, signer)
  } else {
    return undefined
  }
}
