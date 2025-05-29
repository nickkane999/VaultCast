# Videos Feature Installation Guide

This guide will help you integrate the Videos feature into your VaultCast project.

## Dependencies

Add these packages to your `package.json`:

```json
{
  "dependencies": {
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0"
  }
}
```

## Environment Variables

Ensure these environment variables are set in your `.env.local`:

```env
MONGODB_URI=your_mongodb_connection_string
TMDB_API_KEY=your_tmdb_api_key
```

## Database Requirements

The Videos feature requires the following MongoDB collections:

- `movies` - For storing movie records
- `tv_episodes` - For storing TV show episode records
- `tmdb_cache` - For caching TMDb API responses (optional)

## API Routes

The following API routes will be created during integration:

- From: `lib/features/videos/api/route.ts`
- To: `app/api/videos/route.ts`

- From: `lib/features/videos/api/[id]/route.ts`
- To: `app/api/videos/[id]/route.ts`

- From: `lib/features/videos/api/tmdb/search/route.ts`
- To: `app/api/videos/tmdb/search/route.ts`

- From: `lib/features/videos/api/tmdb/[type]/[id]/route.ts`
- To: `app/api/videos/tmdb/[type]/[id]/route.ts`

- From: `lib/features/videos/api/bulk-update/route.ts`
- To: `app/api/videos/bulk-update/route.ts`

## Redux Store Integration

Add the videos reducer to your store configuration:

```typescript
import videosReducer from "@/lib/features/videos/store/videosSlice";

export const store = configureStore({
  reducer: {
    videos: videosReducer,
    // ... other reducers
  },
});
```

## Features Included

### 1. Video Library Management

- Movie and TV show organization
- Advanced filtering and search
- Grid and list view options
- Pagination and sorting
- Bulk operations

### 2. TMDb Integration

- Search movies and TV shows via TMDb API
- Auto-populate metadata from TMDb
- High-quality poster and backdrop images
- Cast and crew information
- Trailer integration

### 3. Advanced Filtering

- Filter by year, genre, actors
- Runtime and rating ranges
- Custom search queries
- Show recorded/unrecorded status
- Persistent filter states

### 4. Video Form Management

- Add new movies and TV shows
- Edit existing video records
- Form validation and error handling
- Auto-complete suggestions
- Image upload and management

### 5. Data Management

- Import from file systems
- Export to various formats
- Bulk metadata updates
- Duplicate detection
- Data validation

### 6. UI Components

- Responsive video cards
- Advanced filter panel
- Modal forms and dialogs
- Progress indicators
- Error handling displays

## TMDb API Integration

This feature integrates with The Movie Database (TMDb) API:

- **Search**: Find movies and TV shows
- **Details**: Fetch comprehensive metadata
- **Images**: High-resolution posters and backdrops
- **Videos**: Trailer and clip information
- **Credits**: Cast and crew details

### TMDb Setup

1. Create account at [TMDb](https://www.themoviedb.org/)
2. Get API key from [API settings](https://www.themoviedb.org/settings/api)
3. Add `TMDB_API_KEY` to your environment variables

## Component Architecture

### Core Components

- `VideoCard` - Individual video display card
- `VideoForm` - Add/edit video form
- `VideoFilters` - Advanced filtering interface
- `TMDbSearchDialog` - Search and select from TMDb
- `VideoList` - Grid/list video display

### Redux Integration

- Comprehensive state management
- Async thunks for API calls
- Optimistic updates
- Error handling and loading states
- Filter state persistence

## Usage

After integration, the videos feature will be available at your specified route (e.g., `/videos`).

### Basic Usage

1. Add movies and TV shows manually or via TMDb
2. Use filters to find specific content
3. Edit video information as needed
4. Organize your collection with tags and ratings

### Advanced Features

- Bulk import from file directories
- Auto-update metadata from TMDb
- Export collection data
- Advanced search and filtering
- Collection statistics and insights

## Server Dependencies

This feature requires the following server utilities:

- `mongodb.ts` - Database connection and operations
- TMDb API client configuration
- File upload handling (for posters/backdrops)
- Image processing capabilities

## Database Schema

### Movies Collection

```javascript
{
  _id: ObjectId,
  filename: String,
  title: String,
  description: String,
  score: Number,
  release_date: Date,
  tmdb_id: Number,
  imdb_id: String,
  genres: [String],
  cast: [{ name: String, character: String }],
  runtime: Number,
  poster_path: String,
  backdrop_path: String,
  trailer_url: String,
  createdAt: Date,
  updatedAt: Date
}
```

### TV Episodes Collection

```javascript
{
  _id: ObjectId,
  filename: String,
  title: String,
  show_name: String,
  season_number: Number,
  episode_number: Number,
  air_date: Date,
  description: String,
  tmdb_id: Number,
  runtime: Number,
  score: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Considerations

⚠️ **Important**: This feature manages media collections and external API integration.

- Validate all user inputs
- Implement proper file upload security
- Rate limit TMDb API calls
- Secure database operations
- Consider content filtering for public deployments

## Setup Commands

```bash
npm install @mui/material @mui/icons-material @reduxjs/toolkit react-redux
```

## File Structure

```
lib/features/videos/
├── components/
│   ├── VideoCard.tsx
│   ├── VideoForm.tsx
│   ├── VideoFilters.tsx
│   └── TMDbSearchDialog.tsx
├── store/
│   └── videosSlice.ts
├── api/
│   ├── route.ts
│   ├── [id]/route.ts
│   ├── tmdb/search/route.ts
│   ├── tmdb/[type]/[id]/route.ts
│   └── bulk-update/route.ts
├── util/
├── page/
│   └── page.tsx
├── types.ts
├── useVideos.ts
└── INSTALLATION.md
```

## Performance Optimization

- Implement pagination for large collections
- Cache TMDb API responses
- Optimize database queries with indexes
- Use virtual scrolling for large lists
- Implement image lazy loading

The integration system will automatically handle file copying and configuration!
