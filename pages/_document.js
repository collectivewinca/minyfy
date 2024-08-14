import Footer from '@/components/Footer'
import Document, { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/vinyl.png" type="image/png" /> 
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </Head>
        <body>
          <Main />
          <NextScript />
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-CQSPN22TTV"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-CQSPN22TTV');
            `}
          </Script>
          <Script
            src="https://www.youtube.com/iframe_api"
            strategy="afterInteractive"
          />
        </body>
        <Footer />
      </Html>
    )
  }
}

export default MyDocument