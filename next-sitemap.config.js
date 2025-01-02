const { supabase } = require('@/supabase/config');

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://minyfy.minyvinyl.com',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.8,
  sitemapSize: 7000,
  generateIndexSitemap: false,
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

    // Fetch mixtape IDs from Supabase
    try {
      console.log('Fetching mixtapes from Supabase...');
      const { data: mixtapes, error } = await supabase
        .from('mixtapes')
        .select('id');

      if (error) throw error;

      console.log(`Fetched ${mixtapes.length} mixtapes`);
      mixtapes.forEach(mixtape => {
        result.push({
          loc: `/play/${mixtape.id}`,
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