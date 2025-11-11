-- Create audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by VARCHAR(255),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address INET
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_audit_logs_enrollment ON public.audit_logs(enrollment_id);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read for audit logs (optional - may want to restrict)
CREATE POLICY "Anyone can view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (true);
