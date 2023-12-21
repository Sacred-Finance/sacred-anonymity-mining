import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import type { ReactNode } from 'react'

interface Props {
  show?: 'always' | 'connected' | 'disconnected'
}

export default function ConnectWallet({ show = 'always' }: Props) {
  const { isConnected } = useAccount()
  if (
    (show === 'connected' && !isConnected) ||
    (show === 'disconnected' && isConnected)
  ) {
    return null
  }
  return <ConnectButton chainStatus="none" />
}

export const ShowConnectIfNotConnected = ({
  children,
}: {
  children: ReactNode
}) => {
  const { isConnected } = useAccount()
  if (isConnected) {
    return <>{children}</>
  }
  return <ConnectWallet />
}
