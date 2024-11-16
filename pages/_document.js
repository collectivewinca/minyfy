import Footer from '@/components/Footer'
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
            id="clarity-script"
            strategy="afterInteractive"
          >
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "ozc9phvqpz");
            `}
          </Script>
        </body>
        <Footer />
      </Html>
    )
  }
}

export default MyDocument
