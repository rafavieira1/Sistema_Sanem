
-- Criar enum para os tipos de usuário
CREATE TYPE user_role_enum AS ENUM ('superadmin', 'admin', 'voluntario');

-- Criar tabela de usuários
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role_enum NOT NULL DEFAULT 'voluntario',
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Inserir o superusuário inicial
INSERT INTO public.users (name, email, password_hash, role) 
VALUES ('Super Administrador', 'superadmin@sanem.org', '123', 'superadmin');

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos os usuários autenticados vejam os dados dos usuários
-- (necessário para o sistema de login funcionar)
CREATE POLICY "Allow authenticated users to read users" 
  ON public.users 
  FOR SELECT 
  TO public
  USING (true);

-- Política para permitir inserção apenas para superadmins
CREATE POLICY "Only superadmins can insert users" 
  ON public.users 
  FOR INSERT 
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role = 'superadmin'
    )
  );

-- Política para permitir atualização apenas para superadmins
CREATE POLICY "Only superadmins can update users" 
  ON public.users 
  FOR UPDATE 
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role = 'superadmin'
    )
  );

-- Política para permitir exclusão apenas para superadmins
CREATE POLICY "Only superadmins can delete users" 
  ON public.users 
  FOR DELETE 
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role = 'superadmin'
    )
  );

-- Criar índice para melhorar performance das consultas por email
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
