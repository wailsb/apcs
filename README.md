# Portly

Modern port operations platform for managing container arrivals, appointments, slot scheduling, and real-time terminal coordination.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Features](#features)
- [Getting Started](#getting-started)
- [Code Explanation](#code-explanation)
- [Design System](#design-system)
- [Services Layer](#services-layer)
- [Components](#components)
- [Pages](#pages)
- [Routing & Authentication](#routing--authentication)

## Overview

Portly is a comprehensive port management system built with React and TypeScript. It provides role-based access control for three user types:

- **ADMIN**: Full platform management (users, enterprise owners, settings, dashboard)
- **ENTERPRISE**: Container management and appointment booking
- **MANAGER**: QR code scanning for container verification

The application uses a modern glass morphism design system with a clean, professional UI.

## Tech Stack

- **React 18.3.1** - UI framework
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool and dev server
- **React Router 6.30.1** - Client-side routing
- **TanStack Query 5.83.0** - Data fetching and caching
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives (via shadcn/ui)
- **Vitest 3.2.4** - Testing framework
- **html5-qrcode 2.3.8** - QR code scanning

## Project Structure

```
portly/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, icons, logos
│   ├── components/        # Reusable React components
│   │   ├── ui/           # shadcn/ui components (Button, Dialog, etc.)
│   │   └── ...           # Business logic components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities, types, constants
│   ├── pages/            # Page components
│   │   ├── admin/       # Admin pages
│   │   └── manager/     # Manager pages
│   ├── services/         # API/service layer (currently mock)
│   ├── styles/          # Global styles (glass.css)
│   └── test/            # Test files
├── index.html            # HTML entry point
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies
```

## Architecture

### Component Architecture

The application follows a component-based architecture with clear separation of concerns:

1. **Pages** (`src/pages/`) - Top-level route components
2. **Components** (`src/components/`) - Reusable UI components
3. **Services** (`src/services/`) - Data access layer
4. **Types** (`src/lib/types.ts`) - TypeScript type definitions

### Data Flow

```
User Action → Component → Service → Mock Data → Component State → UI Update
```

Currently, all services use in-memory mock data. The `apiClient.ts` is a placeholder for future backend integration.

## Features

### Admin Features
- **Dashboard**: Overview statistics (enterprises, managers, containers, appointments)
- **User Management**: Create, edit, enable/disable users with role assignment
- **Enterprise Owners Management**: Manage enterprise accounts and their details
- **Platform Settings**: Configure platform-wide settings

### Enterprise Features
- **Container List**: View all containers with status filtering
- **Search**: Search containers by ID
- **Appointment Booking**: Schedule appointments for arrived containers
- **Status Filtering**: Filter by arrived/not arrived status

### Manager Features
- **QR Code Scanning**: Scan QR codes to verify container appointments
- **Camera Integration**: Real-time camera access for QR scanning
- **Booking Verification**: Parse and confirm booking information from QR codes

## Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- npm, yarn, or bun package manager

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:8080`

### Login

The application uses mock authentication. You can login with any credentials by selecting a role:
- **ADMIN**: Access to all admin features
- **ENTERPRISE**: Access to container management
- **MANAGER**: Access to QR scanning

## Code Explanation

### Entry Point

**`src/main.tsx`**
- React application entry point
- Renders the root App component into the DOM

**`src/App.tsx`**
- Main application component
- Sets up routing with React Router
- Implements protected routes with role-based access
- Wraps app with QueryClientProvider and TooltipProvider

### Routing & Authentication

**Protected Routes** (`src/App.tsx`)
- `ProtectedRoute` component checks authentication status
- Redirects unauthenticated users to `/login`
- Redirects users to role-appropriate pages if accessing wrong routes
- Routes:
  - `/login` - Public login page
  - `/admin/*` - Admin pages (protected)
  - `/enterprise` - Enterprise page (protected)
  - `/manager/scan` - Manager QR scan page (protected)

**Authentication Service** (`src/services/auth.service.ts`)
- Mock authentication using localStorage
- Stores session with role and username
- Provides `login()`, `logout()`, `getSession()`, `isAuthenticated()` methods

### Pages

#### Login Page (`src/pages/LoginPage.tsx`)
- Role selection dropdown (ADMIN, ENTERPRISE, MANAGER)
- Username and password inputs (validation only, no real auth)
- Redirects to appropriate page based on selected role
- Beautiful glass morphism design with animated background

#### Admin Pages

**Dashboard** (`src/pages/admin/AdminDashboardPage.tsx`)
- Displays KPI tiles with statistics:
  - Total Enterprises
  - Total Managers
  - Total Containers
  - Appointments Scheduled
  - Arrived Today
  - Not Arrived Today
- Shows recent activity feed
- Fetches data from `statsService`

**Users Management** (`src/pages/admin/AdminUsersPage.tsx`)
- List all platform users
- Create new users with role assignment
- Edit existing users
- Enable/disable user accounts
- Shows user avatar initials, email, role badge, and status

**Enterprise Owners** (`src/pages/admin/AdminEnterpriseOwnersPage.tsx`)
- List all enterprise owners
- Create new enterprise accounts
- Edit enterprise information
- Shows company name, owner name, email, container count, and status
- Uses same pattern as Users page

**Settings** (`src/pages/admin/AdminSettingsPage.tsx`)
- Platform configuration
- Settings management (implementation may vary)

#### Enterprise Page (`src/pages/EnterprisePage.tsx`)
- Container list with search functionality
- Status filtering (All, Arrived, Not Arrived)
- Click container to book appointment (if arrived)
- Opens booking modal for scheduling
- Full-width layout without sidebar

#### Manager Scan Page (`src/pages/manager/ManagerScanPage.tsx`)
- QR code scanner using device camera
- Real-time QR code detection
- Parses booking information from QR codes
- Confirms appointments after scanning
- Handles camera permissions and errors gracefully
- Uses `html5-qrcode` library

### Components

#### Layout Components

**LayoutShell** (`src/components/LayoutShell.tsx`)
- Main layout wrapper for all pages
- Conditionally shows sidebar based on `showSidebar` prop
- Sidebar layout for Admin/Manager
- Full-width layout for Enterprise
- Includes TopBar component

**SidebarNav** (`src/components/SidebarNav.tsx`)
- Collapsible navigation sidebar
- Role-based menu items
- Shows different navigation for ADMIN vs MANAGER
- Smooth collapse/expand animation
- Active route highlighting

**TopBar** (`src/components/TopBar.tsx`)
- Top navigation bar
- Search functionality (when enabled)
- User actions

#### Business Components

**ContainersList** (`src/components/ContainersList.tsx`)
- Displays list of containers
- Shows container status (arrived, scheduled, not arrived)
- Clickable items for booking

**ContainerListItem** (`src/components/ContainerListItem.tsx`)
- Individual container item
- Status indicators
- Appointment information display

**BookingModal** (`src/components/BookingModal.tsx`)
- Modal for booking appointments
- Date and time slot selection
- Calendar picker integration
- Form validation

**StatusFilterTabs** (`src/components/StatusFilterTabs.tsx`)
- Tab-based filtering UI
- Filters: All, Arrived, Not Arrived

**KpiTile** (`src/components/KpiTile.tsx`)
- Dashboard KPI display component
- Shows title and value
- Customizable value styling

**QrScannerOverlay** (`src/components/QrScannerOverlay.tsx`)
- Visual overlay for QR scanner
- Scanning frame corners
- Visual feedback during scanning

#### UI Components (`src/components/ui/`)

Built on Radix UI primitives with custom styling:
- **Button** - Various variants (default, outline, glass-outline)
- **Dialog** - Modal dialogs
- **Input** - Form inputs
- **Select** - Dropdown selects
- **Item** - List item components (ItemMedia, ItemContent, ItemTitle, etc.)
- **StatusText/StatusPill** - Status indicators
- And many more...

### Services Layer

The services layer provides data access and integrates with the APCS backend microservices. Each service can operate in mock mode (for development) or connect to the real backend APIs.

#### Backend Microservices Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vite Dev Server                          │
│                     (localhost:8080)                            │
│                                                                 │
│  Proxy Configuration:                                           │
│  /api/auth/*      → Auth Service (8081)                        │
│  /api/bookings/*  → Booking Service (8082)                     │
│  /api/slots/*     → Slot Service (8083)                        │
│  /api/terminals/* → Slot Service (8083)                        │
│  /api/ai/*        → AI Orchestrator (8084)                     │
│  /api/audit/*     → Audit Service (8085)                       │
└─────────────────────────────────────────────────────────────────┘
```

#### Starting the Backend

```bash
# From apcs-backend directory
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f auth-service
```

#### Service Files

**apiClient.ts**
- HTTP client with JWT token management
- Automatic token refresh on 401 responses
- Request/response interceptors
- Type-safe API calls

**auth.service.ts**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- Session storage in localStorage

**booking.service.ts**
- `POST /api/bookings` - Create booking
- `GET /api/bookings/{id}` - Get booking by ID
- `GET /api/bookings/ref/{ref}` - Get by reference
- `GET /api/bookings/user/{userId}` - User bookings
- `POST /api/bookings/{id}/confirm` - Confirm booking
- `POST /api/bookings/{id}/cancel` - Cancel booking
- `POST /api/bookings/check-in` - Process check-in
- `POST /api/bookings/{id}/check-out` - Process check-out

**slots.service.ts**
- `GET /api/slots/availability/{terminalId}` - Get availability
- `GET /api/slots/gate/{gateId}` - Get slots for gate
- `POST /api/slots/generate` - Generate time slots
- `POST /api/slots/reserve` - Reserve slot capacity
- `POST /api/slots/{id}/block` - Block slot
- `POST /api/slots/{id}/unblock` - Unblock slot

**terminals.service.ts**
- `GET /api/terminals` - List all terminals
- `GET /api/terminals/{id}` - Get terminal by ID
- `POST /api/terminals` - Create terminal
- `POST /api/terminals/{id}/gates` - Add gate
- `PUT /api/terminals/{id}/config` - Update configuration

**containers.service.ts**
- Container CRUD operations
- Integrates with booking service for real data
- Backward compatibility layer

**users.service.ts**
- User management operations
- Integrates with auth service

**stats.service.ts**
- Dashboard statistics
- Aggregates data from booking/terminal services

**settings.service.ts**
- Platform settings management

#### Mock Mode

Each service has a `USE_MOCK` flag. Set to `true` for development without backend:

```typescript
// In service file
const USE_MOCK = true; // Use mock data
const USE_MOCK = false; // Use real backend
```

### Types

**`src/lib/types.ts`**
Defines all TypeScript interfaces:
- `Role` - User roles (ADMIN, ENTERPRISE, MANAGER)
- `ContainerItem` - Container data structure
- `User` - User information
- `EnterpriseOwner` - Enterprise account data
- `Slot` - Time slot information
- `PlatformSettings` - Platform configuration
- And more...

### Design System

**Glass Morphism Theme** (`src/styles/glass.css`)

The application uses a custom glass morphism design system:

**Color Palette:**
- Primary: `#040CAD` (hsl 231 95% 35%)
- Accent: `#576AFF` (hsl 231 100% 67%)
- Background: Pure white

**CSS Classes:**
- `.glass` - Base glass effect
- `.glass-strong` - Stronger glass effect
- `.glass-primary` - Primary tinted glass
- `.glass-primary-panel` - Panel with primary glass
- `.glass-round` - Rounded corners (18px)
- `.glass-pill-*` - Status pill styles
- `.glass-list-item` - List item hover effects

**Animations:**
- Staggered list item animations
- Smooth hover transitions
- Section fade-in animations

**Status Colors:**
- Arrived/Active: Green (`--glass-arrived-*`)
- Not Arrived/Disabled: Red (`--glass-not-arrived-*`)
- Scheduled: Blue (`--glass-scheduled-*`)

### Hooks

**use-toast.ts** (`src/hooks/use-toast.ts`)
- Toast notification system
- Reducer-based state management
- Toast queue with auto-dismiss
- Used throughout app for user feedback

**use-mobile.tsx** (`src/hooks/use-mobile.tsx`)
- Detects mobile devices
- Responsive behavior helper

### Utilities

**`src/lib/utils.ts`**
- `cn()` - Class name utility (clsx + tailwind-merge)
- Combines Tailwind classes intelligently

**`src/lib/id.ts`**
- ID generation utilities

**`src/lib/mockData.ts`**
- Mock data for development
- Container data, user data, etc.

## Development Notes

### Mock Data
All services currently use in-memory mock data. To integrate with a real backend:
1. Implement `apiClient.ts` with actual HTTP requests
2. Update each service to use `apiClient` instead of mock data
3. Handle authentication tokens
4. Add error handling and retry logic

### Testing
- Test files in `src/test/`
- Uses Vitest with jsdom environment
- Test setup in `src/test/setup.ts`

### Build Configuration
- **Vite** (`vite.config.ts`): Dev server on port 8080, React SWC plugin
- **TypeScript**: Strict mode enabled
- **Tailwind**: Custom configuration with glass morphism utilities

## Future Enhancements

1. **Backend Integration**: Replace mock services with real API calls
2. **Real Authentication**: Implement proper auth with JWT tokens
3. **Real-time Updates**: WebSocket integration for live updates
4. **Delete Functionality**: Add delete operations for users/enterprises
5. **Pagination**: Add pagination for large lists
6. **Advanced Filtering**: More filter options for containers
7. **Export Features**: Export data to CSV/PDF
8. **Notifications**: Real-time notification system
9. **Analytics**: Advanced analytics and reporting
10. **Mobile App**: React Native version for mobile devices

## License

Private project - All rights reserved
