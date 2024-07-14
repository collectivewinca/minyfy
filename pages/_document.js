import Document, { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/vinyl.png" type="image/png" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <Script
            src="https://www.youtube.com/iframe_api"
            strategy="afterInteractive"
          />
        </body>
      </Html>
    )
  }
}

export default MyDocument
