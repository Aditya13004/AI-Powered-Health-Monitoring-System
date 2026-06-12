-- ==========================================
-- Supabase Schema for Appointments Module
-- ==========================================

-- 1. Create the patients table
CREATE TABLE public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Note: The existing Appointment UI expects 'first_name' and 'last_name' for patient display, 
-- but the prompt requested 'full_name'. I will include 'first_name' and 'last_name' to match UI 
-- (which uses `patient.first_name` and `patient.last_name`). We'll add 'full_name' for completeness.
ALTER TABLE public.patients ADD COLUMN full_name TEXT;

-- 2. Create the appointments table
CREATE TABLE public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_type TEXT NOT NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    doctor_name TEXT,
    department TEXT,
    notes TEXT,
    status TEXT DEFAULT 'scheduled'::text,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 4. Create Security Policies for patients
-- Allow authenticated users to insert their own patients
CREATE POLICY "Allow users to insert their own patients" 
ON public.patients FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to read their own patients
CREATE POLICY "Allow users to read their own patients" 
ON public.patients FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow authenticated users to update their own patients
CREATE POLICY "Allow users to update their own patients" 
ON public.patients FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own patients
CREATE POLICY "Allow users to delete their own patients" 
ON public.patients FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 5. Create Security Policies for appointments
-- Allow authenticated users to insert their own appointments
CREATE POLICY "Allow users to insert their own appointments" 
ON public.appointments FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to read their own appointments
CREATE POLICY "Allow users to read their own appointments" 
ON public.appointments FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow authenticated users to update their own appointments
CREATE POLICY "Allow users to update their own appointments" 
ON public.appointments FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own appointments
CREATE POLICY "Allow users to delete their own appointments" 
ON public.appointments FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 6. Enable Realtime for the appointments table (Optional, for instant UI updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
