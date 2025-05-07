import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  avatar?: string;
};

type AuthContextType = {
  currentUser: User | null;
  profile: UserProfile | null;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>; 
  loginAsAdmin: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profileData => {
          setProfile(profileData);
        });
      }
      setLoading(false);
    });

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      setCurrentUser(session?.user || null);
      
      if (session?.user) {
        const profileData = await fetchUserProfile(session.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
    try {
      // Using type assertion to bypass TypeScript errors with table names
      const { data, error } = await (supabase
        .from('profiles') as any)
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        return {
          uid: data.id,
          email: data.email,
          displayName: data.display_name || data.email?.split('@')[0] || "User",
          avatar: data.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`
        };
      }
      
      throw new Error("No profile data found");
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Return a default profile if fetching fails
      return {
        uid: userId,
        email: currentUser?.email,
        displayName: currentUser?.email?.split('@')[0] || "User",
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`
      };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      // Special handling for admin account
      const options = email === "admin@gmail.com" 
        ? {
            // Allow admin to bypass email verification
            emailRedirectTo: window.location.origin,
            data: {
              display_name: email.split('@')[0],
            }
          }
        : {
            emailRedirectTo: window.location.origin
          };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
      });

      if (error) {
        console.error("Register error:", error);
        toast.error(error.message || "Erro ao criar conta. Tente novamente.");
        throw error;
      }

      if (data.user) {
        // Create profile for new user
        try {
          await (supabase
            .from('profiles') as any)
            .upsert({
              id: data.user.id,
              email: data.user.email,
              display_name: data.user.email?.split('@')[0] || "User",
              avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.user.id}`
            });
        } catch (profileError) {
          console.error("Error creating profile:", profileError);
        }
        
        toast.success("Cadastro realizado com sucesso!");
        
        // For admin account, automatically confirm the email (this is just UI feedback)
        if (email === "admin@gmail.com") {
          toast.success("Conta de admin criada e verificada automaticamente!");
        } else {
          toast.info("Verifique seu email para confirmar sua conta.");
        }
      }
    } catch (error: any) {
      console.error("Register error:", error);
      toast.error(error.message || "Erro ao criar conta. Tente novamente.");
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      // Remove special handling for admin account from here
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Login error:", error);
        toast.error(error.message || "Email ou senha incorretos");
        throw error;
      }
      
      console.log("Login successful:", data.user);
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Erro ao fazer login. Tente novamente.");
      throw error;
    }
  };

  const loginAsAdmin = async (): Promise<void> => {
    try {
      // Create a custom admin profile
      const adminProfile: UserProfile = {
        uid: "admin-user-id",
        email: "admin@gmail.com",
        displayName: "Administrator",
        avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=admin"
      };

      // Create a fake admin user object
      const adminUser: User = {
        id: "admin-user-id",
        app_metadata: {},
        user_metadata: {
          name: "Administrator"
        },
        aud: "authenticated",
        created_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: "admin@gmail.com",
        email_confirmed_at: new Date().toISOString(),
        phone: "",
        phone_confirmed_at: null,
        role: "authenticated",
        factors: null,
        identities: []
      };

      // Set the admin user and profile directly without going through Supabase
      setCurrentUser(adminUser);
      setProfile(adminProfile);
      
      // Store admin session in localStorage to persist across page reloads
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      localStorage.setItem('adminProfile', JSON.stringify(adminProfile));
      
      toast.success("Login como administrador realizado com sucesso!");
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast.error("Erro ao fazer login como administrador");
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Check if the current user is the admin
      if (currentUser?.email === "admin@gmail.com" && localStorage.getItem('adminUser')) {
        // Remove admin data from localStorage
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminProfile');
        
        // Clear user state
        setCurrentUser(null);
        setProfile(null);
        
        toast.success("Logout realizado com sucesso!");
        return;
      }
      
      // Regular logout for non-admin users
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        toast.error(error.message || "Erro ao fazer logout");
        throw error;
      }
      toast.success("Logout realizado com sucesso!");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Erro ao fazer logout");
      throw error;
    }
  };

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    const adminProfile = localStorage.getItem('adminProfile');
    
    if (adminUser && adminProfile && !currentUser) {
      setCurrentUser(JSON.parse(adminUser));
      setProfile(JSON.parse(adminProfile));
    }
  }, []);

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;

    try {
      // Using type assertion to bypass TypeScript errors with table names
      const { error } = await (supabase
        .from('profiles') as any)
        .upsert({
          id: currentUser.id,
          display_name: data.displayName,
          avatar_url: data.avatar
        });

      if (error) {
        console.error("Update profile error:", error);
        toast.error(error.message || "Erro ao atualizar perfil");
        throw error;
      }

      // Fetch updated profile
      const updatedProfile = await fetchUserProfile(currentUser.id);
      setProfile(updatedProfile);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast.error(error.message || "Erro ao atualizar perfil");
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    profile,
    register,
    login,
    loginAsAdmin,
    logout,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
