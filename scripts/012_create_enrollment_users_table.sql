-- Create enrollment_users table for authentication
CREATE TABLE IF NOT EXISTS public.enrollment_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operator',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.enrollment_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage enrollment users"
    ON public.enrollment_users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.enrollment_users
            WHERE email = auth.jwt() ->> 'email'
            AND role = 'admin'
            AND is_active = true
        )
    );

CREATE POLICY "Users can view their own data"
    ON public.enrollment_users
    FOR SELECT
    USING (email = auth.jwt() ->> 'email');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_enrollment_users_email ON public.enrollment_users(email);
CREATE INDEX IF NOT EXISTS idx_enrollment_users_active ON public.enrollment_users(is_active);

-- Insert the main admin user (will be created in Supabase Auth separately)
INSERT INTO public.enrollment_users (email, full_name, role, is_active)
VALUES ('adriannogs@gmail.com', 'Administrador Principal', 'admin', true)
ON CONFLICT (email) DO NOTHING;
