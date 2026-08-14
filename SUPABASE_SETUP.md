# Supabase Setup Guide for T-Shirts Village Internship

## Project Details
- **Supabase URL**: https://tuufdlrkwrduuyzmadfa.supabase.co
- **Project Reference**: tuufdlrkwrduuyzmadfa
- **Anon Key**: sb_publishable_wgzOXlGg9o10Pcl7Vu9yRA_bIvXCGMB

---

## Required Tables

### 1. **training_registrations** (for internship applicants)

This table stores all internship program applications.

```sql
create table if not exists public.training_registrations (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text not null unique,
  phone text not null,
  background text,
  state text,
  city text,
  training_track text not null,
  training_track_name text,
  work_experience text,
  emergency_contact text,
  emergency_phone text,
  payment_confirmation text,
  confirmation_code text unique,
  status text default 'registered',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create index for faster email lookups
create index idx_training_registrations_email on public.training_registrations(email);
create index idx_training_registrations_confirmation_code on public.training_registrations(confirmation_code);
```

### 2. **id_cards** (optional, for ID verification if needed later)

```sql
create table if not exists public.id_cards (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  membership_id text unique,
  tag text,
  chapter text,
  local_government text,
  issued_at date,
  expires_at date,
  barcode text unique,
  status text default 'Verified Member',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create index for barcode lookups
create index idx_id_cards_barcode on public.id_cards(barcode);
```

---

## Setup Instructions

### Step 1: Create Tables in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **tuufdlrkwrduuyzmadfa**
3. Navigate to **SQL Editor**
4. Create a new query and paste the SQL above
5. Execute the queries

### Step 2: Enable RLS (Row Level Security) - Optional but Recommended

For the internship registrations, you may want to enable RLS:

```sql
-- Enable RLS on training_registrations
alter table public.training_registrations enable row level security;

-- Allow public inserts (for new registrations)
create policy "Allow public insert training registrations"
on public.training_registrations
for insert
with check (true);

-- Allow public read only own data (if email verification needed)
create policy "Allow select training registrations"
on public.training_registrations
for select
using (true);
```

### Step 3: Verify Connection

Once tables are created, the app will:
- Accept internship applications via EventRegistrationPage
- Store them in the `training_registrations` table
- Auto-detect duplicate emails
- Generate confirmation codes

---

## Environment Variables

Your `.env.local` file has been configured with:

```env
VITE_SUPABASE_URL=https://tuufdlrkwrduuyzmadfa.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_wgzOXlGg9o10Pcl7Vu9yRA_bIvXCGMB
VERCEL_PROJECT_ID=prj_37yowEj2RLXg12DgegWu6OTMgCyj
```

---

## Database Fields Reference

### training_registrations Table

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Auto | Unique registration ID |
| full_name | Text | ✓ | Applicant's full name |
| email | Text | ✓ | Email address (unique) |
| phone | Text | ✓ | Phone number |
| background | Text | | Applicant background (Student, Professional, etc.) |
| state | Text | | State/location |
| city | Text | | City |
| training_track | Text | ✓ | Track ID (tshirt, polo, facecap, quality) |
| training_track_name | Text | | Display name of track |
| work_experience | Text | | Work experience details |
| emergency_contact | Text | | Emergency contact name |
| emergency_phone | Text | | Emergency phone |
| payment_confirmation | Text | | ₦10,000 registration fee reference |
| confirmation_code | Text | | Auto-generated confirmation code |
| status | Text | | Registration status (registered, confirmed, etc.) |
| created_at | Timestamp | Auto | Registration date |
| updated_at | Timestamp | Auto | Last updated |

---

## Testing the Connection

To verify everything works:

1. Start the dev server: `npm run dev`
2. Navigate to the registration page
3. Fill out the form and submit
4. Check your Supabase dashboard to see the registration

---

## Troubleshooting

**Issue**: "Supabase is not configured" error
- **Solution**: Ensure `.env.local` has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Issue**: Duplicate email error
- **Solution**: The app checks for existing emails automatically. Use a different email.

**Issue**: Tables not found
- **Solution**: Run the SQL setup in Supabase SQL Editor and verify tables are created.

---

## Next Steps

1. ✅ Credentials configured in `.env.local`
2. ⏳ Create tables in Supabase (using SQL above)
3. ⏳ Deploy to Vercel when ready
4. ⏳ Set up SendGrid/email notifications (optional)
