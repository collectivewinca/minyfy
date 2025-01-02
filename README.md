# Miny Vinyl - Modern Digital Mixtape Creation Platform

A modern web application that allows users to create, share, and discover digital mixtapes. Built with Next.js, Firebase, and various music platform integrations.

## Core Features

- Create personalized digital mixtapes
- Import tracks from multiple music platforms
- AI-generated background images
- Social sharing capabilities
- Interactive 3D visualization
- Comment system with multimedia support
- Password-protected exclusive content
- PWA support for mobile devices

## Pages

### Home Page (`pages/index.js`)
1. Featured mixtape gallery display
2. Quick access to mixtape creation
3. Latest community mixtapes showcase
4. User authentication integration
5. Responsive design for all devices
6. Dynamic content loading
7. SEO optimization

### Make A Miny Page (`pages/makeaminy.js`)
1. Multiple track import options
2. AI-powered background generation
3. Real-time mixtape preview
4. Custom URL generation
5. Track list management
6. Background image selection
7. Social sharing integration

### Catalog Page (`pages/catalog.js`)
1. Browse all public mixtapes
2. Filtering and sorting options
3. Upvoting system
4. Comment count display
5. Tag-based navigation
6. Infinite scroll implementation
7. Search functionality

### Collections Page (`pages/collections.js`)
1. Personal mixtape library
2. Creation date tracking
3. Quick access to owned mixtapes
4. Share management
5. Collection statistics
6. Deletion capabilities
7. Sort and filter options

### Crates Page (`pages/crates.js`)
1. Purchase history display
2. Order status tracking
3. Download management
4. Payment integration
5. Email notifications
6. Order confirmation
7. Purchase analytics

### Play Page (`pages/play/[id].js`)
1. YouTube video integration
2. Track list navigation
3. Comment section
4. Social sharing options
5. Purchase options
6. Interactive player controls
7. Real-time updates

### Reddit Integration (`pages/reddit.js`)
1. Reddit post parsing
2. AI-powered track extraction
3. Custom playlist creation
4. Thread analysis
5. Error handling
6. Progress tracking
7. Multiple subreddit support

### Last.fm Integration (`pages/lastfm.js`)
1. Last.fm profile integration
2. Listening history import
3. Time period selection
4. Track statistics
5. Custom playlist generation
6. Error handling
7. API rate limiting

## Components

### ArtistSection Component
1. Artist search functionality
2. Top tracks display
3. Artist information
4. Track selection
5. Error handling
6. Loading states
7. Spotify API integration

### BuyNow Component
1. Purchase form handling
2. Payment processing
3. Order confirmation
4. Error validation
5. Address management
6. Price calculation
7. Discount handling

### CommentSection Component
1. Text comments support
2. Voice message recording
3. Sticker reactions
4. Poll creation
5. Reply threading
6. Real-time updates
7. Moderation tools

### CustomTrack Component
1. Manual track entry
2. Track validation
3. Batch processing
4. Format standardization
5. Duplicate detection
6. Error handling
7. Preview functionality

### Footer Component
1. Navigation links
2. Social media integration
3. Contact information
4. Newsletter signup
5. Legal links
6. Responsive design
7. Dynamic content

### Gallery Component
1. Mixtape showcase
2. Interactive previews
3. Filtering options
4. Sorting capabilities
5. Grid/List views
6. Lazy loading
7. Animation effects

### Header Component
1. Navigation menu
2. User authentication
3. Search functionality
4. Responsive design
5. Dynamic state management
6. Route handling
7. Theme switching

### ImportPlaylist Component
1. Spotify playlist import
2. Track selection
3. Metadata handling
4. Progress tracking
5. Error management
6. Rate limiting
7. Authentication flow

### ImportApplePlaylist Component
1. Apple Music integration
2. Playlist search
3. Track metadata handling
4. Import progress tracking
5. Error handling
6. Authentication flow
7. Rate limiting

### ImportDiscogPlaylist Component
1. Discogs catalog integration
2. Release search
3. Track extraction
4. Metadata normalization
5. Error handling
6. Progress tracking
7. Format conversion

### ImportYoutubePlaylist Component
1. YouTube playlist parsing
2. Video metadata extraction
3. Duration calculation
4. Thumbnail handling
5. Error management
6. Progress tracking
7. API quota management

### MinySection Component
1. Mixtape visualization
2. Track list display
3. Background management
4. Image generation
5. Share functionality
6. Download options
7. Preview capabilities

### PledgeForm Component
1. User pledge handling
2. Category selection
3. Form validation
4. Submission processing
5. Error handling
6. Success notifications
7. Data persistence

### PWAShare Component
1. Native sharing
2. Cross-platform support
3. Media handling
4. Offline capabilities
5. Share tracking
6. Custom protocols
7. Error handling

### SocialShareButtons Component
1. Multiple platform support
2. Custom share messages
3. Analytics tracking
4. Preview generation
5. URL shortening
6. Meta tag handling
7. Share counts

### TagSection Component
1. Genre-based filtering
2. Tag management
3. Track association
4. Search functionality
5. Tag statistics
6. Batch operations
7. Custom visualization

### TrackList Component
1. Track display
2. Sorting options
3. Selection handling
4. Metadata display
5. Play controls
6. Progress tracking
7. Error states

## Technical Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Firebase (Firestore, Storage, Authentication)
- **APIs**: Spotify, YouTube, Apple Music, Last.fm, Reddit, Discogs
- **AI Integration**: OpenAI DALL-E, Google Gemini
- **Authentication**: Firebase Auth, OAuth
- **Storage**: Firebase Storage
- **Database**: Firestore
- **Deployment**: Vercel
- **Analytics**: Firebase Analytics
- **Email**: Resend

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Set up environment variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Other APIs
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=
```
4. Run the development server:
```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
