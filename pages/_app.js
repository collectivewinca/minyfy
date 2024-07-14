import "@/styles/globals.css";
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/vinyl.png" type="image/png" />
        <title>Miny Vinyl</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}