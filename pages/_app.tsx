import '../styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'

import { SWRConfig } from 'swr'
import { ToastContainer } from 'react-toastify'
import StateProvider from '@/store/index'
import { RouteProvider } from '@/store/pusher'

export default function MyApp({
  Component,
  pageProps
}) {
  return (
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
          <ToastContainer
            autoClose={5000}
            hideProgressBar={false}
            draggable={false}
            pauseOnHover={false}
            position="bottom-center"
            enableMultiContainer={true}
            limit={10}
          />
        </StateProvider>
      </RouteProvider>
    </SWRConfig>
  )
}