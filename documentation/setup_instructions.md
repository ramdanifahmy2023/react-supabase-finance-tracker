# Setup Instructions for Finance Tracker

## Prerequisites
- Node.js 18+ installed
- Supabase account (https://supabase.com)

## Step 1: Clone and Install Dependencies
```bash
npm install
```

## Step 2: Set up Supabase Database
1. Create a new project in Supabase Dashboard
2. Go to the SQL Editor in your Supabase project
3. Copy and run the SQL commands from `supabase-schema.sql` file
4. This will create:
   - `profiles` table for user roles and company information
   - `categories` table for transaction categories
   - `transactions` table for financial data
   - Row Level Security (RLS) policies
   - Default categories for income and expenses

## Step 3: Configure Environment Variables
1. Get your Supabase URL and anon key from the Supabase Dashboard:
   - Go to Project Settings → API
   - Copy the Project URL and anon public key
2. Create a `.env.local` file in the root directory
3. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Enable Authentication in Supabase
1. Go to Authentication → Settings in Supabase Dashboard
2. Ensure "Enable email confirmations" is ON (recommended)
3. Configure your site URL and redirect URLs
4. Add your development URL (e.g., http://localhost:5173) to the redirect URLs

## Step 5: Start the Development Server
```bash
npm run dev
```

## Step 6: Create First User and Assign SuperAdmin Role
After running the application:
1. Register a new user account
2. Go to Supabase Dashboard → Authentication → Users
3. Find your user and copy their ID
4. Go to the SQL Editor and run:
```sql
UPDATE profiles
SET role = 'superadmin'
WHERE user_id = 'your-user-id-here';
```

## Features Implemented

### Authentication System
- Email/password authentication
- Role-based access control (Super Admin, Leader, Staff)
- Protected routes
- User registration with email verification
- Password reset functionality

### Database Schema
- **Profiles**: User roles (superadmin, leader, staff) and company info
- **Categories**: Income and expense categories
- **Transactions**: Financial transactions with amounts, dates, and descriptions
- Row Level Security (RLS) for data protection

### Role Permissions
- **Super Admin**: Full access to all data and user management
- **Leader**: Can view all team data and manage transactions
- **Staff**: Can only access their own transactions

## Next Steps
The basic authentication and database setup is complete. The next tasks will implement:
1. Transaction management system (CRUD operations)
2. Dashboard with financial analytics
3. Enhanced role-based features
4. Data export and reporting capabilities

## Development Notes
- The application uses React Query for data fetching and caching
- React Hook Form with Zod validation for form handling
- shadcn/ui components for consistent UI design
- TypeScript for type safety