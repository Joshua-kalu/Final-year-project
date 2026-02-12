-- Fix 1: Add policies so doctors can view their patients' profiles
-- This allows doctors to see patient names in appointment lists
CREATE POLICY "Doctors can view their patients profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.appointments
    INNER JOIN public.doctors ON doctors.id = appointments.doctor_id
    WHERE appointments.patient_id = profiles.user_id
    AND doctors.user_id = auth.uid()
  )
);

-- Fix 2: Add policy so admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix 3: Add INSERT policy for doctor self-registration during signup
CREATE POLICY "Users can create their own doctor profile"
ON public.doctors FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Fix 4: Add explicit denial for unauthenticated users on appointments
-- (RLS already restricts to authenticated users via TO authenticated, but let's ensure all policies specify this)
-- The existing policies already use RESTRICTIVE mode which means all must pass

-- Fix 5: Add explicit denial for unauthenticated users on user_roles
-- Already covered by restrictive policies that only allow own roles or admin access

-- Note: All tables already have RLS enabled and use RESTRICTIVE policies
-- This means unauthenticated users are denied by default