
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Ensure we're aware of the global functions
declare global {
  interface Window {
    useTestAccount: () => void;
    fillTestAccount: () => void;
  }
}

export default function AuthPage() {
  const { currentUser, loginAsAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  
  // Redirect if already logged in
  if (currentUser) {
    return <Navigate to="/" />;
  }

  const handleTestAccountClick = () => {
    setActiveTab("login");
    // Use the appropriate function based on the active tab
    if (typeof window.useTestAccount === 'function') {
      window.useTestAccount();
    }
  };

  const handleDirectAdminLogin = async () => {
    setIsLoading(true);
    try {
      await loginAsAdmin();
    } catch (error) {
      console.error("Direct admin login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-recomendify-purple">Recomendify</h1>
          <p className="text-gray-600 mt-2">Descubra filmes, livros e jogos recomendados para você</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Criar conta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm />
              <div className="mt-4 text-center text-sm text-gray-500">
                <span>Não tem uma conta? </span>
                <button 
                  className="text-recomendify-purple hover:underline"
                  onClick={() => setActiveTab("register")}
                >
                  Criar conta
                </button>
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm />
              <div className="mt-4 text-center text-sm text-gray-500">
                <span>Já tem uma conta? </span>
                <button 
                  className="text-recomendify-purple hover:underline"
                  onClick={() => setActiveTab("login")}
                >
                  Entrar
                </button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-700 mb-2">Acesso de administrador sem verificação de email</p>
            <div className="space-y-2">
              <button 
                className="w-full py-2 px-4 bg-green-100 hover:bg-green-200 rounded text-sm text-gray-700 transition-colors border border-green-300"
                onClick={handleTestAccountClick}
              >
                Preencher como admin (admin@gmail.com / @admin123)
              </button>
              <button 
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded text-sm text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDirectAdminLogin}
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar diretamente como administrador"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
