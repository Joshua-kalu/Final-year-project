-- Fix profiles table: restrict SELECT to own profile only (contains PII like phone numbers)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add DELETE policy for profiles (GDPR compliance)
CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Fix doctors table: only show approved doctors to public, admins see all
DROP POLICY IF EXISTS "Anyone can view doctors" ON public.doctors;
CREATE POLICY "Public can view approved doctors"
ON public.doctors FOR SELECT
USING (is_approved = true OR has_role(auth.uid(), 'admin'::app_role));

-- Add DELETE policies for appointments
CREATE POLICY "Patients can delete their own non-completed appointments"
ON public.appointments FOR DELETE
TO authenticated
USING (patient_id = auth.uid() AND status != 'completed');

CREATE POLICY "Doctors can delete their appointments"
ON public.appointments FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.doctors
    WHERE doctors.id = appointments.doctor_id
    AND doctors.user_id = auth.uid()
  )
  AND status != 'completed'
);

CREATE POLICY "Admins can delete any appointment"
ON public.appointments FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));