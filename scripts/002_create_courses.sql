-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  code VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Insert default courses for 2026
INSERT INTO public.courses (name, description, code, active) VALUES
  ('Análise e Desenvolvimento de Sistemas', 'Desenvolvimento de sistemas de software', 'ADS', true),
  ('Redes de Computadores', 'Infraestrutura e administração de redes', 'RDC', true),
  ('Gestão Financeira', 'Gestão administrativa e financeira', 'GF', true),
  ('Eletrônica Industrial', 'Eletrônica aplicada à indústria', 'EI', true)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Anyone can view courses"
  ON public.courses
  FOR SELECT
  USING (true);
