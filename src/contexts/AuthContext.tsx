
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "superadmin" | "admin" | "voluntario";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const rolePermissions: Record<UserRole, string[]> = {
  superadmin: [
    "view_all_reports",
    "generate_reports", 
    "manage_users",
    "manage_volunteers",
    "manage_beneficiaries",
    "manage_donations",
    "manage_stock",
    "manage_distributions",
    "view_dashboard",
    "system_settings"
  ],
  admin: [
    "view_reports",
    "generate_reports",
    "manage_beneficiaries", 
    "manage_donations",
    "manage_stock",
    "manage_distributions",
    "view_dashboard"
  ],
  voluntario: [
    "manage_beneficiaries",
    "manage_donations", 
    "register_distributions",
    "view_dashboard"
  ]
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sanem_token");
    const userData = localStorage.getItem("sanem_user");
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const userWithPermissions = {
          ...parsedUser,
          permissions: rolePermissions[parsedUser.role] || rolePermissions.voluntario
        };
        setUser(userWithPermissions);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        localStorage.removeItem("sanem_token");
        localStorage.removeItem("sanem_user");
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
        permissions: rolePermissions[userData.role as UserRole]
      };

      localStorage.setItem("sanem_token", "jwt_token_" + userData.id);
      localStorage.setItem("sanem_user", JSON.stringify(userWithPermissions));
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
    localStorage.removeItem("sanem_token");
    localStorage.removeItem("sanem_user");
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
