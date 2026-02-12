# Health Navigator AI - Healthcare Platform

A full-stack healthcare appointment booking system with AI-powered assistance, doctor and admin dashboards, and role-based access control.

## 🚀 Quick Start

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Install dependencies
npm i

# Start development server (port 8080)
npm run dev
```

### Development Commands
```bash
npm run dev      # Start dev server with hot reload (port 8080)
npm run build    # Production build
npm run lint     # ESLint checks
npm run preview  # Preview production build
```

---

## 📚 Project Overview

This is a modern, production-ready healthcare platform designed for appointment scheduling and management. It features:
- ✅ Multi-role authentication (Patient, Doctor, Admin)
- ✅ AI-powered health assistant for symptom guidance
- ✅ Real-time appointment booking and management
- ✅ Doctor availability management
- ✅ Admin dashboard with system analytics
- ✅ Email notifications
- ✅ Dark mode support

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **UI Framework** | shadcn/ui (Radix UI components) |
| **Styling** | Tailwind CSS |
| **Routing** | React Router v7 |
| **State Management** | TanStack React Query (server state) + React Context (auth state) |
| **Backend** | Supabase (PostgreSQL + Auth + Edge Functions) |
| **Forms** | React Hook Form + Zod validation |
| **Data Visualization** | Recharts |
| **Animations** | Framer Motion |

---

## 📁 Project Structure

```
src/
├── pages/                    # Route-level page components
├── components/               # Reusable UI components (organized by feature)
├── hooks/                    # Custom React hooks
├── integrations/             # Third-party integrations (Supabase)
└── lib/                      # Utilities and helpers

