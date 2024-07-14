import Document, { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/vinyl.png" type="image/png" />   
          <title>Miny Vinyl</title>     
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-CQSPN22TTV"
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-CQSPN22TTV');
                `,
              }}
            />
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
