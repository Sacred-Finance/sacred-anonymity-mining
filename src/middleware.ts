import { NextRequest, NextResponse } from 'next/server'
import { isAuthValid } from './lib/auth'
import { isNumber } from 'lodash'

export async function middleware(request: NextRequest, res: NextResponse) {
  if (await isAuthValid(request)) {
    const pathname = request.nextUrl.pathname

    /** All the API routes for discourse middleware will be go through this */
    /** We are fetching groupId from the path and fetching the respective community @param apiKey, @param username, & @param endpoint so that it can be used for 
     * further API calls to dicource API
    */
    if (pathname.startsWith('/api/discourse')) {
      const p = pathname.split('/')
      if (p[3] && isNumber(+p[3])) {
        const data = await (await fetch(
          process.env.NEXT_PUBLIC_DISCOURSE_GOOGLE_SHEET_API_URL
        )).json()
        const communities = data.communities
        const community = communities.find(
          (community: any) => +community.id === +p[3]
        )
        return NextResponse.next({headers: {
          apiKey: community.apiKey,
          username: community.username,
          endpoint: community.endpoint
        }})
      }
    }
    return NextResponse.next()
  }

  return NextResponse.rewrite(request.nextUrl.origin, { status: 401 })
}
