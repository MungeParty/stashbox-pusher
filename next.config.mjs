/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  cleanDistDir: true,
  reactStrictMode: true,
  httpAgentOptions:{
    keepAlive: false,
  },
  experimental:{
    fetchCache: false,
    scrollRestoration: true
  },
  env: {
    PUSHER_PUBLIC_APP_KEY: 'c654692d1720b633b2a9',
    PUSHER_CLUSTER: 'us3'
  }
}

export default nextConfig