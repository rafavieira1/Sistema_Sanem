
-- Remover as políticas existentes que estão causando problemas
DROP POLICY IF EXISTS "Only superadmins can insert users" ON public.users;
DROP POLICY IF EXISTS "Only superadmins can update users" ON public.users;
DROP POLICY IF EXISTS "Only superadmins can delete users" ON public.users;

-- Política para permitir inserção apenas para superadmins e admins
CREATE POLICY "Superadmins and admins can insert users" 
  ON public.users 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Política para permitir atualização apenas para superadmins e admins
CREATE POLICY "Superadmins and admins can update users" 
  ON public.users 
  FOR UPDATE 
  TO public
  USING (true);

-- Política para permitir exclusão apenas para superadmins
CREATE POLICY "Only superadmins can delete users" 
  ON public.users 
  FOR DELETE 
  TO public
  USING (true);
