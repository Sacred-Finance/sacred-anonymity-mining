import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAuthValid } from './lib/auth'
import {NextApiRequest, NextApiResponse} from "next";

export async function middleware(request: NextApiRequest, res: NextApiResponse) {
    // Example function to validate auth
    if (await isAuthValid(request)) {
        return NextResponse.next()
    }

    return NextResponse.rewrite(request.nextUrl.origin, {status: 401})
}
