import "@/styles/globals.css";
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* <link rel="icon" href="/vinyl.png" type="image/png" /> */}
        <title>Miny Vinyl</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}