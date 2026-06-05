---
inclusion: fileMatch
fileMatchPattern: "**/Dashboard*,**/Billing*,**/Messages*,**/Settings*,**/Project*,**/Invoice*,**/AuthGuard*,**/AdminGuard*,**/Admin*,**/IntakeForm*"
---

# Adverse LLC — Client Portal & Admin Context

## Client Portal (/dashboard/*)

Protected by `AuthGuard` (Clerk authentication required).

### Routes

| Path | Page | Purpose |
|------|------|---------|
| /dashboard | DashboardPage | Overview, recent activity |
| /dashboard/projects | ProjectListPage | Client's project list |
| /dashboard/projects/:id | ProjectDetailPage | Single project detail + timeline |
| /dashboard/billing | BillingPage | Invoices, payment history |
| /dashboard/messages | MessagesPage | Client-admin messaging |
| /dashboard/settings | SettingsPage | Profile, notification prefs |
| /dashboard/intake/:tierId | IntakeFormPage | New project intake form |

### Layout

`DashboardLayout` provides sidebar navigation + content area. All dashboard pages render inside this layout via nested routes.

## Admin Panel (/admin/*)

Protected by `AdminGuard` (Clerk auth + admin role via `publicMetadata.role` required).

### Routes

| Path | Page | Purpose |
|------|------|---------|
| /admin | AdminDashboardPage | Admin overview |
| /admin/clients | AdminClientsPage | Manage all clients |
| /admin/projects | AdminProjectsPage | Manage all projects |
| /admin/invoices | AdminInvoicesPage | Manage invoices |

## Key Components

| Component | Purpose |
|-----------|---------|
| AuthGuard | Redirects to /login if not authenticated (uses Clerk `useAuth`) |
| AdminGuard | Redirects if not admin role (uses Clerk `useAuth` + `useUser` publicMetadata) |
| DashboardLayout | Sidebar + content shell |
| FileUpload | Drag-and-drop file upload (Supabase Storage) |
| InvoiceCard | Invoice display with payment status |
| MessageThread | Threaded messaging UI |
| ProjectTimeline | Visual project status timeline |
| NotificationBadge | Unread notification indicator |

## Backend Services

| Service | Path | Purpose |
|---------|------|---------|
| Clerk | @clerk/clerk-react | Authentication provider (session management, sign-in/sign-up UI, JWT tokens) |
| supabase | src/lib/supabase.js | Supabase anonymous client for storage, realtime, and public queries |
| useSupabaseClient | src/hooks/useSupabaseClient.js | Authenticated Supabase client (Clerk JWT for RLS) |
| uploadService | src/lib/uploadService.js | File upload to Supabase Storage |
| rateLimiter | src/lib/rateLimiter.js | Client-side rate limiting |

## Custom Hooks

| Hook | Purpose |
|------|---------|
| useAuth (from @clerk/clerk-react) | Authentication state (`isLoaded`, `isSignedIn`, `getToken`) |
| useUser (from @clerk/clerk-react) | User profile data (`fullName`, `primaryEmailAddress`, `imageUrl`, `publicMetadata`) |
| useSupabaseClient | Returns a Supabase client with Clerk session token for authenticated RLS queries |
| useInvoices | Invoice CRUD operations |
| useMessages | Message thread operations |
| useNotifications | Notification state |
| useProjects | Project CRUD operations |

## Database Tables (Supabase)

- profiles, projects, project_status_history, project_feedback
- invoices, messages, notification_preferences

All tables have RLS (Row Level Security) enabled. Clients can only see their own data.
