import '../styles/main.css'

import Head from 'next/head'
import { SWRConfig } from 'swr'
import StateProvider from '@/store/index'
import { RouteProvider } from '@/store/pusher'

export default function MyApp({
  Component,
  pageProps
}) {
  return (
    <div>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></meta>
      </Head>
      <RouteProvider>
        <StateProvider>
          <Component {...pageProps} />
        </StateProvider>
      </RouteProvider>
    </div>
  )
}
