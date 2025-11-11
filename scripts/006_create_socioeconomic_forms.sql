-- Create socioeconomic forms table
CREATE TABLE IF NOT EXISTS public.socioeconomic_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  
  -- Renda Familiar
  family_income VARCHAR(50),
  number_of_residents INTEGER,
  
  -- Moradia
  housing_type VARCHAR(50), -- Própria, Alugada, Cedida, etc.
  housing_conditions VARCHAR(50), -- Boa, Regular, Precária
  
  -- Serviços Básicos
  has_electricity BOOLEAN DEFAULT true,
  has_water BOOLEAN DEFAULT true,
  has_sewage BOOLEAN DEFAULT true,
  has_internet BOOLEAN DEFAULT false,
  
  -- Transporte
  transportation_type VARCHAR(100), -- Ônibus, Carro próprio, A pé, etc.
  
  -- Benefícios Sociais
  receives_bolsa_familia BOOLEAN DEFAULT false,
  receives_other_benefits BOOLEAN DEFAULT false,
  other_benefits_description TEXT,
  
  -- Saúde
  has_health_insurance BOOLEAN DEFAULT false,
  health_insurance_type VARCHAR(100),
  has_special_needs BOOLEAN DEFAULT false,
  special_needs_description TEXT,
  
  -- Educação dos Pais/Responsáveis
  guardian1_education VARCHAR(100),
  guardian1_occupation VARCHAR(100),
  guardian2_education VARCHAR(100),
  guardian2_occupation VARCHAR(100),
  
  -- Observações
  additional_info TEXT,
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_socioeconomic_enrollment ON public.socioeconomic_forms(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_socioeconomic_created_at ON public.socioeconomic_forms(created_at);

-- Enable RLS
ALTER TABLE public.socioeconomic_forms ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can manage socioeconomic forms"
  ON public.socioeconomic_forms
  FOR ALL
  USING (true);
