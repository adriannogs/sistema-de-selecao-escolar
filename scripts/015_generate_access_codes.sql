-- Generate 2000 unique access codes for enrollment
-- Format: EP26-XXXX-XXXX (where X is alphanumeric)

-- Function to generate a random alphanumeric string
CREATE OR REPLACE FUNCTION generate_random_code() RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluding similar looking characters
  result TEXT := 'EP26-';
  i INTEGER;
BEGIN
  -- Generate first 4 characters
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  
  result := result || '-';
  
  -- Generate last 4 characters
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Generate 2000 unique codes
DO $$
DECLARE
  code_text TEXT;
  inserted_count INTEGER := 0;
  max_attempts INTEGER := 3000; -- Try up to 3000 times to get 2000 unique codes
  attempt_count INTEGER := 0;
BEGIN
  WHILE inserted_count < 2000 AND attempt_count < max_attempts LOOP
    code_text := generate_random_code();
    attempt_count := attempt_count + 1;
    
    -- Try to insert, ignore if duplicate
    BEGIN
      -- Updated column names from English to Portuguese (code -> codigo, used -> utilizada)
      INSERT INTO access_codes (codigo, utilizada, created_at)
      VALUES (code_text, false, NOW());
      
      inserted_count := inserted_count + 1;
      
      -- Log progress every 100 codes
      IF inserted_count % 100 = 0 THEN
        RAISE NOTICE 'Generated % codes...', inserted_count;
      END IF;
      
    EXCEPTION WHEN unique_violation THEN
      -- Code already exists, try again
      CONTINUE;
    END;
  END LOOP;
  
  RAISE NOTICE 'Successfully generated % unique access codes', inserted_count;
END $$;

-- Clean up the function
DROP FUNCTION IF EXISTS generate_random_code();

-- Show statistics
-- Updated column name from 'used' to 'utilizada'
SELECT 
  COUNT(*) as total_codes,
  COUNT(*) FILTER (WHERE utilizada = false) as unused_codes,
  COUNT(*) FILTER (WHERE utilizada = true) as used_codes
FROM access_codes;
