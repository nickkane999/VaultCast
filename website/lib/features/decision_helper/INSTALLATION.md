# Decision Helper Feature Installation Guide

## Overview

The Decision Helper feature provides comprehensive task management, project tracking, event calendar, common decisions, and essentials management. This guide covers the proper integration after the recent fixes.

## Prerequisites

- Next.js 13+ with App Router
- MongoDB database
- Redux Toolkit for state management
- Material-UI components

## Fixed Structure

The feature now properly integrates with your existing store structure:

```
website/lib/features/decision_helper/
├── api/                                  # API routes for feature package
│   ├── events/route.ts                  # Events CRUD operations
│   ├── tasks/route.ts                   # Tasks CRUD operations
│   ├── projects/route.ts                # Projects CRUD operations
│   ├── decisions/route.ts               # Common decisions CRUD
│   └── essentials/route.ts              # Essentials CRUD operations
├── store/
│   ├── index.ts                         # Re-exports existing store structure
│   └── eventsSlice.ts                   # Events slice for feature package
├── page/
│   └── page.tsx                         # Feature package page component
├── util/
│   └── page_cache.ts                    # Server-side data fetching
├── types.ts                             # Type definitions
└── [various client components]          # UI components
```

## Key Fixes Applied

### 1. API Route Integration

All API routes have been copied to the feature package with proper collection names:

- `decision_helper_events`
- `decision_helper_tasks`
- `decision_helper_projects`
- `decision_helper_common_decisions`
- `decision_helper_essentials`

### 2. Store Structure Simplified

Replaced the massive 772-line consolidated slice with:

```typescript
// website/lib/features/decision_helper/store/index.ts
export * from "@/store/decision_helper";
export { fetchAllDecisionHelperData } from "@/store/decision_helper";
```

This uses your existing modular store structure which includes:

- `eventsSlice.ts`
- `tasksSlice.ts`
- `projectsSlice.ts`
- `commonDecisionsSlice.ts`
- `essentialsSlice.ts`

### 3. Client Integration Fixed

The DecisionHelperClient now properly:

- Uses the existing store (`@/store/store`)
- Imports actions from the correct store paths
- Initializes Redux state with server-fetched data
- Handles all 5 management areas (Events, Tasks, Projects, Decisions, Essentials)

## Database Collections

The feature uses these MongoDB collections:

- `decision_helper_events`
- `decision_helper_tasks`
- `decision_helper_projects`
- `decision_helper_common_decisions`
- `decision_helper_essentials`

## Template Integration

### Option A: Direct Page Usage

```typescript
// In your template's page.tsx
import DecisionHelperPage from "@/lib/features/decision_helper/page/page";

export default function TemplatePage() {
  return <DecisionHelperPage />;
}
```

### Option B: Using Existing Resources

```typescript
// Use the existing resources page
import DecisionHelperClient from "@/app/resources/decision_helper/DecisionHelperClient";
import { fetchDecisionHelperData } from "@/lib/features/decision_helper/util/page_cache";

export default async function CustomPage() {
  const data = await fetchDecisionHelperData();

  return <DecisionHelperClient initialData={data} refreshAction={refreshData} />;
}
```

## Features Included

### 1. Event Management

- Calendar events with date/time
- Attendance tracking
- Event filtering and sorting

### 2. Task Management

- Task completion tracking
- Tag system
- Project association
- Completion descriptions

### 3. Project Management

- Project tracking with deadlines
- Progress monitoring
- Completion descriptions

### 4. Common Decisions

- Quick decision-making tools
- Decision history

### 5. Essentials Management

- Priority-based tracking
- Category organization
- Completion tracking with intervals

## Current Status

✅ **API routes copied and working**  
✅ **Store structure simplified and modular**  
✅ **Redux integration fixed**  
✅ **Client components properly connected**  
✅ **Server-side data fetching implemented**  
✅ **Feature package page created**

## Usage

The feature is now ready for use at:

- `/resources/decision_helper` (existing page)
- Via feature package integration in templates

All data should now load properly and Redux state management should work correctly.

## Troubleshooting

If no records appear:

1. Check MongoDB collections exist with proper names
2. Verify API routes are accessible
3. Check Redux store integration
4. Ensure server-side data fetching is working

The modular store structure makes debugging much easier than the previous 772-line consolidated approach.
