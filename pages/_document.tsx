import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
static async getInitialProps(ctx) {
const initialProps = await Document.getInitialProps(ctx)
const baseUrl = ctx.req ? `${ctx.req.headers['x-forwarded-proto'] || 'http'}://${ctx.req.headers.host}` : '';
return { ...initialProps, baseUrl }
}

render() {
return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta charSet="utf-8" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
    )
  }
}

export default MyDocument
