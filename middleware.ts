import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
	const { pathname } = url;
	const pathParts = pathname.split('/');
	const partCount = pathParts.length;
	// root
  if (partCount < 2) {
		console.log('middleware.ts: /')
		return NextResponse.next();
	}
  // room/*
	if (pathParts[1] === 'room') {
    const [ _, __, room, user] = pathParts;
    if (!room) {
      // redirect to root
      url.pathname = '/';
      return NextResponse.redirect(url);
		}
  }
  // default
	return NextResponse.next();
}

export const config = {
	matcher: [ '/', '/room/:room*/:user*' ]
}
