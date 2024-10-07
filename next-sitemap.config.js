const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log('Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log('Firebase initialized');

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://minyfy.subwaymusician.xyz',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.8,
  sitemapSize: 7000,
  exclude: ['/server', '/server/*', '/private', '/private/*'],
  additionalPaths: async (config) => {
    const result = [
      { loc: '/crates', changefreq: 'daily', priority: 0.7 },
      { loc: '/catalog', changefreq: 'daily', priority: 0.7 },
      { loc: '/collection', changefreq: 'daily', priority: 0.7 },
      { loc: '/makeaminy', changefreq: 'daily', priority: 0.8 },
      { loc: '/', changefreq: 'daily', priority: 0.9 },
      { loc: '/lastfm', changefreq: 'daily', priority: 0.6 },
    ];

    // Fetch mixtape IDs from Firestore
    try {
      console.log('Fetching mixtapes from Firestore...');
      const mixtapesSnapshot = await getDocs(collection(db, 'mixtapes'));
      console.log(`Fetched ${mixtapesSnapshot.size} mixtapes`);
      mixtapesSnapshot.forEach(doc => {
        result.push({
          loc: `/play/${doc.id}`,
          changefreq: 'daily',
          priority: 0.6
        });
      });
    } catch (error) {
      console.error('Error fetching mixtape IDs:', error);
    }

    console.log(`Total URLs in sitemap: ${result.length}`);
    return result;
  },
};

module.exports = config;