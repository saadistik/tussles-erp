# 🚀 Quick Setup Guide - Fix "Invalid User Role"

## Problem
You logged into Supabase successfully, but the app shows "Invalid User Role" because your account doesn't exist in the `public.users` table with a role assigned.

## Solution: Add Your Account to the Database

### Option 1: Using Supabase Dashboard (EASIEST)

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project: `xueopsqhkcjnefttiucs`

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Run This Query** (paste and execute):
   ```sql
   -- Check your current logged-in user
   SELECT auth.uid() as my_id, auth.email() as my_email;
   ```

4. **Copy the UUID from the result** (looks like: `123e4567-e89b-12d3-a456-426614174000`)

5. **Insert Your User with Owner Role**:
   ```sql
   INSERT INTO public.users (id, email, full_name, role) VALUES
   ('PASTE-YOUR-UUID-HERE', 'your-email@example.com', 'Your Name', 'owner');
   ```

6. **Refresh the frontend** (http://localhost:5174) and you should now see the Owner Dashboard!

---

### Option 2: Create Multiple Test Users

1. **Create Auth Users First**
   - Go to: Authentication > Users > "Add User" button
   - Create these accounts:
     - `employee@tussles.com` / `password123`
     - `owner@tussles.com` / `password123`

2. **Get Their Auth IDs**
   ```sql
   SELECT id, email FROM auth.users;
   ```

3. **Insert into public.users table**:
   ```sql
   INSERT INTO public.users (id, email, full_name, role) VALUES
   ('employee-uuid-from-step-2', 'employee@tussles.com', 'Test Employee', 'employee'),
   ('owner-uuid-from-step-2', 'owner@tussles.com', 'Test Owner', 'owner');
   ```

---

### Option 3: Auto-Populate on Signup (For Future Users)

Run this in Supabase SQL Editor to automatically create user records:

```sql
-- Trigger to auto-create public.users record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, 'User', 'employee');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Verify It Works

1. **Logout** from the app
2. **Login** with your credentials
3. You should now see:
   - **Owner role** → Owner Dashboard (financial stats, approval queue)
   - **Employee role** → Employee Dashboard (create orders)

---

## Create Sample Companies (Optional)

After logging in as employee, you can add companies via the dashboard. Or run this SQL:

```sql
INSERT INTO public.companies (name, contact_person, phone, email, address, created_by) VALUES
('ABC Traders', 'John Doe', '0300-1234567', 'john@abc.com', 'Karachi', auth.uid()),
('XYZ Corporation', 'Jane Smith', '0321-9876543', 'jane@xyz.com', 'Lahore', auth.uid());
```

---

## System URLs

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3000
- **Supabase Dashboard**: https://supabase.com/dashboard/project/xueopsqhkcjnefttiucs

---

## Need Help?

If you're still seeing errors:
1. Check browser console (F12) for error messages
2. Check backend-nodejs terminal for API errors
3. Verify backend is running on port 3000
