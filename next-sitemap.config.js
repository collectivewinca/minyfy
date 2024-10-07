/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://minyfy.subwaymusician.xyz',
  generateRobotsTxt: true, 
  changefreq: 'daily', 
  priority: 0.8, 
  sitemapSize: 7000,
  exclude: ['/server', '/server/*', '/private', '/private/*'], // Add any pages you want to exclude
};

module.exports = config; 