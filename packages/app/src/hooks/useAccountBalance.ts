import { useEffect, useState } from 'react'
import { account, DEFAULT_EMPTY_ADDRESS } from '@senswap/sen-js'
import { BN } from '@project-serum/anchor'
import {
  useAccount,
  useMintDecimals,
  useWallet,
  useWalletAddress,
} from '@sentre/senhub'
import { utilsBN } from '@sen-use/web3'

export type AccountBalanceReturn = {
  amount: BN
  decimals: number
  balance: number
  mintAddress: string
}

const buildResult = (mintAddress?: string, amount?: BN, decimals?: number) => {
  if (
    !account.isAddress(mintAddress) ||
    amount === undefined ||
    decimals === undefined
  )
    return { amount: new BN(0), decimals: 0, balance: 0 }
  return {
    mintAddress,
    amount,
    decimals,
    balance: Number(utilsBN.undecimalize(amount, decimals)),
  }
}

/**
 * Get account balance. This hook needs WalletProvider, MintProvider, and AccountProvider for working.
 * WalletProvider Ref: https://docs.sentre.io/senhub/development/providers/wallet-provider
 * MintProvider Ref: https://docs.sentre.io/senhub/development/providers/mint-provider
 * AccountProvider Ref: https://docs.sentre.io/senhub/development/providers/account-provider
 * @param accountAddress Associated account address
 * @returns AccountBalanceReturn
 * - AccountBalanceReturn.amount: The amount with decimals
 * - AccountBalanceReturn.decimals: The corresponding mint decimals
 * - AccountBalanceReturn.balance: The human-readable balance (undecimalized amount)
 * - AccountBalanceReturn.mintAddress: The corresponding mint
 */
export const useAccountBalance = (accountAddress: string) => {
  const {
    wallet: { lamports },
  } = useWallet()
  const walletAddress = useWalletAddress()
  const { accounts } = useAccount()
  const { amount, mint: mintAddress } = accounts[accountAddress] || {}
  const decimals = useMintDecimals({ mintAddress }) || 0

  if (!account.isAddress(walletAddress) || !account.isAddress(accountAddress))
    return buildResult()
  if (accountAddress === walletAddress)
    return buildResult(DEFAULT_EMPTY_ADDRESS, new BN(lamports.toString()), 9)

  return buildResult(mintAddress, new BN(amount.toString()), decimals)
}

/**
 * The same as useAccountBalance but the input is mint address
 * @param mintAddress Mint address
 * @returns AccountBalanceReturn
 */
export const useAccountBalanceByMintAddress = (mintAddress: string) => {
  const [accountAddress, setAccountAddress] = useState('')
  const {
    wallet: { address: walletAddress },
  } = useWallet()
  const data = useAccountBalance(accountAddress)

  useEffect(() => {
    ;(async () => {
      if (!account.isAddress(walletAddress) || !account.isAddress(mintAddress))
        return setAccountAddress('')
      const {
        sentre: { splt },
      } = window
      try {
        const address = await splt.deriveAssociatedAddress(
          walletAddress,
          mintAddress,
        )
        return setAccountAddress(address)
      } catch (er) {
        return setAccountAddress('')
      }
    })()
  })

  return data
}