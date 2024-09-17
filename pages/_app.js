import "@/styles/globals.css";
import Head from 'next/head';
import { DefaultSeo } from 'next-seo';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="icon" href="/favicon.ico" />
        {/* You can uncomment the line below if you have a specific vinyl icon */}
        {/* <link rel="icon" href="/vinyl.png" type="image/png" /> */}
      </Head>
      <DefaultSeo
        title="Miny Vinyl"
        description="Discover and collect vinyl records(MINY) with Miny Vinyl - your gateway to a world of music!"
        openGraph={{
          type: 'website',
          locale: 'en_IE',
          url: 'https://www.minyvinyl.com/',
          site_name: 'Miny Vinyl',
        }}
       
      />
      <Component {...pageProps} />
    </>
  );
}