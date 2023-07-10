import { NextResponse } from 'next/server'
import { isAuthValid } from './lib/auth'
import { NextApiRequest, NextApiResponse } from 'next'

export async function middleware(request: NextApiRequest, res: NextApiResponse) {
  if (await isAuthValid(request)) {
    return NextResponse.next()
  }

  return NextResponse.rewrite(request.nextUrl.origin, { status: 401 })
}
