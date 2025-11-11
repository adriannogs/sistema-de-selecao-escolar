-- Migration script to add new fields for the updated enrollment form structure
-- This adds fields for 6th-8th grade schools, competition types, and parent/responsible information

-- Add new columns for 6th, 7th, 8th grade school information
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS school_6th_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS school_6th_network VARCHAR(20),
ADD COLUMN IF NOT EXISTS school_7th_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS school_7th_network VARCHAR(20),
ADD COLUMN IF NOT EXISTS school_8th_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS school_8th_network VARCHAR(20);

-- Add competition type fields (multiple checkboxes)
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS competition_public_school BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS competition_private_school BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS competition_lives_in_neighborhood BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS competition_pcd BOOLEAN DEFAULT false;

-- Add parent information fields
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS father_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS father_rg VARCHAR(20),
ADD COLUMN IF NOT EXISTS father_cpf VARCHAR(14),
ADD COLUMN IF NOT EXISTS father_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS mother_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS mother_rg VARCHAR(20),
ADD COLUMN IF NOT EXISTS mother_cpf VARCHAR(14),
ADD COLUMN IF NOT EXISTS mother_phone VARCHAR(20);

-- Add responsible person fields
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS responsible_type VARCHAR(20), -- 'pai', 'mae', 'outros'
ADD COLUMN IF NOT EXISTS other_responsible_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS other_responsible_relationship VARCHAR(100),
ADD COLUMN IF NOT EXISTS other_responsible_rg VARCHAR(20),
ADD COLUMN IF NOT EXISTS other_responsible_cpf VARCHAR(14),
ADD COLUMN IF NOT EXISTS other_responsible_phone VARCHAR(20);

-- Add WhatsApp field
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS phone_whatsapp VARCHAR(20);

-- Add constraints for competition type (at least one must be selected)
-- Note: This is a soft constraint, validation will be done in the application layer

COMMENT ON COLUMN enrollments.school_6th_name IS 'Nome da escola onde cursou o 6º ano';
COMMENT ON COLUMN enrollments.school_6th_network IS 'Rede de ensino do 6º ano (Pública/Privada)';
COMMENT ON COLUMN enrollments.school_7th_name IS 'Nome da escola onde cursou o 7º ano';
COMMENT ON COLUMN enrollments.school_7th_network IS 'Rede de ensino do 7º ano (Pública/Privada)';
COMMENT ON COLUMN enrollments.school_8th_name IS 'Nome da escola onde cursou o 8º ano';
COMMENT ON COLUMN enrollments.school_8th_network IS 'Rede de ensino do 8º ano (Pública/Privada)';
COMMENT ON COLUMN enrollments.competition_public_school IS 'Tipo de concorrência: Escola Pública';
COMMENT ON COLUMN enrollments.competition_private_school IS 'Tipo de concorrência: Escola Privada';
COMMENT ON COLUMN enrollments.competition_lives_in_neighborhood IS 'Tipo de concorrência: Mora no bairro da escola';
COMMENT ON COLUMN enrollments.competition_pcd IS 'Tipo de concorrência: PCD';
COMMENT ON COLUMN enrollments.responsible_type IS 'Tipo de responsável pela educação: pai, mae, outros';
