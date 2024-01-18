'use client'

import Head from 'next/head'
import { app } from '@/appConfig'
import { useTheme } from 'next-themes'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import React from 'react'
import { useRouter } from 'next/router'

export default function HeadGlobal() {
  const { resolvedTheme } = useTheme()

  const { state } = useCommunityContext()
  const router = useRouter()

  const { groupId, postId, topicId } = router.query
  const inCommunity = groupId || postId || topicId

  const { activeCommunity } = state

  const logoCID = activeCommunity?.community?.groupDetails?.logoCID
  const image = inCommunity ? (logoCID && `https://ipfs.io/ipfs/${logoCID}`) || app.image : app.image
  const title = inCommunity ? activeCommunity?.community?.name || app.title : app.title
  const description = inCommunity
    ? activeCommunity?.community?.groupDetails?.description || app.description
    : app.description

  return (
    <Head>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
      />

      <meta name="apple-mobile-web-app-title" content={app.name} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="application-name" content={app.name} />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content={resolvedTheme === 'dark' ? app.themeColorDark : app.themeColor} />

      <link rel="apple-touch-icon" href={app.image} />
      <link rel="icon" type="image/png" sizes="512x512" href={app.image} />

      <link rel="icon" href={app.favicon} />

      <link rel="manifest" href="/manifest.json" />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={app.name} />
      <meta property="og:url" content={app.url} />
      <meta property="og:image" content={image} />
      <meta name="description" content={description} />
      <meta name="keywords" content={app.keywords} />
      <title>{title}</title>
    </Head>
  )
}
