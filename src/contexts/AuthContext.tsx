import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole, AuthContextType } from "@/types";
import { ROLE_PERMISSIONS, STORAGE_KEYS } from "@/constants";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const userWithPermissions: User = {
          ...parsedUser,
          permissions: ROLE_PERMISSIONS[parsedUser.role as UserRole] || ROLE_PERMISSIONS.voluntario
        };
        setUser(userWithPermissions);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log("Tentando fazer login com:", email);
      
      // Buscar usuário no Supabase
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password)
        .eq('status', 'ativo')
        .single();

      if (error) {
        console.error("Erro na consulta:", error);
        return false;
      }

      if (!userData) {
        console.log("Usuário não encontrado");
        return false;
      }

      console.log("Usuário encontrado:", userData);

      // Atualizar último login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      const userWithPermissions: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as UserRole,
        permissions: ROLE_PERMISSIONS[userData.role as UserRole]
      };

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, "jwt_token_" + userData.id);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userWithPermissions));
      setUser(userWithPermissions);
      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
