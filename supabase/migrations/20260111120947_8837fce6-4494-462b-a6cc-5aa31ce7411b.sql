-- Add approval status to doctors table
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;

-- Add index for faster filtering
CREATE INDEX IF NOT EXISTS idx_doctors_is_approved ON public.doctors(is_approved);

-- Comment for documentation
COMMENT ON COLUMN public.doctors.is_approved IS 'Whether the doctor has been approved by an admin to access the platform';