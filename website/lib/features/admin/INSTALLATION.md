# Admin Feature Installation Guide

This guide will help you integrate the Admin feature into your VaultCast project.

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

## Database Requirements

The Admin feature requires the following MongoDB collections:

- `movies` - For bulk video updates on movie content
- `tv_episodes` - For bulk video updates on TV show content
- Any additional collections you want to manage through the rename functionality

## Environment Variables

Ensure these environment variables are set in your `.env.local`:

```env
MONGODB_URI=your_mongodb_connection_string
```

## API Routes

The following API routes will be created during integration:

- From: `lib/features/admin/api/bulk-update-videos/route.ts`
- To: `app/api/admin/bulk-update-videos/route.ts`

- From: `lib/features/admin/api/collections/route.ts`
- To: `app/api/admin/collections/route.ts`

- From: `lib/features/admin/api/rename-collection/route.ts`
- To: `app/api/admin/rename-collection/route.ts`

## Redux Store Integration

Add the admin reducer to your store configuration:

```typescript
import adminReducer from "@/lib/features/admin/store/adminSlice";

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    // ... other reducers
  },
});
```

## Features Included

### 1. Bulk Video Update Component

- Update video metadata in bulk
- Support for both movies and TV shows
- Real-time progress tracking
- Configurable batch processing

### 2. Collection Management

- View all MongoDB collections
- Rename collections safely
- Collection status overview

### 3. Gmail Authentication

- Basic Gmail authentication component
- Ready for OAuth integration
- User session management

## Usage

After integration, the admin dashboard will be available at your specified route (e.g., `/admin`).

### Bulk Video Updates

- Choose between movies or TV shows
- Configure update options (trailers, missing info, etc.)
- Monitor real-time progress
- View completion statistics

### Collection Management

- List all database collections
- Rename collections with validation
- Track operation status

## Server Dependencies

This feature requires the following server utilities:

- `mongodb.ts` - Database connection and collection management
- Proper MongoDB connection configuration

## Security Considerations

⚠️ **Important**: The admin features provide powerful database operations. Ensure proper authentication and authorization are implemented before deploying to production.

- Implement role-based access control
- Add authentication middleware to API routes
- Validate user permissions for administrative operations
- Consider IP whitelisting for admin routes

## Setup Commands

```bash
npm install @mui/material @mui/icons-material @reduxjs/toolkit react-redux
```

The integration system will automatically handle file copying and configuration!