supabase/
├── migrations/               # Database schema migrations
├── functions/                # Serverless edge functions
└── config.toml              # Supabase project config
```

---

## 🔐 Authentication & Roles

The system supports **3 user roles**:

| Role | Capabilities |
|------|-------------|
| **Patient** | Browse doctors, book appointments, reschedule, view appointment history, chat with AI |
| **Doctor** | Manage profile, set availability, view/confirm appointments |
| **Admin** | Manage users/doctors, approve doctors, view system statistics |

**Authentication Flow:**
- Email/password signup & signin via Supabase Auth
- JWT tokens for session management
- Role stored in `user_roles` database table
- Dev mode support with `VITE_DEV_FORCE_AUTH=true` environment variable

---

## 📄 Pages & Routes

| Route | Component | Purpose | Roles |
|-------|-----------|---------|-------|
| `/` | `Index.tsx` | Landing page with hero, features, departments | Public |
| `/auth` | `Auth.tsx` | Login/signup with role selection | Public |
| `/booking` | `Booking.tsx` | Multi-step appointment booking wizard | Patients |
| `/assistant` | `Assistant.tsx` | AI chat for health queries | Patients |
| `/doctor` | `DoctorOverview.tsx` | Doctor dashboard with stats | Doctors |
| `/doctor/appointments` | `DoctorAppointments.tsx` | View/manage doctor appointments | Doctors |
| `/doctor/availability` | `DoctorAvailability.tsx` | Set availability time slots | Doctors |
| `/doctor/profile` | `DoctorProfilePage.tsx` | Edit doctor profile | Doctors |
| `/my-appointments` | `PatientDashboard.tsx` | Patient appointment history & rescheduling | Patients |
| `/admin` | `AdminDashboard.tsx` | System management & analytics | Admins |

---

## 🧩 Component Documentation

### **Layout Components** (`src/components/layout/`)

#### **Header.tsx**
**Purpose**: Sticky navigation bar with site branding and user authentication menu

**Features**:
- Logo with Medicare branding and gradient icon
- Responsive navigation (desktop horizontal + mobile hamburger menu)
- Dynamic nav links based on user role:
  - Shows "Book Appointment" link for all users
  - Shows "AI Assistant" link for all users
  - Shows "My Appointments" only for patients
  - Shows "Doctor Dashboard" only for doctors
  - Shows "Admin Dashboard" only for admins
- User dropdown menu with:
  - Profile button
  - Sign out button
- Sign in/up navigation buttons for guests
- Mobile-friendly drawer menu with Framer Motion animations
- Active link highlighting

**Key Hooks**: `useAuth()`, `useIsDoctor()`, `useIsAdmin()`, `useToast()`

```tsx
// Usage
<Header /> // No props needed, handles all state internally
```

---

#### **Footer.tsx**
**Purpose**: Site-wide footer with branding, navigation, and contact information

**Features**:
- Brand section with logo and tagline
- Quick action links:
  - Book Appointment
  - AI Assistant
  - My Appointments (for patients)
- Contact information section:
  - Email: contact@medicare.health
  - Phone: +1 (555) 123-4567
  - Address: Medical Center
- Responsive grid layout (1 col mobile, 4 cols desktop)
- Professional styling with muted foreground colors

```tsx
// Usage
<Footer /> // No props needed
```

---

### **Home Page Components** (`src/components/home/`)

#### **HeroSection.tsx**
**Purpose**: Eye-catching landing page hero banner

**Features**:
- Large headline with gradient text effect
- Compelling tagline
- Call-to-action buttons:
  - "Browse Doctors"
  - "Book Now"
- Hero background with accent gradient
- Animated entrance with Framer Motion

---

#### **FeaturesSection.tsx**
**Purpose**: Highlights key platform value propositions

**Features**:
- 4-6 feature cards showcasing:
  - Quick Booking
  - 24/7 Availability
  - Specialist Network
  - Secure Payments
  - AI Assistance
  - Expert Doctors
- Icons from Lucide React
- Responsive grid layout

---

#### **DepartmentsSection.tsx**
**Purpose**: Displays all available medical departments/specialties

**Features**:
- 6 department cards:
  - **Cardiology** - Heart and cardiovascular care (Heart icon, red color)
  - **Neurology** - Brain and nervous system (Brain icon, purple color)
  - **Orthopedics** - Bone and joint specialists (Bone icon, orange color)
  - **Pediatrics** - Child health and development (Baby icon, blue color)
  - **Ophthalmology** - Eye care and vision (Eye icon, cyan color)
  - **General Medicine** - Primary care services (Stethoscope icon, green color)
- Click to navigate to `/booking?department=<deptId>`
- Color-coded icons for visual distinction
- Doctor count per department

```tsx
// Clicking on Cardiology card navigates user to:
// /booking?department=cardiology
```

---

#### **CTASection.tsx**
**Purpose**: Conversion-focused call-to-action section

**Features**:
- Compelling headline encouraging action
- Prominent action button
- Optional testimonials or social proof
- Used at bottom of landing page

---

### **Authentication Page** (`src/pages/Auth.tsx`)

#### **Auth.tsx**
**Purpose**: Central authentication page supporting patient, doctor, and admin login/signup

**Features**:
- **Tab-based role selection**: Patient vs Doctor (Admin hidden by default)
- **Mode toggle**: Sign In vs Sign Up
- **Patient Signup Fields**:
  - Email
  - Password
  - Full Name
  - Phone Number
- **Doctor Signup Fields**:
  - Email
  - Password
  - Full Name
  - Phone Number
  - Department (Select)
  - Specialty
  - Bio (Textarea)
- **Admin Login**: Separate hidden tab for admin access
- **Animated transitions**: Role icon and form content transitions with Framer Motion
- **Form validation**: Client-side validation with error messages
- **OAuth ready**: Structure prepared for future OAuth integration
- **Remember me**: Optional remember-me checkbox

**State Management**:
- Signup mode (isLogin)
- Role selection (authMode: "patient" | "doctor" | "admin")
- Form inputs
- Loading states during submission

**Hooks**: `useAuth()`, `useNavigate()`, `useToast()`

---

### **Booking Components** (`src/components/booking/`)

#### **BookingWizard.tsx**
**Purpose**: Multi-step appointment booking flow with validation

**Features**:
- **4-step wizard**:
  1. **Department Selection**: Choose from 6 medical departments with icons
  2. **Doctor Selection**: Filter by department, view doctor details
  3. **Time Slot Selection**: Date picker + available time slots
  4. **Review & Confirm**: Review all booking details before confirmation

- **Progress Indicator**: Shows current step (1/4, 2/4, etc)
- **Navigation**: Back/Next buttons with validation
- **Animated Transitions**: Slide transitions between steps using Framer Motion
- **Pre-population**: Supports query parameters (`?department=cardiology`)
- **Authentication Check**: Redirects to auth if not logged in at confirmation step
- **Loading States**: Shows spinners while fetching doctors/slots

**Logic**:
- Step 1: Department must be selected to proceed
- Step 2: Doctor must be selected to proceed
- Step 3: Time slot must be selected to proceed
- Step 4: Automatic redirect to auth if needed, then creates appointment

**Props**:
```ts
interface BookingWizardProps {
  initialDepartment?: string; // Pre-select department (e.g., "cardiology")
}
```

**Hooks**: `useBooking()`, `useAuth()`, `useNavigate()`, `useToast()`

---

#### **Booking Sub-Components**

**DepartmentStep.tsx**
- Rendered in step 1
- Grid of 6 department cards
- Click to select department
- Updates parent booking state

**DoctorStep.tsx**
- Rendered in step 2
- Fetches doctors filtered by selected department
- Displays doctor cards with:
  - Name
  - Specialty
  - Department
  - Rating
  - Availability indicator
- Loading skeleton while fetching

**TimeSlotStep.tsx**
- Rendered in step 3
- Calendar date picker
- Shows available time slots for selected doctor
- Displays slot status (Available, Booked, etc)
- Select button for each slot

**ConfirmationStep.tsx**
- Rendered in step 4
- Summary of:
  - Selected department
  - Selected doctor
  - Selected date and time
  - Total cost (if applicable)
- "Confirm Booking" button
- Shows success message after booking
- "Book Another" button for repeat bookings

---

### **Patient Components** (`src/components/patient/`)

#### **PatientAppointmentCard.tsx**
**Purpose**: Display individual appointment in a card format

**Features**:
- Doctor name with specialty and department
- Appointment date and time
- Status badge:
  - Scheduled (blue)
  - Completed (green)
  - Cancelled (red)
- Doctor avatar (if available)
- Action buttons:
  - Reschedule
  - Cancel
  - View Details
- Responsive card layout

**Props**:
```ts
interface Props {
  appointment: Appointment;
  onReschedule?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
}
```

---

#### **RescheduleDialog.tsx**
**Purpose**: Modal dialog for rescheduling an existing appointment

**Features**:
- Uses Dialog component from shadcn/ui
- Date & time picker:
  - Calendar component for date selection
  - Time slot selection for new time
- Validation:
  - New time must be in future
  - New time must not conflict with existing appointment
- Buttons:
  - "Reschedule" - submit new time
  - "Cancel" - close dialog without changes
- Loading state during submission
- Error messages displayed in-dialog
- Auto-closes on success

**Props**:
```ts
interface Props {
  appointmentId: string;
  currentDateTime: Date;
  onConfirm?: (newDateTime: Date) => Promise<void>;
  onCancel?: () => void;
}
```

---

### **Doctor Components** (`src/components/doctor/`)

#### **DoctorLayout.tsx**
**Purpose**: Shared layout wrapper for all doctor portal pages

**Features**:
- Sidebar + main content area using Sidebar component
- Role-based access control:
  - Redirects non-logged-in users to auth
  - Redirects non-doctors to home page
- Approval status handling:
  - Shows "Pending Approval" message if doctor not yet approved
  - Lists what doctors can do once approved
- Loading states during auth/role checks
- Error messages with action buttons

**Props**:
```ts
interface Props {
  children: ReactNode; // Page content
}
```

**Hooks**: `useAuth()`, `useIsDoctor()`, `useDoctorData()`, `useNavigate()`

**Protection**: 
- Checks if user is authenticated
- Checks if user has doctor role
- Checks if doctor is approved
- Redirects accordingly

---

#### **DoctorSidebar.tsx**
**Purpose**: Navigation sidebar for entire doctor portal

**Features**:
- Doctor information:
  - Name and specialty
  - Avatar (if available)
- Navigation links:
  - Dashboard (Overview)
  - Appointments
  - Availability
  - Profile
- Active link highlighting
- Mobile-friendly collapse/expand
- Uses Sidebar component from shadcn/ui

---

#### **AppointmentsList.tsx**
**Purpose**: Display doctor's appointments in table format

**Features**:
- Table view of all appointments
- Columns:
  - Patient name
  - Date and time
  - Status (Scheduled, Completed, Cancelled)
  - Actions (Confirm, Reschedule, Cancel)
- Filter tabs:
  - Upcoming
  - Completed
  - Cancelled
- Search by patient name
- Status badges with colors
- Action buttons:
  - Confirm appointment
  - Reschedule appointment
  - Cancel appointment with reason
- Pagination for large lists

**Integration**: Pulls data from `useDoctorData()` hook

---

#### **AvailabilityManager.tsx**
**Purpose**: Set and manage doctor availability schedule

**Features**:
- Weekly calendar view
- Add/remove availability slots
- Set time ranges:
  - Start time
  - End time
  - Slot duration (typically 30 min - 1 hour)
- Bulk edit options:
  - Apply same hours to multiple days
  - Copy Monday schedule to all weekdays
- Recurring schedules:
  - Same hours for Mon-Fri
  - Different hours for weekends
- Save/update functionality with API call
- Conflict detection (don't overlap slots)

**State Management**:
- Selected slots for editing
- Form data (start time, end time, duration)
- Loading state during save

---

#### **DoctorProfile.tsx**
**Purpose**: Display and edit doctor profile information

**Features**:
- Profile picture (avatar) upload
- Editable fields:
  - Full name
  - Email (display only)
  - Phone number
  - Specialty
  - Department
  - Bio
  - Professional credentials (MD, DO, etc)
- Edit mode with form
- Submit changes with validation
- Confirmation message on save
- Image preview before upload

---

### **Admin Components** (`src/components/admin/`)

#### **AdminStats.tsx**
**Purpose**: Dashboard statistics cards showing system overview

**Features**:
- Responsive grid of stat cards (6-7 cards):
  - **Total Users** (blue icon)
  - **Approved Doctors** (green icon) - `totalDoctors - pendingDoctors`
  - **Pending Doctors** (amber icon) - **highlighted if > 0**
  - **Total Appointments** (purple icon)
  - **Completed Appointments** (green icon)
  - **Cancelled Appointments** (red icon)
  - **Scheduled Appointments** (blue icon) - bonus stat

**Card Design**:
- Large bold number
- Color-coded background
- Icon with matching color
- Title label
- Grid adjusts: 2 cols mobile, 3 cols tablet, 6+ cols desktop

**Props**:
```ts
interface StatsProps {
  stats: {
    totalUsers: number;
    totalDoctors: number;
    pendingDoctors: number;
    totalAppointments: number;
    scheduledAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
  };
}
```

---

#### **UsersManager.tsx**
**Purpose**: Manage all platform users and their roles

**Features**:
- Table view of all users
- Columns:
  - Name (bold)
  - Phone number
  - Role (badge: Patient/Doctor/Admin)
  - Join date
  - Actions
- Search/filter by name (live filter)
- Change user role via dropdown:
  - Patient
  - Doctor
  - Admin
- Pagination for large user lists
- Loading states
- Delete user option (with confirmation)

**Props**:
```ts
interface Props {
  users: UserWithRole[];
  onUpdateRole: (userId: string, newRole: string) => Promise<void>;
}
```

**Interactions**:
- Click user role dropdown
- Select new role
- Updates immediately in database via `onUpdateRole` callback
- Toast notification on success/error

---

#### **DoctorsManager.tsx**
**Purpose**: Manage doctor registrations and approvals

**Features**:
- **Two modes** (via `mode` prop):

**Pending Mode** (awaiting approval):
- Shows only unapproved doctors
- Columns: Name, Specialty, Department, Email, Applied Date, Actions
- Action buttons:
  - ✅ **Approve** - moves doctor to approved, sends notification
  - ❌ **Reject** - removes doctor, sends rejection email
  - ⚙️ **Edit** - opens dialog to edit doctor info
  - 🗑️ **Delete** - removes doctor entirely

**Approved Mode** (active doctors):
- Shows only approved doctors
- Columns: Name, Specialty, Department, Email, Status, Actions
- Action buttons:
  - ✏️ **Edit** - edit doctor profile
  - 🚫 **Suspend** - temporarily disable doctor
  - 🗑️ **Delete** - remove doctor

**Additional Features**:
- **Add Doctor** button - manual doctor creation dialog
- **Edit Dialog** - form to update doctor:
  - Name
  - Specialty
  - Department
  - Bio
  - Avatar
- **Delete Confirmation** - AlertDialog to confirm deletion
- **Approve/Reject Confirmation** - secondary confirmation dialogs

**Props**:
```ts
interface Props {
  doctors: Doctor[];
  mode: "pending" | "approved";
  onDeleteDoctor: (doctorId: string) => Promise<void>;
  onAddDoctor: (doctorData: NewDoctor) => Promise<void>;
  onApproveDoctor: (doctorId: string) => Promise<void>;
  onRejectDoctor: (doctorId: string) => Promise<void>;
}
```

---

#### **DepartmentsOverview.tsx**
**Purpose**: View doctors organized by medical department

**Features**:
- Department cards showing:
  - Department name (bold heading)
  - Count of doctors in department
  - List of doctors:
    - Doctor name
    - Specialty
    - Status indicator
- Responsive card layout
- Filter/search by department name
- Only shows approved doctors
- Grouped by department (Cardiology, Neurology, etc)

**Props**:
```ts
interface Props {
  doctors: Doctor[]; // Approved doctors only
}
```

---

### **AI Assistant Components** (`src/components/assistant/`)

#### **AIChat.tsx**
**Purpose**: Interactive chatbot for health queries and department guidance

**Features**:
- **Chat Interface**:
  - Message thread UI with chat bubbles
  - User messages (blue, right-aligned)
  - Assistant responses (left-aligned with bot icon)
  - Timestamp for each message
  - Auto-scroll to latest message

- **Input Area**:
  - Text input field
  - Send button (with keyboard shortcut)
  - Placeholder text ("Ask me about your symptoms...")

- **Smart Features**:
  - **Emergency Detection**: Detects keywords like "emergency", "call 112" and highlights messages
  - **Department Suggestions**: Suggests relevant department based on keywords:
    - "chest pain" → Cardiology
    - "headache" → Neurology
    - "broken bone" → Orthopedics
    - etc.
  - **Rate Limiting**: Handles 429 errors gracefully
  - **Error Handling**: Displays error messages if AI fails

- **Safety Disclaimer**:
  - Warning message: "I cannot provide medical advice or diagnoses"
  - Suggestion to call 112 for emergencies
  - Always recommends consulting with real doctors

**State Management**:
- Messages array (with id, role, content, timestamp)
- Input value
- Loading flag
- Error state

**API Integration**:
- Calls `/functions/v1/ai-assistant` edge function
- Sends message history for context
- Streams responses (reads text incrementally)
- Uses Bearer token authentication

**Props**: None (standalone component)

**Hooks**: `useToast()`, `useAuth()`

---

### **UI Components** (`src/components/ui/`)

Pre-built shadcn/ui components (40+ components - all styled with Tailwind CSS):

**Form Components**:
- `input` - Text input field
- `label` - Form labels
- `form` - React Hook Form wrapper
- `select` - Dropdown select
- `checkbox` - Checkbox input
- `radio-group` - Radio button groups
- `textarea` - Multi-line text

**Dialog Components**:
- `dialog` - Modal dialog
- `alert-dialog` - Confirmation dialog
- `drawer` - Side drawer (especially mobile)
- `popover` - Floating popover menu

**Navigation**:
- `button` - Action buttons with variants
- `navigation-menu` - Nav menu structure
- `breadcrumb` - Breadcrumb navigation
- `menubar` - Top menu bar

**Feedback**:
- `toast` - Toast notifications
- `sonner` - Alternative toast library
- `alert` - Alert boxes
- `badge` - Status badges
- `progress` - Progress bars

**Data Display**:
- `table` - Data tables with sorting, pagination
- `pagination` - Pagination controls
- `scroll-area` - Scrollable container
- `card` - Content card container
- `accordion` - Collapsible sections
- `tabs` - Tabbed interface

**Specialized**:
- `calendar` - Date picker calendar
- `carousel` - Image carousel
- `aspect-ratio` - Maintains aspect ratio
- `hover-card` - Hover tooltip
- `resizable` - Resizable panels

All components support dark mode and are fully accessible with keyboard navigation.

---

## 🪝 Custom Hooks

### **useAuth.tsx**
**Purpose**: Global authentication context and state management

**Exports**:
- `AuthProvider` - Context provider wrapping app
- `useAuth()` - Hook to access auth state

**Features**:
- User state (User | null)
- Session state (Session | null)
- Loading state
- Methods:
  - `signUp(email, password, fullName, role, phone?, doctorData?)` - Register new account
  - `signIn(email, password)` - Login
  - `signOut()` - Logout
- Auth state change listener (Supabase)
- Dev mode support:
  - `VITE_DEV_FORCE_AUTH=true` - Skip auth checks
  - `VITE_DEV_USER_ID` - Dev user ID
  - `VITE_DEV_USER_EMAIL` - Dev user email

**Integration**: Wraps entire app in `App.tsx`, provides auth state to all components

---

### **useBooking.tsx**
**Purpose**: Orchestrate appointment booking flow

**Features**:
- Fetches doctors filtered by department
- Fetches available time slots filtered by doctor
- `createAppointment(appointmentData)` - Submit appointment booking
- Loading and error states
- Validates user is authenticated
- Returns error details

**State**:
- `doctors` - Array of doctors for selected department
- `timeSlots` - Available slots for selected doctor
- `loading` - Loading state
- `submitting` - Submission state

**Dependencies**:
- Department ID - triggers doctors fetch
- Doctor ID - triggers slots fetch

---

### **usePatientData.tsx**
**Purpose**: Fetch patient-specific data and profile

**Features**:
- Fetches patient appointments
- Fetches patient profile info
- Refetch capability
- Real-time updates via subscriptions

**State**:
- `appointments` - Patient's appointments
- `patient` - Patient profile
- `loading` - Loading state

---

### **useDoctorData.tsx**
**Purpose**: Fetch doctor-specific data and enable updates

**Features**:
- Fetches doctor profile
- Fetches doctor appointments
- Fetches doctor availability slots
- `updateProfile(updatedData)` - Update doctor info
- `setAvailability(slots)` - Set availability schedule
- Real-time subscriptions

**State**:
- `doctor` - Doctor profile
- `appointments` - Doctor's appointments
- `availability` - Doctor's available slots
- `loading` - Loading state

---

### **useAdminData.tsx**
**Purpose**: Fetch admin dashboard data and manage system

**Features**:
- Fetches all users with roles
- Fetches all doctors with approval status
- Calculates statistics:
  - Total users, total doctors, pending doctors
  - Appointment stats (scheduled, completed, cancelled)
- Methods:
  - `updateUserRole(userId, newRole)` - Change user role
  - `approveDoctor(doctorId)` - Approve pending doctor
  - `rejectDoctor(doctorId)` - Reject pending doctor
  - `deleteDoctor(doctorId)` - Remove doctor
  - `addDoctor(doctorData)` - Create new doctor manually
- Data aggregation and complex filtering

**State**:
- `users` - All users with roles
- `doctors` - All doctors with approval status
- `stats` - Calculated statistics
- `loading` - Loading state

---

### **useIsDoctor.tsx**
**Purpose**: Check if current user has doctor role

**Returns**:
```ts
{
  isDoctor: boolean;
  loading: boolean;
}
```

**Logic**: Queries `user_roles` table for "doctor" role

---

### **useIsAdmin.tsx**
**Purpose**: Check if current user has admin role

**Returns**:
```ts
{
  isAdmin: boolean;
  loading: boolean;
}
```

**Logic**: Queries `user_roles` table for "admin" role

**Dev Mode**: Supports `VITE_FORCE_ADMIN=true` to force admin status

---

### **use-mobile.tsx**
**Purpose**: Detect if viewport is mobile-sized

**Returns**: `boolean` - true if screen width < 768px

**Usage**: Responsive design decisions, show/hide elements on mobile

```tsx
const isMobile = useMobile();
return isMobile ? <MobileLayout /> : <DesktopLayout />;
```

---

### **use-toast.ts**
**Purpose**: Toast notification system

**Returns**:
```ts
{
  toast: (props: ToastProps) => void;
}
```

**Features**:
- Title and description
- Variant (default, destructive)
- Duration
- Action button (optional)

**Integration**: Uses both radix-ui and Sonner libraries

---

## 🔧 Utilities & Helpers

### **lib/logger.ts**
- **Purpose**: Consistent error and info logging
- **Methods**:
  - `logger.error(message, error?)` - Log errors
  - `logger.info(message, data?)` - Log info
  - `logger.warn(message, data?)` - Log warnings
- **Integration**: Logs to console in dev, extensible for error tracking services

### **lib/utils.ts**
- **Purpose**: Common utility functions
- **Functions**:
  - `cn()` - Classname merger (Tailwind utility)
  - Date formatting utilities
  - Type helpers

### **integrations/supabase/client.ts**
- **Purpose**: Supabase client initialization
- **Features**:
  - Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
  - Configuration:
    - localStorage auth persistence
    - Auto-token refresh
  - **Dev stub mode**: If `VITE_NO_BACKEND=true`, creates mock Supabase client for frontend-only development
- **Exports**: `supabase` - initialized and ready-to-use client

### **integrations/supabase/types.ts**
- Auto-generated TypeScript types from database schema
- Ensures type-safe database queries
- Updated when migration files run

---

## 🗄️ Database (Supabase)

### **Key Tables**

| Table | Purpose |
|-------|---------|
| `auth.users` | Supabase built-in user authentication |
| `profiles` | User profile info (name, phone, avatar_url) |
| `user_roles` | Role assignments (user_id, role: patient/doctor/admin) |
| `doctors` | Doctor-specific data (specialty, department, bio, is_approved, avatar_url) |
| `appointments` | Appointment bookings (date_time, status, doctor_id, patient_id) |
| `availability` | Doctor availability slots (day, start_time, end_time) |
| `departments` | Medical department definitions |

### **Migrations**
- 4 migration files in `supabase/migrations/`:
  1. Initial schema setup with all tables
  2. Additional tables/indexes and constraints
  3. Auth triggers and RLS policies
  4. Performance optimizations
- Managed via Supabase CLI

### **Edge Functions**

#### **ai-assistant**
- **Endpoint**: `/functions/v1/ai-assistant`
- **Auth**: Public (no JWT required)
- **Purpose**: AI-powered health chatbot responses
- **Input**: Chat message history
- **Output**: AI-generated text response with department suggestions
- **Tech**: Likely uses OpenAI API or Claude API for LLM

#### **send-appointment-email**
- **Endpoint**: `/functions/v1/send-appointment-email`
- **Auth**: JWT required (protected)
- **Purpose**: Send email notifications for appointment confirmations/changes
- **Triggers**: When appointment is created/updated/cancelled
- **Output**: Email sent to patient and doctor emails
- **Content**: Appointment details, doctor info, cancellation reasons

---

## 🛠️ Development Patterns

### **Type Safety**
- Full TypeScript across entire codebase
- Auto-generated database types from schema
- React Hook Form with Zod for validation
- Component prop types strictly defined

### **State Management Strategy**
```
┌─ React Query (Server State)
│  ├─ Appointments, Doctors, Availability
│  ├─ Automatic caching & refetching
│  └─ Disable with VITE_NO_BACKEND=true
│
└─ React Context (Session State)
   ├─ Auth (user, session, loading)
   └─ UI (toasts, theme)
