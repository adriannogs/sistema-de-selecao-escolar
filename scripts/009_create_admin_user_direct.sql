-- Script para criar o usuário administrador diretamente no Supabase Auth
-- Execute este script no SQL Editor do Supabase Dashboard

-- Primeiro, vamos criar o usuário no auth.users
-- IMPORTANTE: Substitua 'your-project-jwt-secret' pelo JWT_SECRET do seu projeto Supabase

DO $$
DECLARE
  user_id uuid;
  encrypted_password text;
  user_exists boolean;
  enrollment_user_exists boolean;
BEGIN
  -- Verificar se o usuário já existe no auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'adriannogs@gmail.com'
  ) INTO user_exists;
  
  IF user_exists THEN
    RAISE NOTICE 'Usuário já existe no auth.users';
    -- Pegar o ID do usuário existente
    SELECT id INTO user_id FROM auth.users WHERE email = 'adriannogs@gmail.com';
  ELSE
    -- Gerar um UUID para o usuário
    user_id := gen_random_uuid();
    
    -- Criar senha criptografada usando crypt do pgcrypto
    -- A senha será: 14169182
    encrypted_password := crypt('14169182', gen_salt('bf'));
    
    -- Removed ON CONFLICT since auth.users doesn't have unique constraint on email
    -- Inserir o usuário na tabela auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      confirmation_token,
      email_change_token_new,
      recovery_token
    ) VALUES (
      user_id,
      '00000000-0000-0000-0000-000000000000',
      'adriannogs@gmail.com',
      encrypted_password,
      NOW(), -- Email já confirmado
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Administrador Principal"}',
      false,
      'authenticated',
      'authenticated',
      '',
      '',
      ''
    );
    
    RAISE NOTICE 'Usuário criado no auth.users';
  END IF;
  
  -- Check if user exists in enrollment_users before inserting
  SELECT EXISTS (
    SELECT 1 FROM enrollment_users WHERE email = 'adriannogs@gmail.com'
  ) INTO enrollment_user_exists;
  
  IF enrollment_user_exists THEN
    -- Update existing user
    UPDATE enrollment_users 
    SET 
      id = user_id,
      role = 'admin',
      is_active = true,
      updated_at = NOW()
    WHERE email = 'adriannogs@gmail.com';
    
    RAISE NOTICE 'Usuário atualizado em enrollment_users';
  ELSE
    -- Inserir na tabela enrollment_users
    INSERT INTO enrollment_users (
      id,
      email,
      full_name,
      role,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      user_id,
      'adriannogs@gmail.com',
      'Administrador Principal',
      'admin',
      true,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Usuário criado em enrollment_users';
  END IF;
  
  RAISE NOTICE 'Usuário administrador configurado com sucesso!';
  RAISE NOTICE 'Email: adriannogs@gmail.com';
  RAISE NOTICE 'Senha: 14169182';
  RAISE NOTICE 'ID: %', user_id;
END $$;
