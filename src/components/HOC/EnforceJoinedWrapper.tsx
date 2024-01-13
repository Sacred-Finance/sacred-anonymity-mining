import React from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shad/ui/card'
import { useUserIfJoined } from '@/contexts/UseUserIfJoined'

const EnforceJoinedWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative">
      {children}
      {/*{!isConnected && (*/}
      {/*  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70">*/}
      {/*    <Card>*/}
      {/*      <CardHeader>*/}
      {/*        <CardTitle>Connect Wallet</CardTitle>*/}
      {/*      </CardHeader>*/}
      {/*      <CardContent className="mb-4 text-gray-400">*/}
      {/*        Connect your wallet to access this feature. <br />*/}
      {/*      </CardContent>*/}
      {/*      <CardFooter>*/}
      {/*        <ConnectButton />*/}
      {/*      </CardFooter>*/}
      {/*    </Card>*/}
      {/*  </div>*/}
      {/*)}*/}
    </div>
  )
}

export default EnforceJoinedWrapper