```

### **Error Handling**
- `useToast()` for user-facing error messages
- `logger.*()` for application logging
- Try-catch blocks in async hooks
- User-friendly error messages

### **Responsive Design**
- Tailwind responsive classes (`sm:`, `md:`, `lg:`, `xl:`)
- Mobile-first approach
- `use-mobile` hook for logic-based decisions
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px

### **Animations**
- Framer Motion for page transitions and interactions
- Smooth, performant animations (GPU accelerated)
- Skeleton loaders while fetching
- Used in:
  - Auth page role switching
  - Booking wizard step transitions
  - Menus and dropdowns
  - Loading states

### **Dev Mode**
Environment variables for development:
- `VITE_DEV_FORCE_AUTH=true` - Skip auth checks, force logged-in state
- `VITE_NO_BACKEND=true` - Use mock Supabase client for frontend-only work
- `VITE_FORCE_ADMIN=true` - Force admin role
- `VITE_DEV_USER_ID` - Override dev user ID
- `VITE_DEV_USER_EMAIL` - Override dev user email

---

## 📝 Environment Variables

```env
# Supabase (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Development Mode (optional)
VITE_DEV_FORCE_AUTH=false
VITE_NO_BACKEND=false
VITE_FORCE_ADMIN=false
VITE_DEV_USER_ID=dev-uid-jkalu
VITE_DEV_USER_EMAIL=jkalu2212@example.com
```

Set in `.env.local` file or `.env` file (gitignored).

---

## 🎯 Architecture Highlights

✅ **Type-Safe**: Full TypeScript with Zod validation  
✅ **Real-time**: Supabase subscriptions for live appointments  
✅ **Scalable**: Component-driven, hook-based logic  
✅ **Accessible**: Radix UI primitives, keyboard navigation, ARIA labels  
✅ **Performant**: Vite + React SWC, code splitting, lazy loading  
✅ **DX**: Hot module reload, auto-generated database types  
✅ **Dark Mode**: Theme switching with next-themes  
✅ **Mobile-First**: Responsive design, touch-friendly UI  
✅ **Errors**: Comprehensive error handling and logging

---

## 🚀 Deployment

1. **Build**: `npm run build` → Creates optimized bundle in `dist/`
2. **Deploy**: Push to git → Auto-deploys via Lovable OR manual Vercel/Netlify
3. **Supabase**: Database scales automatically, edge functions deployed via CLI

---

## 📞 Support & Troubleshooting

**If the app doesn't work:**
1. ✅ Check `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
2. ✅ Check browser console for errors
3. ✅ Check Supabase dashboard (Tables, Auth, Edge Functions tabs)
4. ✅ Verify user roles are set in `user_roles` table
5. ✅ For doctors: Check `is_approved` flag in `doctors` table
6. ✅ Try `VITE_NO_BACKEND=true` for frontend-only development

---

**Built with ❤️ using React, TypeScript, Tailwind CSS, and Supabase**
