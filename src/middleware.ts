import { NextRequest, NextResponse } from 'next/server'
import { isAuthValid } from './lib/auth'

interface Community {
  id: number
  apiKey: string
  username: string
  endpoint: string,
  readonly: boolean
}

const communityCache: Map<number, Community> = new Map()

export async function middleware(request: NextRequest, res: NextResponse) {
  /** Disable for time being */
  // if (await isAuthValid(request)) {
    const pathname = request.nextUrl.pathname

    if (pathname.startsWith('/api/discourse')) {
      const communityId = extractCommunityId(pathname)

      if (communityId) {
        let community = communityCache.get(communityId)

        if (!community) {
          try {
            const data = await fetchData()
            const communityMap: Map<number, Community> = new Map(data.communities.map(c => [c.id, c]))
            community = communityMap.get(communityId)
            if (community) {
              communityCache.set(communityId, community)
            }
          } catch (error) {
            console.error('Error fetching data:', error)
            return new NextResponse(null, { status: 500 })
          }
        }

        if (community) {
          return NextResponse.next({
            headers: {
              apiKey: community.apiKey,
              username: community.username,
              endpoint: community.endpoint,
              readonly: community.readonly
            },
          })
        }
      }
    }
    return NextResponse.next()
  // }

  // return NextResponse.rewrite(request.nextUrl.origin, { status: 401 })
}

function isNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value)
}

function extractCommunityId(path: string): number | null {
  const segments = path.split('/')
  const potentialId = +segments[3]
  return isNumber(potentialId) ? potentialId : null
}

async function fetchData(): Promise<{ communities: Community[] }> {
  const apiUrl = process.env.NEXT_PUBLIC_DISCOURSE_GOOGLE_SHEET_API_URL
  if (!apiUrl) {
    throw new Error('API URL is not set in environment variables.')
  }

  const response = await fetch(apiUrl)

  if (!response.ok) {
    throw new Error(`Failed to fetch data. Status: ${response.status}`)
  }

  return response.json()
}
