# Image Analyzer Feature Installation Guide

This guide will help you integrate the Image Analyzer feature into your VaultCast project.

## Dependencies

Add these packages to your `package.json`:

```json
{
  "dependencies": {
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "openai": "^4.20.0"
  }
}
```

## Environment Variables

Ensure these environment variables are set in your `.env.local`:

```env
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
```

## Database Requirements

The Image Analyzer feature requires the following MongoDB collections:

- `image_analyses` - For storing analysis results and history
- `analysis_categories` - For custom analysis categories (optional)

## API Routes

The following API routes will be created during integration:

- From: `lib/features/image_analyzer/api/analyze/route.ts`
- To: `app/api/image-analyzer/analyze/route.ts`

- From: `lib/features/image_analyzer/api/history/route.ts`
- To: `app/api/image-analyzer/history/route.ts`

- From: `lib/features/image_analyzer/api/upload/route.ts`
- To: `app/api/image-analyzer/upload/route.ts`

- From: `lib/features/image_analyzer/api/save/route.ts`
- To: `app/api/image-analyzer/save/route.ts`

## Redux Store Integration

Add the imageAnalyzer reducer to your store configuration:

```typescript
import imageAnalyzerReducer from "@/lib/features/image_analyzer/store/imageAnalyzerSlice";

export const store = configureStore({
  reducer: {
    imageAnalyzer: imageAnalyzerReducer,
    // ... other reducers
  },
});
```

## Features Included

### 1. Image Upload & Processing

- Drag-and-drop image upload
- Base64 image encoding
- Image preview functionality
- File type validation
- Image compression and optimization

### 2. AI-Powered Analysis

- OpenAI GPT-4 Vision integration
- Multiple analysis categories:
  - Animals & Pets identification
  - Celebrity recognition
  - Movie/TV show identification
  - Object recognition
  - Location identification
  - Food analysis
  - Art analysis
  - General image analysis

### 3. Category System

- Pre-built analysis categories
- Custom prompt support
- Category-specific prompts
- Expandable category system

### 4. Analysis Results

- Detailed AI analysis text
- Confidence scoring
- Processing time tracking
- Image metadata extraction
- Shareable results

### 5. History Management

- Analysis history storage
- Result searching and filtering
- Delete individual results
- Clear all history
- Export functionality

### 6. Advanced Features

- Real-time analysis progress
- Error handling and retry
- Responsive design
- Accessibility features
- Performance optimization

## OpenAI Vision API

This feature uses OpenAI's GPT-4 Vision model for image analysis:

- **Model**: `gpt-4-vision-preview`
- **Max Tokens**: 1000 per analysis
- **Image Detail**: High quality processing
- **Rate Limits**: Follows OpenAI's standard limits

## Component Architecture

### Core Components

- `ImageUploadZone` - File upload and preview
- `CategorySelector` - Analysis category selection
- `AnalysisResults` - Display analysis output
- `AnalysisHistory` - Historical results management
- `TestImageAnalyzer` - Quick testing interface

### Redux Integration

- State management for all analysis data
- Async thunks for API interactions
- Optimistic updates for better UX
- Error handling and loading states

## Usage

After integration, the image analyzer will be available at your specified route (e.g., `/tools/image-analyzer`).

### Basic Analysis

1. Upload an image via drag-and-drop or file selection
2. Choose an analysis category or enter custom prompt
3. Click analyze to get AI-powered insights
4. View detailed results with metadata

### Advanced Features

- Browse analysis history
- Save favorite analyses
- Compare multiple results
- Export analysis data

## Server Dependencies

This feature requires the following server utilities:

- `mongodb.ts` - Database connection and operations
- OpenAI API integration
- File upload handling
- Image processing capabilities

## Security Considerations

⚠️ **Important**: This feature processes user-uploaded images through external APIs.

- Implement file size limits (recommended: 10MB max)
- Validate file types (accept only images)
- Consider image content filtering
- Monitor OpenAI API usage and costs
- Implement rate limiting for API calls

## Setup Commands

```bash
npm install @mui/material @mui/icons-material @reduxjs/toolkit react-redux openai
```

## File Structure

```
lib/features/image_analyzer/
├── components/
│   ├── ImageUploadZone.tsx
│   ├── CategorySelector.tsx
│   ├── AnalysisResults.tsx
│   ├── AnalysisHistory.tsx
│   └── TestImageAnalyzer.tsx
├── store/
│   └── imageAnalyzerSlice.ts
├── api/
│   ├── analyze/route.ts
│   ├── history/route.ts
│   ├── upload/route.ts
│   └── save/route.ts
├── hooks/
├── cards/
├── utils/
├── page/
│   └── page.tsx
├── types.ts
├── ImageAnalyzer.module.css
└── INSTALLATION.md
```

The integration system will automatically handle file copying and configuration!
