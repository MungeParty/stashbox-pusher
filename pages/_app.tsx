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
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700" type="text/css" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></meta>
      </Head>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          fetcher: (resource, init) =>
          fetch(resource, init).then((res) => res.json())
        }}
        >
        <RouteProvider>
          <StateProvider>
            <Component {...pageProps} />
          </StateProvider>
        </RouteProvider>
      </SWRConfig>
    </div>
  )
}
